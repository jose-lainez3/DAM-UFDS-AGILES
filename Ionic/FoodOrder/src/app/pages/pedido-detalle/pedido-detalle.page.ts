import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import {
  AlertController, IonBackButton, IonBadge, IonButton, IonButtons, IonContent, IonHeader, IonItem,
  IonLabel, IonList, IonListHeader, IonNote, IonSpinner, IonTitle, IonToolbar, ToastController,
} from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { errorMessage } from '../../core/errors';
import { COLOR_ESTADO, ESTADOS, Pedido } from '../../core/models';

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
          <ion-item>
            <ion-label>Pago</ion-label>
            <ion-badge slot="end" [color]="colorPago()">
              {{ etiquetaPago() }}
            </ion-badge>
          </ion-item>
          @if (!p.pago && p.estado === 'pagado') {
            <ion-item lines="none">
              <ion-note color="medium">
                Pago registrado en la administración del restaurante. No hay transacción de Wompi asociada.
              </ion-note>
            </ion-item>
          }
          @if (p.documento_fiscal; as dte) {
            <ion-item>
              <ion-label>Factura electrónica</ion-label>
              <ion-badge slot="end" [color]="dte.estado === 'emitido' ? 'success' : dte.estado === 'rechazado' ? 'danger' : 'medium'">
                {{ dte.estado === 'emitido' ? 'DTE emitido' : dte.estado === 'prueba' ? 'DTE de pruebas' : dte.estado === 'borrador' ? 'Borrador sin validez fiscal' : dte.estado }}
              </ion-badge>
            </ion-item>
            @if (dte.ambiente === 'SANDBOX') {
              <ion-item><ion-note color="warning">Documento de pruebas; no tiene validez fiscal.</ion-note></ion-item>
            }
            @if (dte.codigo_generacion) {
              <ion-item><ion-label class="ion-text-wrap">Código DTE: {{ dte.codigo_generacion }}</ion-label></ion-item>
            }
          }
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
          @if (puedeDescargarDte()) {
            @if (!urlPdfDte()) {
              <ion-button expand="block" fill="outline" [disabled]="consultandoDte()" (click)="prepararPdfDte()">
                @if (consultandoDte()) { <ion-spinner name="dots" /> } @else { Preparar factura PDF }
              </ion-button>
            } @else {
              <ion-button expand="block" [href]="urlPdfDte()" target="_blank" rel="noopener noreferrer">
                Abrir factura PDF
              </ion-button>
            }
          }
          @if (puedePagar() && !urlPago()) {
            <ion-button expand="block" [disabled]="actualizando()" (click)="pagarEnLinea()">
              @if (actualizando()) { <ion-spinner name="dots" /> } @else { Preparar pago con Wompi }
            </ion-button>
          }
          @if (puedePagar() && urlPago()) {
            <ion-button expand="block" [href]="urlPago()" target="_blank" rel="noopener noreferrer">
              Abrir pago seguro con Wompi
            </ion-button>
            <ion-note>El pago se completa en Wompi. Al volver, actualiza este pedido para verificar la confirmación.</ion-note>
          }
          @if (!pagosOnlineDisponibles() && !p.pago && p.estado !== 'pagado' && p.estado !== 'cancelado') {
            <ion-note color="medium">El pago en línea se habilitará cuando el restaurante active Wompi.</ion-note>
          }
          @if (pagoPendiente()) {
            <ion-note color="warning">Si ya pagaste, espera la confirmación. No intentes pagar dos veces.</ion-note>
          }
          <ion-button expand="block" fill="outline" [disabled]="actualizando()" (click)="cargar()">Actualizar estado de pago</ion-button>
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
  pagosOnlineDisponibles = signal(false);
  enlaceNuevo = signal('');
  urlPdfDte = signal('');
  consultandoDte = signal(false);

  etiqueta = computed(() => (this.pedido() ? ESTADOS[this.pedido()!.estado] : ''));
  color = computed(() => (this.pedido() ? COLOR_ESTADO[this.pedido()!.estado] : 'medium'));
  etiquetaPago = computed(() => {
    const pedido = this.pedido();
    if (!pedido) return '';
    if (pedido.pago?.estado === 'pagado') return 'Pagado con Wompi';
    if (pedido.pago?.estado === 'prueba') return 'Pago simulado Wompi';
    if (pedido.pago?.estado === 'revision') return 'Cobro en revisión';
    if (pedido.pago?.estado === 'pendiente') return 'Pendiente en Wompi';
    if (pedido.estado === 'pagado') return 'Pagado en el local';
    if (pedido.estado === 'cancelado') return 'Sin cobro electrónico';
    return 'Pendiente en el local';
  });
  colorPago = computed(() => {
    const pedido = this.pedido();
    if (pedido?.pago?.estado === 'pagado') return 'success';
    if (pedido?.pago?.estado === 'prueba') return 'medium';
    if (pedido?.pago?.estado === 'revision') return 'danger';
    if (pedido?.estado === 'pagado') return 'success';
    if (pedido?.estado === 'cancelado') return 'medium';
    return 'warning';
  });
  puedeCancelar = computed(() => this.pedido()?.estado === 'pendiente' && !this.pedido()?.pago);
  pagoPendiente = computed(() => this.pedido()?.pago?.estado === 'pendiente');
  puedeDescargarDte = computed(() => ['emitido', 'prueba', 'borrador'].includes(this.pedido()?.documento_fiscal?.estado || ''));
  urlPago = computed(() => this.pedido()?.pago?.url_pago || this.enlaceNuevo());
  puedePagar = computed(() => {
    const pedido = this.pedido();
    return !!pedido && this.pagosOnlineDisponibles() && !['pagado', 'cancelado'].includes(pedido.estado)
      && (!pedido.pago || pedido.pago.estado === 'pendiente');
  });
  subtotal = computed(() => (this.pedido()?.detalles ?? []).reduce((s, d) => s + Number(d.subtotal), 0));
  impuestos = computed(() => Math.max(0, Number(this.pedido()?.precio_total ?? 0) - this.subtotal()));

  ionViewWillEnter() {
    this.api.configuracion().subscribe({
      next: c => this.pagosOnlineDisponibles.set(Boolean(c.pagos_en_linea)),
      error: () => this.pagosOnlineDisponibles.set(false),
    });
    this.cargar();
  }

  cargar() {
    this.urlPdfDte.set('');
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

  prepararPdfDte() {
    if (this.consultandoDte()) return;
    this.consultandoDte.set(true);
    this.api.archivoDte(this.id(), 'pdf').subscribe({
      next: async (r) => {
        this.consultandoDte.set(false);
        if (r.url.startsWith('https://')) {
          this.urlPdfDte.set(r.url);
        } else {
          (await this.toast.create({ message: 'Enlace de DTE no válido.', duration: 3000, color: 'danger' })).present();
        }
      },
      error: async (e) => {
        this.consultandoDte.set(false);
        (await this.toast.create({ message: errorMessage(e, 'No se pudo obtener la factura.'), duration: 3500, color: 'danger' })).present();
      },
    });
  }

  pagarEnLinea() {
    if (this.actualizando()) return;
    this.actualizando.set(true);
    this.api.iniciarPagoWompi(this.id()).subscribe({
      next: async (respuesta) => {
        this.actualizando.set(false);
        if (!respuesta.url_pago.startsWith('https://')) {
          (await this.toast.create({ message: 'Wompi devolvió una dirección inválida.', duration: 3500, color: 'danger' })).present();
          return;
        }
        this.enlaceNuevo.set(respuesta.url_pago);
        this.cargar();
        (await this.toast.create({ message: 'Enlace preparado. Toca Abrir pago seguro con Wompi.', duration: 3500, color: 'success' })).present();
      },
      error: async (e) => {
        this.actualizando.set(false);
        (await this.toast.create({ message: errorMessage(e, 'No se pudo abrir Wompi.'), duration: 3500, color: 'danger' })).present();
      },
    });
  }

  cancelar() {
    this.actualizando.set(true);
    this.api.cancelarPedido(Number(this.id())).subscribe({
      next: async (r) => {
        this.pedido.set(r.data);
        this.actualizando.set(false);
        (await this.toast.create({ message: 'Pedido cancelado.', duration: 1800, color: 'success' })).present();
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
      message: '¿Seguro que quieres cancelar este pedido?',
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Sí, cancelar', role: 'destructive', handler: () => this.cancelar() },
      ],
    });
    await alerta.present();
  }
}
