
import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { RefresherCustomEvent } from '@ionic/core';
import { addIcons } from 'ionicons';

import {
  add,
  remove,
  searchOutline,
  restaurantOutline,
  refreshOutline,
} from 'ionicons/icons';

import { ApiService } from '../../core/api.service';
import { CartService } from '../../core/cart.service';
import { errorMessage } from '../../core/errors';
import { Producto } from '../../core/models';

const IMAGENES: [RegExp, string][] = [
    [/tres\s+leches/, 'tres-leches'], [/helado/, 'helado-vainilla'],
    [/brownie/, 'brownie'], [/flan/, 'flan-vainilla'], [/cheesecake|pastel de queso/, 'cheesecake'],
    [/plato tipico/, 'plato-tipico'], [/tamal/, 'tamales-pollo'],
    [/pasteles? de carne/, 'pasteles-carne'], [/yuca/, 'yuca-frita'],
    [/pupusa.*revuelta/, 'pupusas-revueltas'], [/pupusa.*queso/, 'pupusas-queso'],
    [/tostada.*francesa/, 'tostadas-francesas'], [/sandwich.*desayuno/, 'sandwich-desayuno'],
    [/panqueque|pancake/, 'panqueques'], [/omelette|omelet/, 'omelette'],
    [/huevos? rancheros?/, 'huevos-rancheros'], [/desayuno tipico/, 'desayuno-tipico'],
    [/coca[\s-]*cola/, 'coca-cola'], [/sprite/, 'sprite'],
    [/horchata/, 'horchata'], [/cafe|americano/, 'cafe'], [/agua/, 'agua'],
    [/nacho/, 'nachos'], [/hot[\s-]*dog|perro caliente/, 'hotdog'],
    [/ensalada/, 'ensalada'], [/papa/, 'papas'],
    [/hamburguesa|burger/, 'hamburguesa'], [/pizza/, 'pizza'],
    [/pollo|alita/, 'pollo'], [/naranja/, 'jugo-naranja'],
    [/limonada|limon/, 'limonada'], [/pastel|tarta|torta|chocolate|postre/, 'pastel-chocolate'],
    [/jugo|zumo|bebida|refresco|soda|gaseosa/, 'limonada'],
    [/entrada|vegetal|verdura/, 'ensalada'], [/plato|comida/, 'pollo']
];

