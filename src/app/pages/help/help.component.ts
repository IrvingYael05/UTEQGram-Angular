import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="help-container">
      <h1>¿Cómo funciona UTEQGram?</h1>
      <p class="subtitle">
        Comparte los mejores momentos dentro del campus en tiempo real o sin conexión.
      </p>

      <div class="help-grid">
        <div class="help-card">
          <h3>Modo Offline</h3>
          <p>
            El Service Worker de Angular (NGSW) almacena la interfaz y los datos en caché, mientras
            IndexedDB conserva tus publicaciones para consultarlas aunque pierdas señal en el
            campus.
          </p>
        </div>

        <div class="help-card">
          <h3>Cámara y Subida</h3>
          <p>
            Usa la cámara del dispositivo mediante MediaDevices API o elige una fotografía desde tu
            galería para subirla directamente a Firebase Cloud Storage.
          </p>
        </div>

        <div class="help-card">
          <h3>Sincronización Automática</h3>
          <p>
            Si publicas sin internet, tu momento (incluyendo la foto) se guarda en la cola local
            <code>sync-post</code> y se sube automáticamente al recuperar conexión.
          </p>
        </div>

        <div class="help-card">
          <h3>Notificaciones</h3>
          <p>
            Activa las notificaciones desde la barra superior para recibir avisos cada vez que una
            publicación se comparta o se sincronice con el servidor.
          </p>
        </div>
      </div>

      <div class="actions">
        <a routerLink="/" class="btn-back">Volver al Feed</a>
      </div>
    </div>
  `,
  styles: `
    .help-container {
      max-width: 900px;
      margin: 32px auto;
      padding: 0 16px;
      text-align: center;
    }
    h1 {
      color: #3f51b5;
      margin-bottom: 8px;
    }
    .subtitle {
      color: #555;
      margin-bottom: 28px;
    }
    .help-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      text-align: left;
    }
    .help-card {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    .help-card h3 {
      margin-top: 0;
      color: #3f51b5;
    }
    .help-card p {
      color: #444;
      font-size: 14px;
      line-height: 1.5;
    }
    .actions {
      margin-top: 28px;
    }
    .btn-back {
      display: inline-block;
      background: #ff4081;
      color: #fff;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px;
      font-weight: 600;
    }
  `,
})
export class HelpComponent {}
