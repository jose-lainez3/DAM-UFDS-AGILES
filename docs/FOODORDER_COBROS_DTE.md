# FoodOrder — Wompi y facturación electrónica (DTE-01, El Salvador)

## Alcance y estado

Esta integración agrega **cobro Wompi en modo desarrollo/producción según credenciales** y **emisión de Factura de Consumidor Final DTE-01** mediante el proveedor externo Lumen DTE. El proveedor fue elegido como adaptador documentado, **no como obligación**: puede reemplazarse por integración directa con el Ministerio de Hacienda si el negocio dispone de la infraestructura fiscal correspondiente.

**No está activado el cobro real ni la emisión fiscal** sin completar los datos de cada comercio. No se han probado transacciones reales contra una cuenta específica de Wompi, Lumen ni Hacienda. No escribir credenciales en GitHub, Ionic ni Vue. Las claves deben configurarse solo en el backend Laravel.

### Antes de empezar

* Debe haber **un backend Laravel público HTTPS y una única base de datos oficial accesible por él**. Wompi envía notificaciones desde internet. Si FoodOrder aún guarda los pedidos en XAMPP local y la API pública no accede a esa base, no se puede habilitar el cobro online de forma confiable. No abras MySQL al público.
* Actualizar Laravel y ejecutar \`php artisan migrate\` desde \`laravel/foodorder\`.
* Desplegar Vue/Ionic (Ionic usa OTA, **no se requiere nuevo APK para estos cambios web**).
* No crear facturas válidas con datos de demostración. Un contribuyente debe ser emisor autorizado por el Ministerio de Hacienda de El Salvador y usar certificado/servicio de firma apropiado y sello de recepción. Los documentos en ambiente de pruebas **carecen de validez fiscal**.

## 1. Wompi El Salvador

Abrir https://panel.wompi.sv y obtener **App ID** y **API Secret** del negocio en desarrollo. En \`laravel/foodorder/.env\` del servidor que atiende la API:

\`\`\`dotenv
APP_URL=https://TU_API_PUBLICA.example
WOMPI_CLIENT_ID=TU_APP_ID
WOMPI_CLIENT_SECRET=TU_API_SECRET
WOMPI_PRODUCTION=false
WOMPI_RETURN_URL=
\`\`\`

El endpoint para el webhook es \`https://TU_API_PUBLICA.example/api/webhooks/wompi\` (POST), validado mediante HMAC SHA-256 del cuerpo sin modificar y encabezado \`wompi_hash\`. No requiere token Sanctum.

El cliente realiza un pedido y solicita un enlace Wompi: \`POST /api/pedidos/{id}/pagos/wompi\`. El servidor crea la referencia antes de la petición externa para evitar repetir enlaces después de un timeout. Si un intento falla o queda en estado \`revision\`, verificar la referencia en Wompi **antes** de volver a intentar; no generar pagos duplicados.

En sandbox una transacción confirmada se registra como \`pagos.estado=prueba\`, **no** como \`pagado\`. En producción la confirmación firmada, con importe y referencia exactos, registra \`pagado\`. El pago electrónico y la preparación de cocina son estados separados.

**Activar producción:** solo después de verificar la cuenta, su contrato, un dominio HTTPS operativo, la coincidencia entre el webhook y la base oficial, y la conciliación de montos. Sustituir credenciales por las productivas y usar \`WOMPI_PRODUCTION=true\`. **El entorno debe coincidir** con el que informa Wompi.

## 2. Facturación electrónica — proveedor Lumen (opcional)

Es posible usar el sistema oficial de Hacienda directamente, pero eso requiere generar DTE conforme a los anexos vigentes, firmar, transmitir, manejar invalidaciones, contingencia, persistencia y códigos. Para esta implementación se preparó un adaptador de terceros documentado [Lumen DTE](https://www.lumendte.com/docs/facturacion/crear-factura). **Puede tener costos/licencia y requiere aceptación del proveedor**. Los datos de ejemplo no están autorizados para facturación real.

Se debe registrar ante Hacienda como emisor de DTE, disponer del NIT/NRC y configurar empresa, establecimiento y punto de venta en la plataforma fiscal y en Lumen. En el **.env de Laravel**:

\`\`\`dotenv
DTE_LUMEN_ENABLED=false
DTE_LUMEN_PRODUCTION=false
DTE_LUMEN_PRODUCTION_CONFIRMED=false
DTE_LUMEN_API_KEY=
DTE_LUMEN_COMPANY_NRC=
DTE_LUMEN_ESTABLISHMENT=
DTE_LUMEN_POINT_OF_SALE=
\`\`\`

Para probar, ingresar credenciales sandbox y datos de la empresa de **pruebas**, luego cambiar **solo** \`DTE_LUMEN_ENABLED=true\`. Ejecutar:

\`\`\`bash
php artisan migrate
php artisan config:clear
php artisan route:list --path=api
php artisan test --filter=LumenDteServiceTest
php artisan test --filter=WompiWebhookTest
\`\`\`

**Producción** requiere credenciales productivas verificadas y, después de las pruebas y autorización de Hacienda, establecer explícitamente \`DTE_LUMEN_PRODUCTION=true\` y \`DTE_LUMEN_PRODUCTION_CONFIRMED=true\`. No hagas esto con una empresa de demostración.

### Flujo

1. El cliente realiza el pedido y paga en el local o con Wompi productivo. Un webhook de sandbox no permite facturación fiscal.
2. Un administrador revisa en **Vue → Detalle de pedido → Facturación electrónica** el importe y selecciona el medio de pago verdadero (CAT-017: efectivo, tarjeta débito/crédito, transferencia, dinero electrónico u otros).
3. El administrador solicita el **DTE-01**, explícitamente; no se emite solo por recibir un pago o por cerrar cocina.
4. Laravel guarda una instantánea cifrada, clave idempotente, estado y respuesta del proveedor. No puede emitirse otro DTE para la misma orden.
5. Si el proveedor devuelve \`PROCESSED\` con sello y ambiente \`PRODUCTION\`, aparece **emitido**; si es \`SANDBOX\`, aparece **prueba**; si \`DRAFT\`, **borrador**. Solo \`emitido\` significa que el sistema confirmó recepción en producción.
6. El administrador o el cliente autorizado pueden consultar \`GET /api/pedidos/{id}/factura\` y solicitar URL temporal PDF/JSON con \`GET /api/pedidos/{id}/factura/archivo?formato=pdf\` o \`json\`. No guardar esas URLs (expiran); regenerarlas por petición autenticada.

El código usa \`POST https://api-sandbox.lumendte.com/v1/invoices\` para pruebas y \`POST https://api.lumendte.com/v1/invoices\` para producción. El adaptador envía \`Idempotency-Key\`, NRC y los códigos establecimiento/punto de venta.

### Limitaciones que requieren trabajo de cumplimiento antes de operar fiscalmente

* Se integra exclusivamente **Factura de Consumidor Final (01)** para productos gravados con **IVA 13 %**, con total hasta $25,000. No implementa CCF (03), exenciones, no sujetos, descuentos fiscales, retenciones, propinas, destinatarios con identificación obligatoria ni invalidaciones fiscales.
* FoodOrder guarda el precio unitario **antes de IVA**; Lumen solicita precio **con IVA**. El servicio concilia ítems y total y **rechaza** cualquier discrepancia en lugar de emitir una factura con monto incorrecto. Validar la política de IVA y redondeo con un contador antes de pasar a producción.
* El proveedor puede devolver \`UNCONFIRMED\`/timeout: **no reemitir ciegamente**. El registro pasa a \`revision\`; conciliar con Lumen/Hacienda utilizando el código y clave idempotente.
* La base de datos almacena referencias, identificadores y datos cifrados, pero **no** implementa archivado definitivo del DTE firmado y PDF. Definir el plazo de conservación legal y un almacenamiento privado antes de producción; URLs temporales del proveedor no equivalen a archivado fiscal.
* Es necesario definir invalidaciones, contingencia, corrección de datos, auditoría de decisiones y política de envío al receptor antes de operar fiscalmente con clientes reales.
* La API de facturación está **deshabilitada por defecto**. El usuario final de Ionic solo consulta las facturas y los recibos generados; no puede emitir directamente sin autorización.
* Las cuentas de Wompi y Lumen son servicios diferentes; activar una no activa automáticamente la otra.

## Documentación externa

- [Wompi OAuth](https://docs.wompi.sv/autenticacion/autenticacion)
- [Wompi Enlaces de Pago](https://docs.wompi.sv/metodos-api/enlace-de-pago)
- [Wompi Validación de webhook](https://docs.wompi.sv/webhook/validar-webhook)
- [Ministerio de Hacienda, facturación electrónica](https://www.mh.gob.sv/facturacion-electronica/)
- [Lumen DTE-01](https://www.lumendte.com/docs/facturacion/crear-factura)
