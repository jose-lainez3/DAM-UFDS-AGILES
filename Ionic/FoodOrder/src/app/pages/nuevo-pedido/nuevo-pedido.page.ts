import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController, IonButton, IonContent, IonFooter, IonHeader, IonIcon, IonItem, IonLabel, IonList,
  IonListHeader, IonNote, IonSearchbar, IonSegment, IonSegmentButton, IonSelect, IonSelectOption, IonSpinner,
  IonTitle, IonToolbar, ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addCircleOutline, removeCircleOutline, personAddOutline } from 'ionicons/icons';
import { ApiService } from '../../core/api.service';
import { errorMessage } from '../../core/errors';
import { Cliente, Mesa, Producto, nombreCompleto } from '../../core/models';

@Component({
  selector: 'app-nuevo-pedido',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonListHeader, IonItem, IonLabel, IonNote,
    IonSelect, IonSelectOption, IonButton, IonIcon, IonSegment, IonSegmentButton, IonSearchbar, IonFooter, IonSpinner,
  ],
  template: `
    <ion-header>
      <ion-toolbar><ion-title>Nuevo pedido</ion-title></ion-toolbar>
    </ion-header>

    <ion-content>
      @if (cargando()) {
        <div class="centro"><ion-spinner /></div>
      } @else {
        <ion-list [inset]="true">
          <ion-item>
            <ion-select label="Cliente" labelPlacement="stacked" interface="action-sheet" placeholder="Seleccionar cliente"
              [value]="clienteId()" (ionChange)="clienteId.set($any($event).detail.value)">
              @for (c of clientes(); track c.id) {
                <ion-select-option [value]="c.id">{{ nombre(c) }}</ion-select-option>
              }
            </ion-select>
            <ion-button slot="end" fill="clear" aria-label="Nuevo cliente" (click)="nuevoCliente()">
              <ion-icon slot="icon-only" name="person-add-outline" />
            </ion-button>
          </ion-item>

          <ion-item>
            <ion-select label="Mesa" labelPlacement="stacked" interface="action-sheet" placeholder="Seleccionar mesa"
              [value]="mesaId()" (ionChange)="mesaId.set($any($event).detail.value)">
              @for (m of mesasLibres(); track m.id) {
                <ion-select-option [value]="m.id">
                  Mesa {{ m.numero_mesa }} · {{ m.capacidad }} pers.{{ m.estado === 'reservada' ? ' (reservada)' : '' }}
                </ion-select-option>
              }
              <ion-select-option value="llevar">Para llevar (sin mesa)</ion-select-option>
            </ion-select>
          </ion-item>
        </ion-list>

        <ion-searchbar placeholder="Buscar producto" [debounce]="150" (ionInput)="busqueda.set($any($event).detail.value ?? '')" />

        <ion-segment [scrollable]="true" [value]="categoria()" (ionChange)="categoria.set($any($event).detail.value)">
          @for (c of categorias(); track c) {
            <ion-segment-button [value]="c"><ion-label>{{ c }}</ion-label></ion-segment-button>
          }
        </ion-segment>

        <ion-list>
          <ion-list-header><ion-label>Menú</ion-label></ion-list-header>
          @for (p of visibles(); track p.id) {
            <ion-item>
              <ion-label>
                {{ p.nombre }}
                @if (p.descripcion) { <p>{{ p.descripcion }}</p> }
                <ion-note>{{ p.precio | currency: 'USD' }}</ion-note>
              </ion-label>
              <div slot="end" class="stepper">
                @if (cantidad(p.id) > 0) {
                  <ion-button fill="clear" size="small" aria-label="Quitar uno" (click)="cambiar(p, -1)">
                    <ion-icon slot="icon-only" name="remove-circle-outline" />
                  </ion-button>
                  <strong>{{ cantidad(p.id) }}</strong>
                }
                <ion-button fill="clear" size="small" aria-label="Agregar uno" (click)="cambiar(p, 1)">
                  <ion-icon slot="icon-only" name="add-circle-outline" />
                </ion-button>
              </div>
            </ion-item>
          } @empty {
            <ion-item lines="none"><ion-label class="ion-text-center">No hay productos.</ion-label></ion-item>
          }
        </ion-list>
      }
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <div class="resumen">
          <div>
            <strong>Total: {{ total() | currency: 'USD' }}</strong>
            <br /><ion-note>{{ unidades() }} producto(s) · incl. impuestos</ion-note>
          </div>
          <ion-button [disabled]="!puedeConfirmar()" (click)="confirmar()">
            @if (enviando()) { <ion-spinner name="dots" /> } @else { Confirmar }
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: `
    .centro { display: flex; justify-content: center; padding: 48px; }
    .stepper { display: flex; align-items: center; gap: 2px; }
    .resumen { display: flex; align-items: center; justify-content: space-between; padding: 6px 16px; gap: 12px; }
  `,
})
export class NuevoPedidoPage {
  private api = inject(ApiService);
  private router = inject(Router);
  private alertas = inject(AlertController);
  private toast = inject(ToastController);

  cargando = signal(true);
  enviando = signal(false);

  clientes = signal<Cliente[]>([]);
  mesas = signal<Mesa[]>([]);
  productos = signal<Producto[]>([]);
  tasa = signal(0.13);

  clienteId = signal<number | null>(null);
  mesaId = signal<number | 'llevar' | null>(null);
  categoria = signal('Todas');
  busqueda = signal('');
  cantidades = signal<Record<number, number>>({});

  nombre = nombreCompleto;

  mesasLibres = computed(() => this.mesas().filter((m) => m.estado !== 'ocupada'));

  categorias = computed(() => {
    const nombres = new Set(this.productos().map((p) => p.categoria?.nombre ?? 'Otros'));
    return ['Todas', ...nombres];
  });

  visibles = computed(() => {
    const term = this.busqueda().trim().toLowerCase();
    return this.productos().filter(
      (p) =>
        (this.categoria() === 'Todas' || (p.categoria?.nombre ?? 'Otros') === this.categoria()) &&
        (!term || p.nombre.toLowerCase().includes(term) || (p.descripcion ?? '').toLowerCase().includes(term)),
    );
  });

  unidades = computed(() => Object.values(this.cantidades()).reduce((s, n) => s + n, 0));

  subtotal = computed(() =>
    this.productos().reduce((s, p) => s + Number(p.precio) * (this.cantidades()[p.id] ?? 0), 0),
  );

  total = computed(() => Number((this.subtotal() * (1 + this.tasa())).toFixed(2)));

  puedeConfirmar = computed(
    () => this.unidades() > 0 && this.clienteId() !== null && this.mesaId() !== null && !this.enviando(),
  );

  constructor() {
    addIcons({ addCircleOutline, removeCircleOutline, personAddOutline });
  }

  // Las mesas cambian con cada pedido, así que se recargan al entrar (el carrito se conserva)
  ionViewWillEnter() {
    this.cargar();
  }

  cargar() {
    let pendientes = 5;
    const fin = () => {
      if (--pendientes === 0) this.cargando.set(false);
    };
    const fallo = async (e: unknown) => {
      (await this.toast.create({ message: errorMessage(e, 'No se pudieron cargar los datos.'), duration: 3000, color: 'danger' })).present();
      fin();
    };

    this.api.productos().subscribe({
      next: (d) => { this.productos.set(d.filter((p) => p.disponible)); fin(); },
      error: fallo,
    });
    this.api.clientes().subscribe({ next: (d) => { this.clientes.set(d); fin(); }, error: fallo });
    this.api.mesas().subscribe({
      next: (d) => {
        this.mesas.set(d);
        // La mesa elegida pudo ocuparse mientras tanto
        const m = this.mesaId();
        if (typeof m === 'number' && !d.some((x) => x.id === m && x.estado !== 'ocupada')) this.mesaId.set(null);
        fin();
      },
      error: fallo,
    });
    this.api.configuracion().subscribe({ next: (c) => { this.tasa.set(Number(c.tasa_impuesto)); fin(); }, error: () => fin() });
    fin(); // categorías se derivan de los productos: sin petición propia
  }

  cantidad(id: number): number {
    return this.cantidades()[id] ?? 0;
  }

  cambiar(p: Producto, delta: number) {
    const nueva = Math.max(0, this.cantidad(p.id) + delta);
    this.cantidades.update((c) => {
      const copia = { ...c };
      if (nueva === 0) delete copia[p.id];
      else copia[p.id] = nueva;
      return copia;
    });
  }

  async nuevoCliente() {
    const alerta = await this.alertas.create({
      header: 'Nuevo cliente',
      inputs: [
        { name: 'nombre', type: 'text', placeholder: 'Nombre' },
        { name: 'apellido', type: 'text', placeholder: 'Apellido' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (v: { nombre: string; apellido: string }) => {
            if (!v.nombre?.trim() || !v.apellido?.trim()) return false; // mantiene el diálogo abierto
            this.api.crearCliente({ nombre: v.nombre.trim(), apellido: v.apellido.trim() }).subscribe({
              next: (r) => {
                this.clientes.update((l) => [...l, r.data]);
                this.clienteId.set(r.data.id);
              },
              error: async (e) =>
                (await this.toast.create({ message: errorMessage(e), duration: 3000, color: 'danger' })).present(),
            });
            return true;
          },
        },
      ],
    });
    await alerta.present();
  }

  confirmar() {
    if (!this.puedeConfirmar()) return;

    const mesa = this.mesaId();
    this.enviando.set(true);

    // El servidor toma los precios de la BD, calcula el impuesto y marca la mesa como ocupada
    this.api
      .crearPedido({
        cliente_id: this.clienteId()!,
        mesa_id: mesa === 'llevar' ? null : (mesa as number),
        estado: 'pendiente',
        detalles: Object.entries(this.cantidades()).map(([id, cantidad]) => ({ producto_id: Number(id), cantidad })),
      })
      .subscribe({
        next: async (r) => {
          this.enviando.set(false);
          this.cantidades.set({});
          this.clienteId.set(null);
          this.mesaId.set(null);
          (await this.toast.create({ message: `Pedido #${r.data.id} registrado.`, duration: 2000, color: 'success' })).present();
          this.router.navigate(['/tabs/pedido', r.data.id]);
        },
        error: async (e) => {
          this.enviando.set(false);
          (await this.toast.create({ message: errorMessage(e, 'No se pudo registrar el pedido.'), duration: 3500, color: 'danger' })).present();
        },
      });
  }
}
