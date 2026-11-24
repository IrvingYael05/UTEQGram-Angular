
# UTEQGram — PWA en Angular 20

Aplicación Web Progresiva (PWA) desarrollada en **Angular 20** con `@angular/pwa` y **Firebase**, enfocada en capturar y compartir momentos del campus universitario de la Universidad Tecnológica de Querétaro (UTEQ) con soporte offline, acceso a cámara y notificaciones nativas.

## Enlaces del Proyecto

- **Aplicación en producción (Angular):** https://uteqgram-431f3.web.app/
- **Repositorio Angular:** https://github.com/IrvingYael05/UTEQGram-Angular.git
- **Versión base sin frameworks (Vanilla JS):** https://uteqgram-24428.web.app/ ([Repositorio Vanilla](https://github.com/IrvingYael05/UTEQGram-Vanilla.git))

## Características Implementadas

- **Arquitectura Modular (Standalone Components):** Pantallas de Inicio/Feed (`/`), Ayuda (`/help`) y manejo de rutas inexistentes (`**`), renderizadas del lado del cliente (CSR).
- **Instalable (PWA):** Manifiesto completo (`manifest.webmanifest`) con juego de íconos de 72x72 a 512x512 y captura del evento `beforeinstallprompt` para instalación directa desde la barra de navegación.
- **Service Worker de Angular (`ngsw-worker.js`):** Pre-caché del App Shell y recursos estáticos (`prefetch`), estrategia `freshness` para Firebase Realtime Database y estrategia `performance` con soporte de respuestas opacas (`cacheOpaqueResponses: true`) para imágenes de Firebase Cloud Storage.
- **Datos Locales y Sincronización Offline:** Persistencia en **IndexedDB** (`uteqgram-angular-store`) mediante la librería `idb` v8 con almacenes `post` (feed local) y `sync-post` (cola offline de publicaciones y archivos `Blob`). Al recuperar conectividad (`online`), las publicaciones pendientes se suben automáticamente.
- **Acceso a Hardware (Cámara):** Captura fotográfica directa con `MediaDevices API` (`getUserMedia`) y `<canvas>` (compresión JPEG 0.85), liberación automática de cámara al cerrar y respaldo por galería (`<input type="file">`).
- **Notificaciones:** Gestión de permisos con `Notification API` y despliegue vía `ServiceWorkerRegistration.showNotification` al activar avisos, publicar o sincronizar momentos.

## Tecnologías Utilizadas

- **Frontend:** Angular 20.3 (`@angular/core`, `@angular/router`, `@angular/forms`, `@angular/service-worker`), TypeScript 5.9, RxJS.
- **Almacenamiento Local:** IndexedDB (`idb` 8.0.4).
- **Backend y Despliegue:** Firebase Realtime Database, Firebase Cloud Storage y Firebase Hosting (HTTPS).

## Estructura del Proyecto

```text
pwa-angular/
├── public/
│   ├── icons/                      # Íconos PWA (72x72 a 512x512)
│   ├── images/                     # Imágenes locales y respaldo offline
│   ├── favicon.ico
│   └── manifest.webmanifest        # Manifiesto Web App
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── create-post/        # Modal de publicación + cámara
│   │   ├── models/
│   │   │   └── post.model.ts       # Interfaces Post y SyncPost
│   │   ├── pages/
│   │   │   ├── feed/               # Pantalla Home (CSR)
│   │   │   ├── help/               # Pantalla secundaria de ayuda
│   │   │   └── not-found/          # Vista 404
│   │   ├── services/
│   │   │   ├── indexed-db.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── post.service.ts
│   │   │   └── sync.service.ts
│   │   ├── app.config.ts           # Providers (Router, HttpClient, ServiceWorker)
│   │   ├── app.routes.ts           # Rutas de la SPA
│   │   └── app.ts                  # Shell principal, navbar y prompt de instalación
│   ├── index.html
│   └── styles.css
├── firebase.json                   # Configuración de Hosting SPA (sitio uteqgram-431f3)
├── ngsw-config.json                # Reglas de caché del Service Worker de Angular
└── package.json
```

## Instalación y Ejecución Local

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/IrvingYael05/UTEQGram-Angular.git
cd UTEQGram-Angular
npm install
```

### 2. Modo desarrollo (sin Service Worker activo)

```bash
npm start
```

### 3. Modo producción local (con Service Worker y soporte offline activo)

```bash
npm run build
npx http-server dist/pwa-angular/browser -p 8080 -c-1
```

### 4. Despliegue en Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

## Autor

**Irving Yael Vázquez Serrano**

Ingeniería en Desarrollo y Gestión de Software — Universidad Tecnológica de Querétaro (UTEQ)
