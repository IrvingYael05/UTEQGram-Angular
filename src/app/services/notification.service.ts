import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly isSupported = 'Notification' in window;
  readonly permission = signal<NotificationPermission>(
    this.isSupported ? Notification.permission : 'denied',
  );

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) return 'denied';

    const result = await Notification.requestPermission();
    this.permission.set(result);

    if (result === 'granted') {
      await this.showNotification(
        '¡Notificaciones activadas!',
        'Las notificaciones de UTEQGram están activas.',
      );
    }
    return result;
  }

  async showNotification(title: string, body: string): Promise<void> {
    if (!this.isSupported || Notification.permission !== 'granted') return;

    const options: NotificationOptions = {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      dir: 'ltr',
      lang: 'es-MX',
      tag: 'uteqgram-notification',
    };

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.showNotification(title, options);
        return;
      }
    }

    // Respaldo para pruebas en modo desarrollo (ng serve)
    new Notification(title, options);
  }
}
