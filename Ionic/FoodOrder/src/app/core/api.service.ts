import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Categoria, Cliente, EstadoPedido, Mesa, NuevoPedido, Pedido, Producto } from './models';

/** Acceso tipado a la API de Laravel (/api). El token lo añade authInterceptor. */
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

  cambiarEstado(id: number, estado: EstadoPedido) {
    return this.http.put<{ message: string; data: Pedido }>(`${this.base}/pedidos/${id}`, { estado });
  }

  mesas() {
    return this.http.get<Mesa[]>(`${this.base}/mesas`);
  }

  clientes() {
    return this.http.get<Cliente[]>(`${this.base}/clientes`);
  }

  crearCliente(cliente: Pick<Cliente, 'nombre' | 'apellido'>) {
    return this.http.post<{ message: string; data: Cliente }>(`${this.base}/clientes`, cliente);
  }

  productos() {
    return this.http.get<Producto[]>(`${this.base}/productos`);
  }

  categorias() {
    return this.http.get<Categoria[]>(`${this.base}/categorias`);
  }

  configuracion() {
    return this.http.get<{ tasa_impuesto: number }>(`${this.base}/configuracion`);
  }
}
