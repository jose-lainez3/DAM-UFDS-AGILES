# FoodOrder — panel administrativo Vue

Panel web para el personal del restaurante: pedidos, nuevo pedido, cocina, productos, inventario y áreas de administración.

**Stack real del proyecto:** Vue 3, Vue Router 4, Axios y **Vue CLI** (`vue-cli-service`).

## Desarrollo local

Primero inicia la API Laravel y MySQL (consulta la [guía local](../../docs/INSTALACION_LOCAL.md)). Luego, desde la raíz del repositorio:

```powershell
cd .\vue\foodorder
npm ci
npm run serve
```

Accede normalmente a `http://localhost:8080`.

El archivo `.env.development` controla la API en desarrollo:

```dotenv
VUE_APP_API_URL=http://127.0.0.1:8000/api
```

Si la API está en otra máquina o puerto, cambia la dirección, guarda y **reinicia** el servidor Vue. La URL se consulta desde `src/services/api.js`.

Los usuarios de prueba creados por `laravel/foodorder/database/seeders/DatabaseSeeder.php` son `admin`, `mesero`, `cocinero` y `cajero` con contraseñas de demostración. **No las uses en producción**.

## Compilación y publicación web

```powershell
cd .\vue\foodorder
npm ci
npm run build
```

Publica la carpeta generada `dist` en tu hosting web. Para usar una API de producción, define `VUE_APP_API_URL` durante la compilación (por ejemplo, en un `.env.production` del equipo de build):

```dotenv
VUE_APP_API_URL=https://foodorderapi.alwaysdata.net/api
```

`src/services/api.js` también tiene esta API como valor predeterminado si la variable no está definida. Vue Router usa `createWebHistory`; configura el servidor para devolver `index.html` cuando se soliciten rutas como `/pedidos` o `/cocina`.

**Publicación adicional:** el workflow `.github/workflows/foodorder-pwa.yml` ahora publica también este panel como **PWA de escritorio en GitHub Pages**, en `/DAM-UFDS-AGILES/admin/`. Esto no reemplaza ni publica automáticamente una instalación de Vue en Vercel u otro hosting. Consulta [PWA de escritorio](PWA_ESCRITORIO.md).

## Organización

- `src/views`: vistas de pedidos, cocina, productos, inventario, personal, reportes y configuración.
- `src/router/index.js`: rutas, autenticación y protección según rol.
- `src/services/api.js`: Axios, URL del backend y envío de token Bearer.
- `src/services/auth.js` y `session.js`: inicio/cierre de sesión y estado local.

El panel está destinado a personal autorizado; los clientes utilizan principalmente Ionic. Todo el trabajo real con datos pasa por la API Laravel.

## Documentos

- [README general](../../README.md)
- [Instalación local completa](../../docs/INSTALACION_LOCAL.md)
- [Despliegue y funcionamiento online](../../docs/FUNCIONAMIENTO_ONLINE.md)
- [Arquitectura y cambios](../../docs/ARQUITECTURA_Y_CAMBIOS.md)

## Instalación como aplicación de escritorio

En Chrome o Edge puedes instalar FoodOrder Admin como PWA y abrirlo en una ventana independiente. No necesita .exe ni Microsoft Store. Guía completa: [PWA de escritorio](PWA_ESCRITORIO.md).