@Component({
  selector: 'app-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [
    CurrencyPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
  ],

  template: `
    <ion-header class="menu-header">
      <ion-toolbar>
        <ion-title>Menú</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="menu-content">

      <ion-refresher
        slot="fixed"
        (ionRefresh)="refrescar($event)"
      >
        <ion-refresher-content />
      </ion-refresher>

      <div class="menu-container">

        <!-- ENCABEZADO -->
        <section class="welcome-section">
          <div class="welcome-text">
            <span class="eyebrow">FOODORDER</span>
            <h1>¿Qué se te antoja hoy?</h1>
            <p>Explora nuestro menú y elige tus favoritos.</p>
          </div>

          <div class="welcome-icon">
            <ion-icon name="restaurant-outline" />
          </div>
        </section>

        <!-- BUSCADOR -->
        <div class="search-container">
          <ion-searchbar
            placeholder="Buscar productos..."
            [debounce]="150"
            [value]="busqueda()"
            (ionInput)="busqueda.set($any($event).detail.value ?? '')"
          />
        </div>

        <!-- CATEGORÍAS -->
        <section class="categories-section">
          <div class="section-heading">
            <h2>Categorías</h2>

            <span>
              {{ categorias().length - 1 }}
              disponibles
            </span>
          </div>

          <div class="categories-scroll">
            @for (c of categorias(); track c) {
              <button
                type="button"
                class="category-chip"
                [class.active]="categoria() === c"
                (click)="categoria.set(c)"
              >
                {{ c }}
              </button>
            }
          </div>
        </section>

        <!-- PRODUCTOS -->
        <section class="products-section">

          <div class="section-heading">
            <h2>
              {{ categoria() === 'Todas'
                ? 'Nuestro menú'
                : categoria() }}
            </h2>

            <span>
              {{ visibles().length }}
              productos
            </span>
          </div>

          @if (cargando() && !productos().length) {

            <div class="products-grid">
              @for (n of [1, 2, 3, 4]; track n) {
                <div class="product-card skeleton-card">
                  <div class="product-icon skeleton-icon">
                    <ion-skeleton-text [animated]="true" />
                  </div>

                  <ion-skeleton-text
                    [animated]="true"
                    style="width: 70%; height: 18px;"
                  />

                  <ion-skeleton-text
                    [animated]="true"
                    style="width: 40%; height: 14px;"
                  />

                  <ion-skeleton-text
                    [animated]="true"
                    style="width: 35%; height: 22px;"
                  />
                </div>
              }
            </div>

          } @else {

            <div class="products-grid">

              @for (p of visibles(); track p.id) {

                <article class="product-card">

                  <!-- ÍCONO DEL PRODUCTO -->
                  <div class="product-visual">
                    <div class="product-icon">
                      <img [src]="imagenPara(p)" [alt]="p.nombre" loading="lazy" decoding="async" />
                    </div>

                    @if (cart.cantidad(p.id) > 0) {
                      <span class="quantity-badge">
                        {{ cart.cantidad(p.id) }}
                      </span>
                    }
                  </div>

                  <!-- INFORMACIÓN -->
                  <div class="product-info">

                    <span class="product-category">
                      {{ p.categoria?.nombre ?? 'Otros' }}
                    </span>

                    <h3>{{ p.nombre }}</h3>

                    @if (p.descripcion) {
                      <p class="product-description">
                        {{ p.descripcion }}
                      </p>
                    }

                  </div>

                  <!-- PRECIO Y CONTROLES -->
                  <div class="product-bottom">

                    <strong class="product-price">
                      {{ p.precio | currency:'USD' }}
                    </strong>

                    <div class="product-actions">

                      @if (cart.cantidad(p.id) > 0) {

                        <button
                          type="button"
                          class="quantity-button remove-button"
                          aria-label="Quitar uno"
                          (click)="cart.cambiar(p, -1)"
                        >
                          <ion-icon name="remove" />
                        </button>

                        <span class="quantity-value">
                          {{ cart.cantidad(p.id) }}
                        </span>

                      }

                      <button
                        type="button"
                        class="quantity-button add-button"
                        aria-label="Agregar uno"
                        (click)="cart.cambiar(p, 1)"
                      >
                        <ion-icon name="add" />
                      </button>

                    </div>
                  </div>

                </article>

              } @empty {

                <div class="empty-state">

                  <div class="empty-icon">
                    <ion-icon name="search-outline" />
                  </div>

                  <h3>
                    {{ error()
                      ? 'No se pudo cargar el menú'
                      : 'No encontramos productos' }}
                  </h3>

                  <p>
                    {{ error() ||
                      'Prueba con otra búsqueda o categoría.' }}
                  </p>

                  @if (error()) {
                    <ion-button
                      color="primary"
                      (click)="cargar()"
                    >
                      <ion-icon
                        name="refresh-outline"
                        slot="start"
                      />
                      Reintentar
                    </ion-button>
                  }

                </div>

              }

            </div>

          }

        </section>

      </div>

    </ion-content>
  `,

  styles: [`
    :host {
      display: block;

      --food-green: #10372f;
      --food-gold: #f5b332;
      --food-background: #f7f8f6;
      --food-border: #e5e9e6;
      --food-muted: #64748b;
    }

    .menu-header ion-toolbar {
      --background: #ffffff;
      --color: var(--food-green);
      --border-color: var(--food-border);
    }

    .menu-header ion-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.6px;
    }

    .menu-content {
      --background: var(--food-background);
    }

    .menu-container {
      width: 100%;
      max-width: 1120px;
      margin: 0 auto;
      padding: 22px 16px 40px;
    }

    /* BIENVENIDA */

    .welcome-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
    }

    .welcome-text {
      min-width: 0;
    }

    .eyebrow {
      display: block;
      margin-bottom: 8px;
      color: #a77916;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.8px;
    }

    .welcome-text h1 {
      margin: 0;
      color: var(--food-green);
      font-size: 24px;
      line-height: 1.2;
      font-weight: 800;
      letter-spacing: -0.8px;
    }

    .welcome-text p {
      margin: 9px 0 0;
      color: var(--food-muted);
      font-size: 13px;
      line-height: 1.5;
    }

    .welcome-icon {
      width: 52px;
      height: 52px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 15px;
      background: #e6eee9;
      color: var(--food-green);
    }

    .welcome-icon ion-icon {
      font-size: 26px;
    }

    /* BUSCADOR */

    .search-container {
      margin-bottom: 26px;
    }

    .search-container ion-searchbar {
      --background: #ffffff;
      --color: var(--food-green);
      --placeholder-color: #8b9690;
      --icon-color: #64748b;
      --clear-button-color: #64748b;
      --border-radius: 12px;
      --box-shadow: none;

      padding: 0;
      min-height: 48px;
    }

    .search-container ion-searchbar::part(container) {
      border: 1px solid var(--food-border);
      border-radius: 12px;
    }

    /* TÍTULOS */

    .section-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 15px;
    }

    .section-heading h2 {
      margin: 0;
      color: var(--food-green);
      font-size: 17px;
      font-weight: 800;
      letter-spacing: -0.3px;
    }

    .section-heading span {
      color: var(--food-muted);
      font-size: 12px;
      white-space: nowrap;
    }

    /* CATEGORÍAS */

    .categories-section {
      margin-bottom: 30px;
    }

    .categories-scroll {
      display: flex;
      gap: 9px;
      overflow-x: auto;
      padding-bottom: 6px;
      scrollbar-width: none;
    }

    .categories-scroll::-webkit-scrollbar {
      display: none;
    }

    .category-chip {
      flex-shrink: 0;
      border: 1px solid var(--food-border);
      border-radius: 999px;
      background: #ffffff;
      color: var(--food-green);
      padding: 11px 17px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s ease,
                  color 0.2s ease,
                  border-color 0.2s ease;
    }

    .category-chip.active {
      background: var(--food-green);
      color: #ffffff;
      border-color: var(--food-green);
    }

    .category-chip:focus-visible {
      outline: 2px solid var(--food-gold);
      outline-offset: 3px;
    }

    /* PRODUCTOS */

    .products-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .product-card {
      min-width: 0;
      display: flex;
      flex-direction: column;
      padding: 13px;
      background: #ffffff;
      border: 1px solid var(--food-border);
      border-radius: 15px;
      transition: border-color 0.2s ease,
                  transform 0.2s ease;
    }

    .product-card:hover {
      border-color: #c9d9cf;
    }

    .product-visual {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100px;
      margin-bottom: 13px;
      border-radius: 11px;
      background: #edf2ee;
    }

    .product-icon {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--food-green);
    }

    .product-icon img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 11px;
    }

    .quantity-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 23px;
      height: 23px;
      padding: 0 6px;
      border-radius: 7px;
      background: var(--food-gold);
      color: var(--food-green);
      font-size: 11px;
      font-weight: 800;
    }

    .product-info {
      flex: 1;
      min-width: 0;
    }

    .product-category {
      display: block;
      margin-bottom: 7px;
      color: #718178;
      font-size: 10px;
      font-weight: 600;
    }

    .product-info h3 {
      margin: 0 0 7px;
      color: var(--food-green);
      font-size: 14px;
      font-weight: 800;
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    .product-description {
      margin: 0 0 12px;
      color: var(--food-muted);
      font-size: 11px;
      line-height: 1.5;

      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }

    /* PRECIO */

    .product-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid #edf0ed;
    }

    .product-price {
      color: var(--food-green);
      font-size: 15px;
      font-weight: 800;
      white-space: nowrap;
    }

    .product-actions {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .quantity-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      padding: 0;
      border: none;
      border-radius: 9px;
      cursor: pointer;
    }

    .add-button {
      background: var(--food-gold);
      color: var(--food-green);
    }

    .remove-button {
      background: #edf2ee;
      color: var(--food-green);
    }

    .quantity-button ion-icon {
      font-size: 18px;
    }

    .quantity-value {
      min-width: 13px;
      text-align: center;
      color: var(--food-green);
      font-size: 12px;
      font-weight: 800;
    }

    /* ESTADO VACÍO */

    .empty-state {
      grid-column: 1 / -1;
      padding: 55px 20px;
      text-align: center;
      background: #ffffff;
      border: 1px solid var(--food-border);
      border-radius: 15px;
    }

    .empty-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      margin: 0 auto 16px;
      border-radius: 16px;
      background: #edf2ee;
      color: var(--food-green);
    }

    .empty-icon ion-icon {
      font-size: 26px;
    }

    .empty-state h3 {
      margin: 0 0 8px;
      color: var(--food-green);
      font-size: 16px;
    }

    .empty-state p {
      margin: 0 0 18px;
      color: var(--food-muted);
      font-size: 13px;
      line-height: 1.5;
    }

    .skeleton-card {
      min-height: 220px;
    }

    .skeleton-icon {
      height: 100px;
      margin-bottom: 14px;
    }

    .skeleton-icon ion-skeleton-text {
      width: 100%;
      height: 100%;
      border-radius: 11px;
    }

    /* CELULARES PEQUEÑOS */

    @media (max-width: 360px) {
      .menu-container {
        padding: 18px 12px 32px;
      }

      .products-grid {
        gap: 9px;
      }

      .product-card {
        padding: 10px;
      }

      .product-visual {
        height: 85px;
      }

      .product-price {
        font-size: 13px;
      }

      .quantity-button {
        width: 26px;
        height: 26px;
      }

      .welcome-text h1 {
        font-size: 21px;
      }
    }

    /* TABLETS */

    @media (min-width: 650px) {
      .menu-container {
        padding: 32px 24px 50px;
      }

      .products-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
      }

      .product-card {
        padding: 18px;
      }

      .product-visual {
        height: 145px;
      }
    }

    /* COMPUTADORAS */

    @media (min-width: 1000px) {
      .products-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .welcome-text h1 {
        font-size: 30px;
      }

      .product-visual {
        height: 170px;
      }
    }
  `],
})
export class MenuPage {
  private api = inject(ApiService);

