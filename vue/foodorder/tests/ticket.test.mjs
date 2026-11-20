import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generarHtmlTicket, estadoCobroTicket } from '../src/utils/ticket.js';

const pedido = {
  id: 23,
  estado: 'pagado',
  precio_total: 10.17,
  fecha_pedido: '2026-11-20T20:28:00Z',
  cliente: { nombre: 'Cliente', apellido: 'Ejemplo' },
  mesa: { numero_mesa: 4 },
  pago: null,
  detalles: [
    { cantidad: 1, precio_unitario: 7, subtotal: 7, producto: { nombre: 'Hamburguesa' } },
    { cantidad: 1, precio_unitario: 2, subtotal: 2, producto: { nombre: 'Papas' } },
  ],
};

test('imprime importe e impuestos del pedido 23 y señala comprobante no fiscal', () => {
  const html = generarHtmlTicket(pedido);
  assert.match(html, /Ticket de pedido #23/);
  assert.match(html, /COMPROBANTE NO FISCAL/);
  assert.match(html, /Pagado en el local/);
  assert.match(html, /Hamburguesa/);
  assert.match(html, /\$9\.00/);
  assert.match(html, /\$1\.17/);
  assert.match(html, /\$10\.17/);
});

test('no permite inyectar HTML con el nombre del producto ni del cliente', () => {
  const html = generarHtmlTicket({
    ...pedido,
    cliente: { nombre: '<script>alert(1)</script>' },
    detalles: [{ cantidad: 1, subtotal: 2, producto: { nombre: '<img src=x onerror=alert(1)>' } }],
  });
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /&lt;img src=x/);
});

test('no confunde un pago Wompi simulado con dinero real', () => {
  assert.equal(estadoCobroTicket({ ...pedido, pago: { estado: 'prueba' } }), 'Pago de prueba (sin cobro real)');
  assert.equal(estadoCobroTicket({ ...pedido, pago: { estado: 'pendiente' } }), 'Pago en línea pendiente');
  assert.equal(estadoCobroTicket({ ...pedido, pago: { estado: 'pagado' } }), 'Pagado en línea con Wompi');
});

test('no imprime ticket si falta el detalle del pedido', () => {
  assert.throws(() => generarHtmlTicket({ id: 23 }), /datos suficientes/);
});
