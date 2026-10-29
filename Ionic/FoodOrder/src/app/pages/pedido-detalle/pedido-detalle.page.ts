import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import {
  AlertController, IonBackButton, IonBadge, IonButton, IonButtons, IonContent, IonHeader, IonItem,
  IonLabel, IonList, IonListHeader, IonNote, IonSpinner, IonTitle, IonToolbar, ToastController,
} from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { errorMessage } from '../../core/errors';
import { COLOR_ESTADO, ESTADOS, EstadoPedido, Pedido, nombreCompleto } from '../../core/models';

const SIGUIENTE: Partial<Record<EstadoPedido, { estado: EstadoPedido; texto: string }>> = {
  pendiente: { estado: 'preparacion', texto: 'Enviar a preparación' },
  preparacion: { estado: 'entregado', texto: 'Marcar como entregado' },
  entregado: { estado: 'pagado', texto: 'Cobrar y cerrar pedido' },
};

@Component({
  selector: 'app-pedido-detalle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe, DatePipe, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonList,
    IonListHeader, IonItem, IonLabel, IonNote, IonBadge, IonButton, IonSpinner,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/pedidos" text="Atrás" /></ion-buttons>
        <ion-title>Pedido #{{ id() }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      @if (cargando()) {
        <div class="centro"><ion-spinner /></div>
      } @else if (pedido(); as p) {
        <ion-list [inset]="true">
          <ion-item>
            <ion-label>Estado</ion-label>
            <ion-badge slot="end" [color]="color()">{{ etiqueta() }}</ion-badge>
          </ion-item>
          <ion-item><ion-label>Cliente</ion-label><ion-note slot="end">{{ cliente() }}</ion-note></ion-item>
          <ion-item>
            <ion-label>Ubicación</ion-label>
            <ion-note slot="end">{{ p.mesa ? 'Mesa ' + p.mesa.numero_mesa : 'Para llevar' }}</ion-note>
          </ion-item>
          <ion-item><ion-label>Atendido por</ion-label><ion-note slot="end">{{ p.usuario?.username ?? '—' }}</ion-note></ion-item>
          <ion-item>
            <ion-label>Fecha</ion-label>
            <ion-note slot="end">{{ p.fecha_pedido ?? p.created_at | date: 'dd/MM HH:mm' }}</ion-note>
          </ion-item>
        </ion-list>

        <ion-list [inset]="true">
          <ion-list-header><ion-label>Productos</ion-label></ion-list-header>
          @for (d of p.detalles ?? []; track d.id) {
            <ion-item>
              <ion-label>
                {{ d.cantidad }}× {{ d.producto?.nombre ?? 'Producto eliminado' }}
                <p>{{ d.precio_unitario | currency: 'USD' }} c/u</p>
              </ion-label>
              <ion-note slot="end">{{ d.subtotal | currency: 'USD' }}</ion-note>
            </ion-item>
          }
          <ion-item><ion-label>Subtotal</ion-label><ion-note slot="end">{{ subtotal() | currency: 'USD' }}</ion-note></ion-item>
          <ion-item><ion-label>Impuestos</ion-label><ion-note slot="end">{{ impuestos() | currency: 'USD' }}</ion-note></ion-item>
          <ion-item>
            <ion-label><strong>Total</strong></ion-label>
            <ion-note slot="end" color="dark"><strong>{{ p.precio_total | currency: 'USD' }}</strong></ion-note>
          </ion-item>
        </ion-list>

        <div class="acciones">
          @if (siguiente(); as s) {
            <ion-button expand="block" [disabled]="actualizando()" (click)="cambiar(s.estado)">{{ s.texto }}</ion-button>
          }
          @if (puedeCancelar()) {
            <ion-button expand="block" fill="outline" color="danger" [disabled]="actualizando()" (click)="confirmarCancelar()">
              Cancelar pedido
            </ion-button>
          }
        </div>
      } @else {
        <div class="centro"><p>{{ error() }}</p></div>
      }
    </ion-content>
  `,
  styles: `
    .centro { display: flex; justify-content: center; padding: 48px 24px; text-align: center; color: var(--ion-color-medium); }
    .acciones { padding: 8px 16px 32px; display: flex; flex-direction: column; gap: 8px; }
  `,
})
export class PedidoDetallePage {
  private api = inject(ApiService);
  private alertas = inject(AlertController);
  private toast = inject(ToastController);

  // Llega de la ruta /tabs/pedido/:id (withComponentInputBinding)
  id = input.required<string>();

  pedido = signal<Pedido | null>(null);
  cargando = signal(true);
  actualizando = signal(false);
  error = signal('');

  cliente = computed(() => nombreCompleto(this.pedido()?.cliente));
  etiqueta = computed(() => (this.pedido() ? ESTADOS[this.pedido()!.estado] : ''));
  color = computed(() => (this.pedido() ? COLOR_ESTADO[this.pedido()!.estado] : 'medium'));
  siguiente = computed(() => (this.pedido() ? SIGUIENTE[this.pedido()!.estado] : undefined));
  puedeCancelar = computed(() => ['pendiente', 'preparacion'].includes(this.pedido()?.estado ?? ''));
  subtotal = computed(() => (this.pedido()?.detalles ?? []).reduce((s, d) => s + Number(d.subtotal), 0));
  impuestos = computed(() => Math.max(0, Number(this.pedido()?.precio_total ?? 0) - this.subtotal()));

  ionViewWillEnter() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.api.pedido(this.id()).subscribe({
      next: (p) => {
        this.pedido.set(p);
        this.cargando.set(false);
      },
      error: (e) => {
        this.pedido.set(null);
        this.error.set(e?.status === 404 ? `El pedido #${this.id()} no existe.` : errorMessage(e, 'No se pudo cargar el pedido.'));
        this.cargando.set(false);
      },
    });
  }

  cambiar(estado: EstadoPedido) {
    this.actualizando.set(true);
    this.api.cambiarEstado(Number(this.id()), estado).subscribe({
      next: async (r) => {
        this.pedido.set(r.data);
        this.actualizando.set(false);
        (await this.toast.create({ message: `Pedido ${ESTADOS[estado].toLowerCase()}.`, duration: 1800, color: 'success' })).present();
      },
      error: async (e) => {
        this.actualizando.set(false);
        (await this.toast.create({ message: errorMessage(e), duration: 3000, color: 'danger' })).present();
      },
    });
  }

  async confirmarCancelar() {
    const alerta = await this.alertas.create({
      header: 'Cancelar pedido',
      message: '¿Seguro? Se liberará la mesa.',
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Sí, cancelar', role: 'destructive', handler: () => this.cambiar('cancelado') },
      ],
    });
    await alerta.present();
  }
}
