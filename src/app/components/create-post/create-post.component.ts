import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  Output,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SyncService } from '../../services/sync.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="modal-backdrop" (click)="close()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Nuevo Momento</h2>
          <button type="button" class="close-btn" (click)="close()">✕</button>
        </div>

        <div class="media-box">
          <video #videoPlayer autoplay playsinline [hidden]="!cameraActive()"></video>
          <canvas #canvasElement width="320" height="240" [hidden]="!photoCaptured()"></canvas>

          @if (previewUrl() && !photoCaptured()) {
            <img [src]="previewUrl()" alt="Vista previa" class="preview-img" />
          }

          <div class="camera-actions">
            @if (cameraActive()) {
              <button type="button" class="btn-primary" (click)="capturePhoto()">
                Capturar foto
              </button>
            } @else {
              <button type="button" class="btn-secondary" (click)="startCamera()">
                Usar cámara
              </button>
            }

            <label class="file-label">
              Elegir de galería
              <input type="file" accept="image/*" (change)="onFileSelected($event)" hidden />
            </label>
          </div>

          @if (cameraError()) {
            <p class="hint">{{ cameraError() }}</p>
          }
        </div>

        <form (ngSubmit)="onSubmit()" class="post-form">
          <label>
            Título
            <input
              type="text"
              name="title"
              [(ngModel)]="title"
              placeholder="Ej. Tarde en la biblioteca"
              required
            />
          </label>

          <label>
            Ubicación
            <input
              type="text"
              name="location"
              [(ngModel)]="location"
              placeholder="Ej. Edificio K, UTEQ"
              required
            />
          </label>

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="close()">Cancelar</button>
            <button type="submit" class="btn-accent" [disabled]="submitting()">
              {{ submitting() ? 'Guardando...' : 'Publicar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: `
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
    }
    .modal-card {
      background: #fff;
      width: 100%;
      max-width: 460px;
      max-height: 92vh;
      overflow-y: auto;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .modal-header h2 {
      margin: 0;
      font-size: 20px;
      color: #3f51b5;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #555;
    }
    .media-box {
      text-align: center;
      margin-bottom: 16px;
    }
    video,
    canvas,
    .preview-img {
      width: 100%;
      max-height: 240px;
      object-fit: cover;
      border-radius: 6px;
      background: #000;
      margin-bottom: 10px;
    }
    .camera-actions {
      display: flex;
      gap: 8px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .file-label {
      display: inline-block;
      padding: 8px 14px;
      background: #e8eaf6;
      color: #3f51b5;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      font-size: 14px;
    }
    .hint {
      font-size: 12px;
      color: #666;
      margin-top: 8px;
    }
    .post-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .post-form label {
      display: flex;
      flex-direction: column;
      font-size: 14px;
      font-weight: 500;
      color: #333;
      gap: 4px;
    }
    .post-form input {
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 15px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 8px;
    }
    .btn-primary,
    .btn-secondary,
    .btn-accent {
      border: none;
      padding: 9px 16px;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-primary {
      background: #3f51b5;
      color: #fff;
    }
    .btn-secondary {
      background: #e0e0e0;
      color: #333;
    }
    .btn-accent {
      background: #ff4081;
      color: #fff;
    }
    .btn-accent:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `,
})
export class CreatePostComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<string>();

  private readonly syncService = inject(SyncService);

  title = '';
  location = '';
  picture: Blob | null = null;

  readonly cameraActive = signal(false);
  readonly photoCaptured = signal(false);
  readonly cameraError = signal('');
  readonly previewUrl = signal<string | null>(null);
  readonly submitting = signal(false);

  ngAfterViewInit(): void {
    this.startCamera();
  }

  ngOnDestroy(): void {
    this.stopCamera();
    if (this.previewUrl()) {
      URL.revokeObjectURL(this.previewUrl()!);
    }
  }

  async startCamera(): Promise<void> {
    this.cameraError.set('');
    this.photoCaptured.set(false);
    this.previewUrl.set(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.cameraError.set('Cámara no disponible; selecciona una foto de tu galería.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      this.videoPlayer.nativeElement.srcObject = stream;
      this.cameraActive.set(true);
    } catch {
      this.cameraError.set('No se pudo abrir la cámara; puedes elegir una imagen de tu galería.');
      this.cameraActive.set(false);
    }
  }

  capturePhoto(): void {
    const video = this.videoPlayer.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (context) {
      const height =
        video.videoWidth > 0
          ? video.videoHeight / (video.videoWidth / canvas.width)
          : canvas.height;
      canvas.height = height || 240;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          this.picture = blob;
        },
        'image/jpeg',
        0.85,
      );
    }

    this.stopCamera();
    this.photoCaptured.set(true);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.stopCamera();
      this.photoCaptured.set(false);
      this.picture = input.files[0];

      if (this.previewUrl()) {
        URL.revokeObjectURL(this.previewUrl()!);
      }
      this.previewUrl.set(URL.createObjectURL(input.files[0]));
    }
  }

  stopCamera(): void {
    const video = this.videoPlayer?.nativeElement;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
    this.cameraActive.set(false);
  }

  async onSubmit(): Promise<void> {
    const cleanTitle = this.title.trim();
    const cleanLocation = this.location.trim();

    if (!cleanTitle || !cleanLocation) {
      alert('Por favor ingresa título y ubicación válidos.');
      return;
    }

    this.submitting.set(true);
    this.stopCamera();

    try {
      const result = await this.syncService.submitPost(cleanTitle, cleanLocation, this.picture);
      const msg =
        result === 'published'
          ? '¡Publicación compartida en UTEQGram!'
          : 'Guardado en cola offline. Se subirá al recuperar internet.';
      this.submitted.emit(msg);
      this.closed.emit();
    } finally {
      this.submitting.set(false);
    }
  }

  close(): void {
    this.stopCamera();
    this.closed.emit();
  }
}
