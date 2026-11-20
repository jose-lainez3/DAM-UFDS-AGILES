# FoodOrder - Integración de cobros Wompi El Salvador

## Estado de esta entrega

Integración preparada en la rama de desarrollo \`feature/wompi-foodorder\`. **No activada para cobros reales**: requiere credenciales propias de Wompi, migraciones, URL pública y pruebas de extremo a extremo. No se ha probado con una cuenta Wompi real.

La pantalla de tarjetas la proporciona Wompi, no FoodOrder. La API Laravel calcula el total del pedido desde productos e impuesto configurado, crea un enlace y almacena el registro de pago. Los secretos solo existen en el backend.

## Configuración

1. Crear o acceder a un negocio en https://panel.wompi.sv y obtener \`App ID\` (client ID) y \`API Secret\` (client secret), comenzando en modo desarrollo.
2. Editar exclusivamente \`laravel/foodorder/.env\` en el **servidor Laravel que recibe las peticiones**:

   \`\`\`dotenv
   APP_URL=https://TU-API-PUBLICA.example
   WOMPI_CLIENT_ID=TU_APP_ID
   WOMPI_CLIENT_SECRET=TU_API_SECRET
   WOMPI_PRODUCTION=false
   # Opcional: una página web HTTPS que permita volver a FoodOrder.
   WOMPI_RETURN_URL=
   \`\`\`

3. Ejecutar desde \`laravel/foodorder\`:

   \`\`\`bash
   php artisan migrate
   php artisan config:clear
   php artisan route:list --path=api
   php artisan test --filter=WompiWebhookTest
   \`\`\`

4. Confirmar que la API de \`environment.prod.ts\` de Ionic apunta a **ese mismo servidor Laravel actualizado**, no a una copia antigua. El navegador/app necesita acceso HTTPS a la API; localhost y la base de datos XAMPP no son públicamente accesibles para webhooks.
5. Probar primero con el negocio Wompi en desarrollo, crear un pedido y abrir desde su detalle «Pagar en línea con Wompi». La pantalla se abre en un navegador; al volver a Ionic, usar «Actualizar estado de pago».
6. Confirmar en **base de datos y panel Wompi** que cada transacción de prueba cambia \`pagos.estado\` a \`pagado\`. Repetir el webhook para probar idempotencia y enviar un hash incorrecto para probar rechazo.
7. Solo tras conciliación con la cuenta real, cambiar \`WOMPI_PRODUCTION=true\` y credenciales al negocio Wompi productivo; limpiar la caché de configuración.

## Rutas

- \`POST /api/pedidos/{pedido}/pagos/wompi\` — requiere token Sanctum. Genera o reutiliza el enlace de cobro de ese pedido. Los clientes solo pueden cobrar pedidos propios.
- \`POST /api/webhooks/wompi\` — pública para Wompi, protegida por HMAC SHA-256 en header \`wompi_hash\`.
- \`GET /api/pedidos/{pedido}\` — incluye relación \`pago\`: \`estado\`, \`monto\`, fecha, referencia y proveedor.

## Semántica de estados

- \`pedidos.estado\`: representa el **flujo operativo de cocina** como antes (\`pendiente\`, \`preparacion\`, \`entregado\`, \`pagado\`, \`cancelado\`).
- \`pagos.estado\`: representa exclusivamente el **cobro en línea** (\`pendiente\`, \`pagado\`, \`revision\`).
- La confirmación válida del webhook **no** marca \`pedidos.estado=pagado\`, para no cerrar pedidos antes de prepararlos.
- Un pedido con enlace Wompi no se puede borrar, cambiar de precio ni cancelar por la interfaz actual sin anular primero el enlace en Wompi. Se evita perder trazabilidad.
- La pantalla Vue puede cerrar un pedido entregado con estado \`pagos.estado=pagado\`; el flujo habitual de efectivo sigue disponible cuando no se creó un enlace.

## Limitaciones conocidas antes de producción

- La creación del enlace hace una llamada HTTP externa dentro de la transacción DB: ante un timeout remoto puede crearse un enlace huérfano. Revisar en Wompi usando \`referencia\` antes de permitir nuevos intentos; idealmente implementar reconciliación y cancelación del enlace con su API.
- Wompi podría cobrar después de un evento de cierre o conciliación manual: requiere proceso de revisión/reembolso. El campo \`revision\` está preparado.
- En Android, el enlace abre un navegador externo; probar la navegación en un APK real, así como las restricciones de ventanas emergentes del navegador web.
- No se añaden automáticamente impuestos nuevos ni se modifica el precio: \`precio_total\` es calculado previamente en el backend.
- La URL de \`APP_URL\` tiene que ser HTTPS pública para entrega del webhook. Si tu API funciona únicamente en XAMPP local, necesitas despliegue accesible públicamente (o un túnel temporal seguro para desarrollo).
- El estado \`pagado\` en el flujo operativo existente no significa necesariamente que Wompi haya cobrado; el campo \`pagos.estado\` es la fuente de verdad para pagos Wompi.
- Revisar políticas de devoluciones, cuotas y requisitos contractuales con el proveedor antes de aceptar dinero real.

## Referencias oficiales

- [Autenticación OAuth](https://docs.wompi.sv/autenticacion/autenticacion)
- [Crear enlace](https://docs.wompi.sv/metodos-api/enlace-de-pago.md)
- [Webhook y formato](https://docs.wompi.sv/webhook/definicion-webhook.md)
- [Validación criptográfica](https://docs.wompi.sv/webhook/validar-webhook.md)
- [Transacciones de prueba](https://docs.wompi.sv/metodos-api/transaccion_prueba.md)
