import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton, IonContent, IonFooter, IonHeader, IonIcon, IonItem, IonLabel,
  IonList, IonNote, IonSpinner, IonTitle, IonToolbar, ToastController,
  IonRadio, IonRadioGroup,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addCircleOutline, removeCircleOutline } from 'ionicons/icons';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { CartService } from '../../core/cart.service';
import { errorMessage } from '../../core/errors';

interface Mesa {
  id: number;
  numero_mesa: number;
  capacidad: number;
  estado: string;
}

@Component({
  selector: 'app-carrito',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, IonHeader, IonToolbar, IonTitle, IonContent, IonList,
    IonItem, IonLabel, IonNote, IonButton, IonIcon, IonFooter, IonSpinner,
    IonRadio, IonRadioGroup],
  template: `
    <ion-header>
      <ion-toolbar><ion-title>Mi carrito</ion-title></ion-toolbar>
    </ion-header>

    <ion-content>
      @if (!cart.lineas().length) {
        <div class="vacio">
          <p>Tu carrito está vacío.</p>
          <ion-button fill="outline" (click)="irAlMenu()">Ver el menú</ion-button>
        </div>
      } @else {
        <ion-list [inset]="true">
          @for (l of cart.lineas(); track l.producto.id) {
            <ion-item>
              <ion-label class="ion-text-wrap">
                {{ l.producto.nombre }}
                <p>{{ l.producto.precio | currency: 'USD' }} c/u</p>
              </ion-label>
              <div slot="end" class="stepper">
                <ion-button fill="clear" size="small" aria-label="Quitar uno" (click)="cart.cambiar(l.producto, -1)">
                  <ion-icon slot="icon-only" name="remove-circle-outline" />
                </ion-button>
                <strong>{{ l.cantidad }}</strong>
                <ion-button fill="clear" size="small" aria-label="Agregar uno" (click)="cart.cambiar(l.producto, 1)">
                  <ion-icon slot="icon-only" name="add-circle-outline" />
                </ion-button>
              </div>
            </ion-item>
          }
        </ion-list>

        <ion-list [inset]="true">
          <ion-item lines="none">
            <ion-label><strong>¿Dónde recibirás tu pedido?</strong></ion-label>
            <ion-button slot="end" fill="clear" size="small" (click)="cargarMesas()" [disabled]="cargandoMesas()">Actualizar</ion-button>
          </ion-item>
          @if (cargandoMesas()) {
            <ion-item><ion-spinner slot="start" name="dots" /><ion-label>Cargando mesas...</ion-label></ion-item>
          }
          @if (errorMesas()) {
            <ion-item><ion-note color="danger">{{ errorMesas() }}</ion-note></ion-item>
          }
          <ion-radio-group [value]="mesaSeleccionada()" (ionChange)="seleccionarMesa($event.detail.value)">
            @for (mesa of mesasDisponibles(); track mesa.id) {
              <ion-item>
                <ion-radio [value]="mesa.id" labelPlacement="start" justify="space-between">
                  Mesa {{ mesa.numero_mesa }} · {{ mesa.capacidad }} personas
                </ion-radio>
              </ion-item>
            }
            <ion-item>
              <ion-radio value="llevar" labelPlacement="start" justify="space-between">Para llevar (sin mesa)</ion-radio>
            </ion-item>
          </ion-radio-group>
          @if (!cargandoMesas() && !mesasDisponibles().length && !errorMesas()) {
            <ion-item><ion-note>No hay mesas disponibles en este momento.</ion-note></ion-item>
          }
        </ion-list>

        <ion-list [inset]="true">
          <ion-item><ion-label>Subtotal</ion-label><ion-note slot="end">{{ cart.subtotal() | currency: 'USD' }}</ion-note></ion-item>
          <ion-item><ion-label>Impuestos</ion-label><ion-note slot="end">{{ impuestos() | currency: 'USD' }}</ion-note></ion-item>
          <ion-item><ion-label><strong>Total</strong></ion-label><ion-note slot="end" color="dark"><strong>{{ total() | currency: 'USD' }}</strong></ion-note></ion-item>
        </ion-list>

        <ion-list [inset]="true">
          <ion-item lines="none"><ion-label><strong>Método de pago</strong></ion-label></ion-item>
          <ion-radio-group [value]="metodoPago()" (ionChange)="seleccionarMetodoPago($event.detail.value)">
            <ion-item>
              <ion-radio value="local" labelPlacement="start" justify="space-between">Pagar en el restaurante</ion-radio>
            </ion-item>
            <ion-item [disabled]="!pagosOnlineDisponibles()">
              <ion-radio value="wompi" labelPlacement="start" justify="space-between">Pagar en línea con Wompi</ion-radio>
            </ion-item>
          </ion-radio-group>
          @if (!pagosOnlineDisponibles()) {
            <ion-item lines="none">
              <ion-note color="medium">Pago con tarjeta pendiente de activación por el restaurante.</ion-note>
            </ion-item>
          }
        </ion-list>

        <div class="ion-padding"><ion-button fill="clear" color="medium" (click)="cart.vaciar()">Vaciar carrito</ion-button></div>
      }
    </ion-content>

    @if (cart.lineas().length) {
      <ion-footer>
        <ion-toolbar>
          <div class="resumen">
            <strong>Total: {{ total() | currency: 'USD' }}</strong>
            <ion-button [disabled]="enviando() || (auth.isLoggedIn() && mesaSeleccionada() === null)" (click)="confirmar()">
              @if (enviando()) { <ion-spinner name="dots" /> }
              @else if (auth.isLoggedIn()) { Confirmar pedido }
              @else { Iniciar sesión para pedir }
            </ion-button>
          </div>
        </ion-toolbar>
      </ion-footer>
    }
  `,
  styles: `
    .vacio { padding: 64px 24px; text-align: center; color: var(--ion-color-medium); }
    .stepper { display: flex; align-items: center; gap: 2px; }
    .resumen { display: flex; align-items: center; justify-content: space-between; padding: 6px 16px; gap: 12px; }
  `,
})
export class CarritoPage {
  private api = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastController);
  cart = inject(CartService);
  auth = inject(AuthService);

  enviando = signal(false);
  cargandoMesas = signal(false);
  errorMesas = signal('');
  mesasDisponibles = signal<Mesa[]>([]);
  mesaSeleccionada = signal<number | 'llevar' | null>(null);
  tasa = signal(0.13);
  metodoPago = signal<'local' | 'wompi'>('local');
  pagosOnlineDisponibles = signal(false);

  impuestos = computed(() => Number((this.cart.subtotal() * this.tasa()).toFixed(2)));
  total = computed(() => Number((this.cart.subtotal() + this.impuestos()).toFixed(2)));

  constructor() {
    addIcons({ addCircleOutline, removeCircleOutline });
  }

  ionViewWillEnter() {
    this.api.configuracion().subscribe({
      next: (c) => {
        const tasa = Number(c.tasa_impuesto);
        if (Number.isFinite(tasa)) this.tasa.set(tasa);
        this.pagosOnlineDisponibles.set(Boolean(c.pagos_en_linea));
        if (!c.pagos_en_linea) this.metodoPago.set('local');
      },
      error: () => {
        this.pagosOnlineDisponibles.set(false);
        this.metodoPago.set('local');
      },
    });
    this.cargarMesas();
  }

  cargarMesas() {
    this.cargandoMesas.set(true);
    this.errorMesas.set('');
    this.api.mesas().subscribe({
      next: (mesas: Mesa[]) => {
        const disponibles = mesas.filter(m => m.estado === 'disponible');
        this.mesasDisponibles.set(disponibles);
        const seleccion = this.mesaSeleccionada();
        if (typeof seleccion === 'number' && !disponibles.some(m => m.id === seleccion)) {
          this.mesaSeleccionada.set(null);
        }
        this.cargandoMesas.set(false);
      },
      error: (e: unknown) => {
        this.mesasDisponibles.set([]);
        if (typeof this.mesaSeleccionada() === 'number') this.mesaSeleccionada.set(null);
        this.errorMesas.set(errorMessage(e, 'No se pudieron cargar las mesas.'));
        this.cargandoMesas.set(false);
      },
    });
  }

  seleccionarMesa(valor: number | 'llevar' | null) {
    this.mesaSeleccionada.set(valor);
  }

  seleccionarMetodoPago(valor: 'local' | 'wompi') {
    if (valor === 'wompi' && !this.pagosOnlineDisponibles()) return;
    this.metodoPago.set(valor === 'wompi' ? 'wompi' : 'local');
  }

  irAlMenu() {
    this.router.navigateByUrl('/tabs/menu');
  }

  async confirmar() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/tabs/carrito' } });
      return;
    }
    if (!this.cart.lineas().length || this.enviando()) return;
    if (this.mesaSeleccionada() === null) {
      (await this.toast.create({ message: 'Selecciona una mesa o la opción Para llevar.', duration: 2500, color: 'warning' })).present();
      return;
    }
    const seleccion = this.mesaSeleccionada();
    if (typeof seleccion === 'number' && !this.mesasDisponibles().some(m => m.id === seleccion)) {
      (await this.toast.create({ message: 'La mesa ya no está disponible. Actualiza la lista.', duration: 3000, color: 'warning' })).present();
      return;
    }

    if (this.metodoPago() === 'wompi' && !this.pagosOnlineDisponibles()) {
      (await this.toast.create({ message: 'Wompi todavía no está disponible.', duration: 2500, color: 'warning' })).present();
      return;
    }

    this.enviando.set(true);
    // El backend DEBE resolver cliente_id desde el usuario autenticado.
    this.api.crearPedido({
      mesa_id: seleccion === 'llevar' ? null : seleccion,
      estado: 'pendiente',
      detalles: this.cart.lineas().map(l => ({ producto_id: l.producto.id, cantidad: l.cantidad })),
    }).subscribe({
      next: async (r) => {
        this.cart.vaciar();
        this.mesaSeleccionada.set(null);
        if (this.metodoPago() === 'wompi') {
          this.api.iniciarPagoWompi(r.data.id).subscribe({
            next: async () => {
              this.enviando.set(false);
              (await this.toast.create({ message: 'Pedido creado. Abre Wompi desde el detalle para pagar.', duration: 3200, color: 'success' })).present();
              this.router.navigate(['/tabs/pedido', r.data.id]);
            },
            error: async (e) => {
              this.enviando.set(false);
              (await this.toast.create({ message: `Pedido #${r.data.id} creado, pero no se pudo iniciar el pago: ${errorMessage(e)}`, duration: 4500, color: 'warning' })).present();
              this.router.navigate(['/tabs/pedido', r.data.id]);
            },
          });
        } else {
          this.enviando.set(false);
          (await this.toast.create({ message: `Pedido #${r.data.id} enviado.`, duration: 2000, color: 'success' })).present();
          this.router.navigate(['/tabs/pedido', r.data.id]);
        }
      },
      error: async (e) => {
        this.enviando.set(false);
        (await this.toast.create({ message: errorMessage(e, 'No se pudo enviar el pedido.'), duration: 3500, color: 'danger' })).present();
      },
    });
  }
}
