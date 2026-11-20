// Comprobante interno de pedido. No es un Documento Tributario Electrónico (DTE).
// Los datos de la API se escapan para evitar inyección HTML en la ventana de impresión.
const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escaparHtmlTicket(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (caracter) => ENTIDADES[caracter]);
}

function dinero(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? '$' + numero.toFixed(2) : '—';
}

function fechaPedido(valor) {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-SV', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(fecha);
}

export function estadoCobroTicket(pedido) {
  if (pedido?.pago?.estado === 'pagado') return 'Pagado en línea con Wompi';
  if (pedido?.pago?.estado === 'prueba') return 'Pago de prueba (sin cobro real)';
  if (pedido?.pago?.estado === 'revision') return 'Cobro en revisión';
  if (pedido?.pago) return 'Pago en línea pendiente';
  if (pedido?.estado === 'pagado') return 'Pagado en el local';
  if (pedido?.estado === 'cancelado') return 'Pedido cancelado';
  return 'Pendiente de pago';
}

export function generarHtmlTicket(pedido) {
  if (!pedido || !Array.isArray(pedido.detalles)) {
    throw new Error('No hay datos suficientes para imprimir el ticket.');
  }
  const detalles = pedido.detalles;
  const subtotal = detalles.reduce((total, item) => {
    const valor = Number(item.subtotal);
    return total + (Number.isFinite(valor) ? valor : 0);
  }, 0);
  const total = Number(pedido.precio_total);
  const importe = Number.isFinite(total) ? total : 0;
  const impuesto = Math.max(0, importe - subtotal);

  const filas = detalles.map((d) => [
    '<tr><td>',
    escaparHtmlTicket(d.cantidad), ' × ',
    escaparHtmlTicket(d.producto?.nombre ?? 'Producto no disponible'),
    '</td><td class="numero">', dinero(d.subtotal), '</td></tr>',
  ].join('')).join('');

  const cliente = [pedido.cliente?.nombre, pedido.cliente?.apellido]
    .filter(Boolean).join(' ') || 'Consumidor final';
  const lugar = pedido.mesa ? 'Mesa ' + pedido.mesa.numero_mesa : 'Para llevar';

  return [
    '<!doctype html><html lang="es"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<title>Ticket FoodOrder #', escaparHtmlTicket(pedido.id), '</title>',
    '<style>',
    '@page{margin:4mm}',
    '*{box-sizing:border-box}',
    'body{font:12px/1.45 "Courier New",monospace;color:#111;margin:0 auto;padding:16px 6px;max-width:76mm}',
    'h1{font-size:19px;margin:0;letter-spacing:.06em;text-align:center}',
    'h2{font-size:13px;margin:4px 0 14px;text-align:center;font-weight:700}',
    '.advertencia{font-size:11px;text-align:center;border:1px dashed #333;padding:6px;margin:10px 0;font-weight:bold}',
    '.datos{margin:0 0 12px}.datos div{margin:3px 0}',
    'table{width:100%;border-collapse:collapse;table-layout:fixed}',
    'td{padding:6px 2px;vertical-align:top;overflow-wrap:anywhere}',
    'td:first-child{width:69%}.numero{text-align:right;white-space:nowrap}',
    'thead tr{border-bottom:1px dashed #333}',
    '.totales{border-top:1px dashed #333;margin-top:10px;padding-top:8px}',
    '.fila{display:flex;justify-content:space-between;gap:8px;margin:5px 0}',
    '.final{font-size:15px;font-weight:bold;border-top:1px dashed #333;margin-top:7px;padding-top:7px}',
    '.pie{text-align:center;margin-top:18px;font-size:11px}',
    '.acciones{margin:12px auto;text-align:center}',
    'button{border:1px solid #333;background:#fff;padding:9px 14px;font:inherit;cursor:pointer}',
    '@media print{.acciones{display:none}body{padding:0;max-width:76mm}}',
    '</style></head><body>',
    '<h1>FOODORDER</h1>',
    '<h2>Ticket de pedido #', escaparHtmlTicket(pedido.id), '</h2>',
    '<div class="advertencia">COMPROBANTE NO FISCAL<br>NO ES FACTURA ELECTRÓNICA</div>',
    '<div class="datos">',
    '<div>Fecha: ', escaparHtmlTicket(fechaPedido(pedido.fecha_pedido || pedido.created_at)), '</div>',
    '<div>Cliente: ', escaparHtmlTicket(cliente), '</div>',
    '<div>Entrega: ', escaparHtmlTicket(lugar), '</div>',
    '<div>Estado: ', escaparHtmlTicket(pedido.estado), '</div>',
    '<div>Pago: ', escaparHtmlTicket(estadoCobroTicket(pedido)), '</div>',
    '</div>',
    '<table><thead><tr><td>Producto</td><td class="numero">Importe</td></tr></thead><tbody>',
    filas || '<tr><td colspan="2">Sin productos registrados</td></tr>',
    '</tbody></table>',
    '<div class="totales">',
    '<div class="fila"><span>Subtotal</span><span>', dinero(subtotal), '</span></div>',
    '<div class="fila"><span>Impuestos</span><span>', dinero(impuesto), '</span></div>',
    '<div class="fila final"><span>TOTAL</span><span>', dinero(importe), '</span></div>',
    '</div>',
    '<p class="pie">Gracias por tu pedido.<br>',
    'Para una factura fiscal válida, consulta el DTE aceptado por Hacienda.</p>',
    '<div class="acciones"><button type="button" onclick="window.print()">Imprimir ticket</button></div>',
    '</body></html>',
  ].join('');
}
