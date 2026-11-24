import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found">
      <h1>404</h1>
      <h2>Página no encontrada</h2>
      <p>La ruta que buscas no existe en UTEQGram.</p>
      <a routerLink="/" class="btn-home">Ir al inicio</a>
    </div>
  `,
  styles: `
    .not-found {
      max-width: 420px;
      margin: 64px auto;
      background: #fff;
      padding: 32px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    }
    h1 {
      margin: 0;
      font-size: 56px;
      color: #3f51b5;
    }
    .btn-home {
      display: inline-block;
      margin-top: 16px;
      background: #ff4081;
      color: #fff;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px;
      font-weight: 600;
    }
  `,
})
export class NotFoundComponent {}
