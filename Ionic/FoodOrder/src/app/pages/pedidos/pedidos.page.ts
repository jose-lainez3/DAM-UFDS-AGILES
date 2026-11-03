import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonBadge, IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonNote, IonRefresher,
  IonRefresherContent, IonSearchbar, IonSegment, IonSegmentButton, IonSkeletonText, IonTitle, IonToolbar,
  ToastController,
} from '@ionic/angular';
import { RefresherCustomEvent } from '@ionic/core';
import { ApiService } from '../../core/api.service';
import { errorMessage } from '../../core/errors';
import { COLOR_ESTADO, ESTADOS, Pedido } from '../../core/models';

type Filtro = 'todos' | 'pendiente' | 'preparacion' | 'entregado';

@Component({
  selector: 'app-pedidos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe, DatePipe, FormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonSegment,
    IonSegmentButton, IonLabel, IonSearchbar, IonList, IonItem, IonBadge, IonNote, IonRefresher,
    IonRefresherContent, IonSkeletonText, IonButton,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Mis pedidos</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar placeholder="Buscar por número de pedido" [debounce]="200" (ionInput)="busqueda.set($any($event).detail.value ?? '')" />
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment [value]="filtro()" (ionChange)="filtro.set($any($event).detail.value)" scrollable>
          <ion-segment-button value="todos"><ion-label>Todos</ion-label></ion-segment-button>
          <ion-segment-button value="pendiente"><ion-label>Pendientes</ion-label></ion-segment-button>
          <ion-segment-button value="preparacion"><ion-label>En preparación</ion-label></ion-segment-button>
          <ion-segment-button value="entregado"><ion-label>Entregados</ion-label></ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="refrescar($event)">
        <ion-refresher-content />
      </ion-refresher>

      @if (cargando() && !pedidos().length) {
        <ion-list>
          @for (n of [1, 2, 3, 4]; track n) {
            <ion-item><ion-label><h3><ion-skeleton-text [animated]="true" style="width: 60%" /></h3>
              <p><ion-skeleton-text [animated]="true" style="width: 40%" /></p></ion-label></ion-item>
          }
        </ion-list>
      } @else if (!visibles().length) {
        <div class="vacio">
          <p>{{ error() || 'Todavía no tienes pedidos.' }}</p>
          <ion-button fill="outline" routerLink="/tabs/menu">Ver el menú</ion-button>
        </div>
      } @else {
        <ion-list>
          @for (p of visibles(); track p.id) {
            <ion-item [routerLink]="['/tabs/pedido', p.id]" detail="true" button>
              <ion-label>
                <h2>Pedido #{{ p.id }}</h2>
                <p>{{ p.fecha_pedido ?? p.created_at | date: 'dd/MM HH:mm' }}</p>
                <ion-note>{{ p.precio_total | currency: 'USD' }}</ion-note>
              </ion-label>
              <ion-badge slot="end" [color]="color(p)">{{ etiqueta(p) }}</ion-badge>
            </ion-item>
          }
        </ion-list>
      }

    </ion-content>
  `,
  styles: `
    .vacio { padding: 48px 24px; text-align: center; color: var(--ion-color-medium); }
  `,
})
export class PedidosPage {
  private api = inject(ApiService);
  private toast = inject(ToastController);

  pedidos = signal<Pedido[]>([]);
  cargando = signal(false);
  error = signal('');
  filtro = signal<Filtro>('todos');
  busqueda = signal('');

  visibles = computed(() => {
    const term = this.busqueda().trim().toLowerCase();
    return this.pedidos().filter((p) => {
      const okEstado = this.filtro() === 'todos' || p.estado === this.filtro();
      const okTexto = !term || String(p.id).includes(term.replace('#', ''));
      return okEstado && okTexto;
    });
  });

  // Ciclo de vida de Ionic: se recarga cada vez que se vuelve a esta pestaña
  ionViewWillEnter() {
    this.cargar();
  }

  etiqueta = (p: Pedido) => ESTADOS[p.estado];
  color = (p: Pedido) => COLOR_ESTADO[p.estado];

  cargar() {
    this.cargando.set(true);
    return new Promise<void>((resolve) => {
      this.api.pedidos().subscribe({
        next: (data) => {
          this.pedidos.set(data);
          this.error.set('');
          this.cargando.set(false);
          resolve();
        },
        error: async (e) => {
          this.error.set(errorMessage(e, 'No se pudieron cargar los pedidos.'));
          this.cargando.set(false);
          (await this.toast.create({ message: this.error(), duration: 3000, color: 'danger' })).present();
          resolve();
        },
      });
    });
  }

  async refrescar(event: RefresherCustomEvent) {
    await this.cargar();
    event.target.complete();
  }
}
