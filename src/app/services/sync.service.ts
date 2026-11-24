import { Injectable, inject, signal } from '@angular/core';
import { IndexedDbService } from './indexed-db.service';
import { PostService } from './post.service';
import { NotificationService } from './notification.service';
import { SyncPost } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private readonly idb = inject(IndexedDbService);
  private readonly postService = inject(PostService);
  private readonly notifications = inject(NotificationService);

  readonly isOnline = signal<boolean>(navigator.onLine);
  readonly pendingCount = signal<number>(0);
  readonly isSyncing = signal<boolean>(false);

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline.set(true);
      this.syncPendingPosts();
    });

    window.addEventListener('offline', () => {
      this.isOnline.set(false);
    });

    this.refreshPendingCount();
    if (navigator.onLine) {
      this.syncPendingPosts();
    }
  }

  async refreshPendingCount(): Promise<void> {
    const pending = await this.idb.readAllData('sync-post');
    this.pendingCount.set(pending.length);
  }

  async submitPost(
    title: string,
    location: string,
    picture: Blob | null,
  ): Promise<'published' | 'queued'> {
    const id = new Date().toISOString();

    if (navigator.onLine) {
      try {
        await this.postService.sendPostToFirebase(id, title, location, picture);
        await this.postService.loadPosts();
        await this.notifications.showNotification(
          'Momento publicado',
          `Tu publicación "${title}" ya está visible en UTEQGram.`,
        );
        return 'published';
      } catch (err) {
        console.warn('Falló envío en línea, guardando en cola offline:', err);
      }
    }

    const pendingPost: SyncPost = { id, title, location, picture };
    await this.idb.writeData('sync-post', pendingPost);
    await this.refreshPendingCount();

    await this.notifications.showNotification(
      'Publicación en cola',
      `Tu publicación "${title}" se subirá automáticamente al recuperar conexión.`,
    );
    return 'queued';
  }

  async syncPendingPosts(): Promise<void> {
    if (!navigator.onLine || this.isSyncing()) return;

    const pending = await this.idb.readAllData('sync-post');
    if (pending.length === 0) return;

    this.isSyncing.set(true);
    let syncedAny = false;

    try {
      for (const item of pending) {
        try {
          await this.postService.sendPostToFirebase(
            item.id,
            item.title,
            item.location,
            item.picture,
          );
          await this.idb.deleteItem('sync-post', item.id);
          syncedAny = true;

          await this.notifications.showNotification(
            'Momento sincronizado',
            `Tu publicación "${item.title}" ya se sincronizó en UTEQGram.`,
          );
        } catch (err) {
          console.error('No se pudo sincronizar el post:', item.id, err);
        }
      }

      await this.refreshPendingCount();
      if (syncedAny) {
        await this.postService.loadPosts();
      }
    } finally {
      this.isSyncing.set(false);
    }
  }
}
