import { Injectable, computed, signal } from '@angular/core';
import { Producto } from './models';

const CART_KEY = 'foodorder_cart';

export interface LineaCarrito {
  producto: Producto;
  cantidad: number;
}

/** Carrito del cliente. Se guarda en el dispositivo, así no se pierde al cerrar la app ni al iniciar sesión. */
@Injectable({ providedIn: 'root' })
export class CartService {
  private _lineas = signal<LineaCarrito[]>(this.leer());

  readonly lineas = this._lineas.asReadonly();
  readonly unidades = computed(() => this._lineas().reduce((s, l) => s + l.cantidad, 0));
  readonly subtotal = computed(() =>
    this._lineas().reduce((s, l) => s + Number(l.producto.precio) * l.cantidad, 0),
  );

  cantidad(id: number): number {
    return this._lineas().find((l) => l.producto.id === id)?.cantidad ?? 0;
  }

  cambiar(producto: Producto, delta: number) {
    const nueva = Math.max(0, this.cantidad(producto.id) + delta);
    const resto = this._lineas().filter((l) => l.producto.id !== producto.id);
    this.establecer(nueva === 0 ? resto : [...resto, { producto, cantidad: nueva }].sort((a, b) => a.producto.id - b.producto.id));
  }

  vaciar() {
    this.establecer([]);
  }

  private establecer(lineas: LineaCarrito[]) {
    this._lineas.set(lineas);
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(lineas));
    } catch {
      /* sin almacenamiento: el carrito queda solo en memoria */
    }
  }

  private leer(): LineaCarrito[] {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]');
    } catch {
      return [];
    }
  }
}
