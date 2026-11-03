import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Categoria, EstadoPedido, NuevoPedido, Pedido, Producto } from './models';

export interface Mesa {
  id: number;
  numero_mesa: number;
  capacidad: number;
  estado: 'disponible' | 'ocupada' | 'reservada' | string;
}

/** API Laravel. El authInterceptor agrega el token Sanctum. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  pedidos(estados?: EstadoPedido[]) {
    let params = new HttpParams();
    if (estados?.length) params = params.set('estado', estados.join(','));
    return this.http.get<Pedido[]>(`${this.base}/pedidos`, { params });
  }

  pedido(id: number | string) {
    return this.http.get<Pedido>(`${this.base}/pedidos/${id}`);
  }

  crearPedido(payload: NuevoPedido) {
    return this.http.post<{ message: string; data: Pedido }>(`${this.base}/pedidos`, payload);
  }

  cancelarPedido(id: number) {
    return this.http.put<{ message: string; data: Pedido }>(`${this.base}/pedidos/${id}`, { estado: 'cancelado' });
  }

  productos() {
    return this.http.get<Producto[]>(`${this.base}/productos`);
  }

  categorias() {
    return this.http.get<Categoria[]>(`${this.base}/categorias`);
  }

  mesas() {
    return this.http.get<Mesa[]>(`${this.base}/mesas`);
  }

  /** Mesas que se pueden seleccionar al crear un pedido. */
  mesasDisponibles() {
    return this.mesas(); // Filtrar estado === 'disponible' en el carrito.
  }

  configuracion() {
    return this.http.get<{ tasa_impuesto: number }>(`${this.base}/configuracion`);
  }
}
