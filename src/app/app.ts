import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NotificationService } from './services/notification.service';
import { SyncService } from './services/sync.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <a routerLink="/" class="brand">UTEQGram</a>

      <nav class="nav-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          Inicio
        </a>
        <a routerLink="/help" routerLinkActive="active">Ayuda</a>

        @if (canInstall()) {
          <button type="button" class="btn-install" (click)="installPwa()">Instalar</button>
        }

        @if (notificationService.isSupported) {
          <button type="button" class="btn-notif" (click)="notificationService.requestPermission()">
            {{
              notificationService.permission() === 'granted'
                ? 'Notificaciones ✓'
                : 'Activar Notificaciones'
            }}
          </button>
        }
      </nav>
    </header>

    @if (!syncService.isOnline()) {
      <div class="offline-bar">
        Modo sin conexión: consultando datos locales. Las nuevas publicaciones se sincronizarán al
        volver el internet.
      </div>
    }

    <main>
      <router-outlet />
    </main>
  `,
  styles: `
    .navbar {
      background: #3f51b5;
      color: #fff;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      position: sticky;
      top: 0;
      z-index: 800;
    }
    .brand {
      color: #fff;
      text-decoration: none;
      font-size: 20px;
      font-weight: 700;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }
    .nav-links a {
      color: rgba(255, 255, 255, 0.85);
      text-decoration: none;
      font-weight: 500;
    }
    .nav-links a.active {
      color: #fff;
      border-bottom: 2px solid #ff4081;
      padding-bottom: 2px;
    }
    .btn-notif,
    .btn-install {
      border: none;
      padding: 7px 12px;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      font-size: 13px;
    }
    .btn-notif {
      background: #ff4081;
      color: #fff;
    }
    .btn-install {
      background: #fff;
      color: #3f51b5;
    }
    .offline-bar {
      background: #d32f2f;
      color: #fff;
      text-align: center;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 500;
    }
  `,
})
export class App implements OnInit {
  readonly notificationService = inject(NotificationService);
  readonly syncService = inject(SyncService);

  private deferredPrompt: any = null;
  readonly canInstall = signal(false);

  ngOnInit(): void {
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.deferredPrompt = event;
      this.canInstall.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.canInstall.set(false);
    });
  }

  async installPwa(): Promise<void> {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.canInstall.set(false);
  }
}
