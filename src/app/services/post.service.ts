import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Post } from '../models/post.model';
import { IndexedDbService } from './indexed-db.service';

interface StorageUploadResponse {
  name: string;
  downloadTokens: string;
}

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly http = inject(HttpClient);
  private readonly idb = inject(IndexedDbService);

  private readonly dbUrl = 'https://uteqgram-24428-default-rtdb.firebaseio.com/post.json';
  private readonly storageBucket = 'uteqgram-24428.firebasestorage.app';

  readonly posts = signal<Post[]>([]);
  readonly loading = signal<boolean>(false);

  async loadPosts(): Promise<void> {
    this.loading.set(true);
    let networkDataReceived = false;

    // 1. Cargar copia local de IndexedDB de inmediato
    const cachedPosts = await this.idb.readAllData('post');
    if (cachedPosts.length > 0 && !networkDataReceived) {
      this.posts.set(cachedPosts.reverse());
    }

    // 2. Consultar red (Firebase Realtime Database)
    try {
      const data = await firstValueFrom(this.http.get<Record<string, Post> | null>(this.dbUrl));
      networkDataReceived = true;

      const remotePosts: Post[] = [];
      if (data) {
        for (const key of Object.keys(data)) {
          const item = data[key];
          if (item && item.id) {
            remotePosts.push({
              id: item.id,
              title: item.title,
              location: item.location,
              image:
                typeof item.image === 'string' && item.image.trim() !== ''
                  ? item.image
                  : '/images/sf-boat.jpg',
            });
          }
        }
      }

      this.posts.set([...remotePosts].reverse());

      // Actualizar caché local en IndexedDB
      await this.idb.clearAllData('post');
      for (const post of remotePosts) {
        await this.idb.writeData('post', post);
      }
    } catch (err) {
      console.warn('Sin conexión o error de red; mostrando datos locales:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async uploadImageToStorage(file: Blob | null, postId: string): Promise<string> {
    if (!file) {
      return '/images/sf-boat.jpg';
    }

    const fileName = encodeURIComponent(`posts/${postId}.jpg`);
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${this.storageBucket}/o?uploadType=media&name=${fileName}`;

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'image/jpeg',
      },
      body: file,
    });

    if (!res.ok) {
      throw new Error(`Error subiendo imagen a Storage: ${res.status}`);
    }

    const data: StorageUploadResponse = await res.json();
    return `https://firebasestorage.googleapis.com/v0/b/${this.storageBucket}/o/${encodeURIComponent(data.name)}?alt=media&token=${data.downloadTokens}`;
  }

  async sendPostToFirebase(
    id: string,
    title: string,
    location: string,
    picture: Blob | null,
  ): Promise<void> {
    const imageUrl = await this.uploadImageToStorage(picture, id);

    const payload: Post = {
      id,
      title,
      location,
      image: imageUrl,
    };

    await firstValueFrom(this.http.post(this.dbUrl, payload));
  }
}