  cart = inject(CartService);

  productos = signal<Producto[]>([]);
  cargando = signal(false);
  error = signal('');
  categoria = signal('Todas');
  busqueda = signal('');

  categorias = computed(() => {
    const nombres = new Set(
      this.productos().map(
        (p) => p.categoria?.nombre ?? 'Otros'
      )
    );

    return ['Todas', ...nombres];
  });

  visibles = computed(() => {
    const term = this.busqueda().trim().toLowerCase();

    return this.productos().filter((p) => {
      const coincideCategoria =
        this.categoria() === 'Todas' ||
        (p.categoria?.nombre ?? 'Otros') === this.categoria();

      const coincideBusqueda =
        !term ||
        p.nombre.toLowerCase().includes(term) ||
        (p.descripcion ?? '').toLowerCase().includes(term);

      return coincideCategoria && coincideBusqueda;
    });
  });

  constructor() {
    addIcons({
      add,
      remove,
      searchOutline,
      restaurantOutline,
      refreshOutline,
    });
  }

  imagenPara(producto: Producto): string {
    const normalizar = (texto: string) => texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const porNombre = IMAGENES.find(([regex]) => regex.test(normalizar(producto.nombre)));
    const porCategoria = IMAGENES.find(([regex]) => regex.test(normalizar(producto.categoria?.nombre ?? '')));
    const archivo = (porNombre ?? porCategoria)?.[1] ?? 'pollo';
    return `assets/producto-${archivo}.jpg`;
  }

  ionViewWillEnter() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);

    return new Promise<void>((resolve) => {
      this.api.productos().subscribe({
        next: (data) => {
          this.productos.set(
            data.filter((p) => p.disponible)
          );

          this.error.set('');
          this.cargando.set(false);

          if (!this.categorias().includes(this.categoria())) {
            this.categoria.set('Todas');
          }

          resolve();
        },

        error: (e) => {
          this.error.set(
            errorMessage(e, 'No se pudo cargar el menú.')
          );

          this.cargando.set(false);
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
