import { Component, OnInit, inject, signal } from '@angular/core';
import { PostService } from '../../services/post.service';
import { SyncService } from '../../services/sync.service';
import { CreatePostComponent } from '../../components/create-post/create-post.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CreatePostComponent],
  template: `
    <section class="hero">
      <img src="/images/main-image-lg.jpg" alt="Campus UTEQ" class="hero-img" />
      <div class="hero-overlay">
        <h1>Comparte tus Momentos</h1>
        <p>Comunidad Universitaria UTEQ</p>
      </div>
    </section>

    <div class="container">
      @if (syncService.pendingCount() > 0) {
        <div class="sync-banner">
          <span>
            Tienes {{ syncService.pendingCount() }} publicación(es) pendiente(s) de sincronizar.
          </span>
          @if (syncService.isOnline()) {
            <button
              type="button"
              class="btn-sync"
              [disabled]="syncService.isSyncing()"
              (click)="syncService.syncPendingPosts()"
            >
              {{ syncService.isSyncing() ? 'Sincronizando...' : 'Sincronizar ahora' }}
            </button>
          }
        </div>
      }

      @if (postService.loading() && postService.posts().length === 0) {
        <p class="status-msg">Cargando momentos del campus...</p>
      } @else if (postService.posts().length === 0) {
        <p class="status-msg">
          Aún no hay publicaciones. ¡Toca el botón + para compartir la primera!
        </p>
      } @else {
        <div class="cards-grid">
          @for (post of postService.posts(); track post.id) {
            <article class="post-card">
              <div class="card-img-wrapper">
                <img
                  [src]="post.image"
                  [alt]="post.title"
                  loading="lazy"
                  (error)="onImageError($event)"
                />
                <h2 class="card-title">{{ post.title }}</h2>
              </div>
              <div class="card-location">{{ post.location }}</div>
            </article>
          }
        </div>
      }
    </div>

    <button
      type="button"
      class="fab"
      aria-label="Nueva publicación"
      (click)="showCreateModal.set(true)"
    >
      +
    </button>

    @if (showCreateModal()) {
      <app-create-post (closed)="showCreateModal.set(false)" (submitted)="showToast($event)" />
    }

    @if (toastMessage()) {
      <div class="toast">{{ toastMessage() }}</div>
    }
  `,
  styles: `
    .hero {
      position: relative;
      height: 220px;
      overflow: hidden;
      background: #3f51b5;
    }
    .hero-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.65);
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
      text-align: center;
      padding: 16px;
    }
    .hero-overlay h1 {
      margin: 0;
      font-size: 28px;
    }
    .hero-overlay p {
      margin: 6px 0 0;
      opacity: 0.9;
    }
    .container {
      max-width: 960px;
      margin: 24px auto 90px;
      padding: 0 16px;
    }
    .sync-banner {
      background: #fff3e0;
      border-left: 4px solid #ff9800;
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .btn-sync {
      background: #ff9800;
      color: #fff;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
    }
    .status-msg {
      text-align: center;
      color: #666;
      padding: 32px 0;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .post-card {
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    }
    .card-img-wrapper {
      position: relative;
      height: 200px;
      background: #e0e0e0;
    }
    .card-img-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .card-title {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      margin: 0;
      padding: 12px 14px;
      font-size: 18px;
      color: #fff;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.72));
    }
    .card-location {
      padding: 12px 14px;
      text-align: center;
      color: #555;
      font-size: 14px;
    }
    .fab {
      position: fixed;
      right: 24px;
      bottom: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      background: #ff4081;
      color: #fff;
      font-size: 32px;
      line-height: 1;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      z-index: 900;
    }
    .toast {
      position: fixed;
      left: 50%;
      bottom: 24px;
      transform: translateX(-50%);
      background: #323232;
      color: #fff;
      padding: 12px 20px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      z-index: 1100;
      max-width: 90%;
      text-align: center;
    }
  `,
})
export class FeedComponent implements OnInit {
  readonly postService = inject(PostService);
  readonly syncService = inject(SyncService);

  readonly showCreateModal = signal(false);
  readonly toastMessage = signal('');

  ngOnInit(): void {
    this.postService.loadPosts();
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.includes('/images/sf-boat.jpg')) {
      img.src = '/images/sf-boat.jpg';
    }
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(''), 4000);
  }
}
