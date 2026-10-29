import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader,
  IonLabel, IonRefresher, IonRefresherContent, IonSegment, IonSegmentButton, IonTitle, IonToolbar, ToastController,
} from '@ionic/angular';
import { RefresherCustomEvent } from '@ionic/core';
import { ApiService } from '../../core/api.service';
import { errorMessage } from '../../core/errors';
import { EstadoPedido, Pedido } from '../../core/models';

@Component({
  selector: 'app-cocina',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardHeader,
    IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonRefresher, IonRefresherContent,
  ],
  template: `
    <ion-header>
      <ion-toolbar><ion-title>Cocina</ion-title></ion-toolbar>
      <ion-toolbar>
        <ion-segment [value]="columna()" (ionChange)="columna.set($any($event).detail.value)">
          <ion-segment-button value="pendiente"><ion-label>Pendientes ({{ cuenta().pendiente }})</ion-label></ion-segment-button>
          <ion-segment-button value="preparacion"><ion-label>Preparando ({{ cuenta().preparacion }})</ion-label></ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="refrescar($event)"><ion-refresher-content /></ion-refresher>

      @for (p of visibles(); track p.id) {
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>⏱ {{ minutos(p) }} min · {{ p.usuario?.username ?? '' }}</ion-card-subtitle>
            <ion-card-title>#{{ p.id }} · {{ p.mesa ? 'Mesa ' + p.mesa.numero_mesa : 'Para llevar' }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            @for (d of p.detalles ?? []; track d.id) {
              <div><strong>{{ d.cantidad }}×</strong> {{ d.producto?.nombre ?? 'Producto eliminado' }}</div>
            }
            <ion-button expand="block" class="boton" [disabled]="trabajando() === p.id" (click)="avanzar(p)">
              {{ columna() === 'pendiente' ? 'Empezar a preparar' : 'Listo para entregar' }}
            </ion-button>
          </ion-card-content>
        </ion-card>
      } @empty {
        <div class="vacio">{{ error() || (columna() === 'pendiente' ? 'No hay pedidos pendientes 🎉' : 'Nada en preparación.') }}</div>
      }
    </ion-content>
  `,
  styles: `
    .boton { margin-top: 12px; }
    .vacio { padding: 48px 24px; text-align: center; color: var(--ion-color-medium); }
  `,
})
export class CocinaPage {
  private api = inject(ApiService);
  private toast = inject(ToastController);
  private timer?: ReturnType<typeof setInterval>;

  pedidos = signal<Pedido[]>([]);
  columna = signal<'pendiente' | 'preparacion'>('pendiente');
  trabajando = signal<number | null>(null);
  error = signal('');
  ahora = signal(Date.now());

  cuenta = computed(() => ({
    pendiente: this.pedidos().filter((p) => p.estado === 'pendiente').length,
    preparacion: this.pedidos().filter((p) => p.estado === 'preparacion').length,
  }));

  // Los más antiguos primero
  visibles = computed(() =>
    this.pedidos()
      .filter((p) => p.estado === this.columna())
      .sort((a, b) => a.id - b.id),
  );

  // Se refresca solo mientras la pestaña está visible
  ionViewWillEnter() {
    this.cargar();
    this.timer = setInterval(() => this.cargar(), 10000);
  }

  ionViewWillLeave() {
    clearInterval(this.timer);
  }

  minutos(p: Pedido): number {
    const desde = new Date(p.fecha_pedido ?? p.created_at).getTime();
    return Math.max(0, Math.floor((this.ahora() - desde) / 60000));
  }

  cargar() {
    return new Promise<void>((resolve) => {
      this.api.pedidos(['pendiente', 'preparacion']).subscribe({
        next: (data) => {
          this.pedidos.set(data);
          this.ahora.set(Date.now());
          this.error.set('');
          resolve();
        },
        error: (e) => {
          this.error.set(errorMessage(e, 'No se pudieron cargar los pedidos.'));
          resolve();
        },
      });
    });
  }

  async refrescar(event: RefresherCustomEvent) {
    await this.cargar();
    event.target.complete();
  }

  avanzar(p: Pedido) {
    const siguiente: EstadoPedido = p.estado === 'pendiente' ? 'preparacion' : 'entregado';
    this.trabajando.set(p.id);
    this.api.cambiarEstado(p.id, siguiente).subscribe({
      next: async () => {
        await this.cargar();
        this.trabajando.set(null);
      },
      error: async (e) => {
        this.trabajando.set(null);
        (await this.toast.create({ message: errorMessage(e), duration: 3000, color: 'danger' })).present();
      },
    });
  }
}
