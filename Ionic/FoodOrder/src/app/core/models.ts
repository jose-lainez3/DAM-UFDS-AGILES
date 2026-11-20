export type EstadoPedido = 'pendiente' | 'preparacion' | 'entregado' | 'pagado' | 'cancelado';

export const ESTADOS: Record<EstadoPedido, string> = {
  pendiente: 'Pendiente',
  preparacion: 'En preparación',
  entregado: 'Entregado',
  pagado: 'Pagado',
  cancelado: 'Cancelado',
};

// Color de Ionic para cada estado
export const COLOR_ESTADO: Record<EstadoPedido, string> = {
  pendiente: 'warning',
  preparacion: 'primary',
  entregado: 'success',
  pagado: 'medium',
  cancelado: 'danger',
};

export interface Rol {
  id: number;
  nombre: string;
}

export interface Usuario {
  id: number;
  username: string;
  correo: string;
  rol_id: number;
  estado: string;
  rol?: Rol;
  cliente?: Cliente | null;
}

export interface RegistroPayload {
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  username: string;
  clave: string;
}

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  correo?: string | null;
  telefono?: string | null;
}

export interface Mesa {
  id: number;
  numero_mesa: number;
  capacidad: number;
  estado: 'disponible' | 'ocupada' | 'reservada';
}

export interface Categoria {
  id: number;
  nombre: string;
}

export interface Producto {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  disponible: boolean;
  categoria?: Categoria;
}

export interface DetallePedido {
  id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto?: Producto;
}

export interface PagoPedido {
  id: number;
  proveedor: string;
  estado: 'pendiente' | 'pagado' | 'revision';
  monto: string | number;
  es_productivo: boolean | null;
  pagado_en?: string | null;
}

export interface Pedido {
  pago?: PagoPedido | null;
  id: number;
  estado: EstadoPedido;
  precio_total: number;
  fecha_pedido: string | null;
  created_at: string;
  cliente?: Cliente | null;
  mesa?: Mesa | null;
  usuario?: Usuario | null;
  detalles?: DetallePedido[];
}

export interface NuevoPedido {
  cliente_id?: number | null;
  mesa_id: number | null;
  estado: EstadoPedido;
  detalles: {
    producto_id: number;
    cantidad: number;
  }[];
}

export function nombreCompleto(c?: Cliente | null): string {
  return c ? [c.nombre, c.apellido].filter(Boolean).join(' ') : 'Sin cliente';
}
