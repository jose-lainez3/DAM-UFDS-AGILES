# FoodOrder — arquitectura y cambios realizados

## Objetivo y organización

FoodOrder unifica pedidos de restaurante en una **API Laravel** y ofrece dos interfaces que comparten sus datos: **Vue para el personal** e **Ionic Angular para los clientes**.

| Parte | Tecnología real en el repositorio | Responsabilidad |
| --- | --- | --- |
| `laravel/foodorder` | PHP 8.2+, Laravel 12, Sanctum, MySQL/MariaDB | API, autenticación, pedidos, mesas, menú, inventario |
| `vue/foodorder` | Vue 3, Vue Router, Axios, **Vue CLI** | Panel administrativo y del personal |
| `Ionic/FoodOrder` | Angular 22, Ionic 9, Capacitor 8 | Menú, carrito, pedidos, perfil y APK Android |

No son tres bases de datos: Vue e Ionic consultan y modifican información mediante el mismo backend.

## Flujo principal

```text
Cliente Ionic -- peticiones JSON --> Laravel REST API <-- peticiones JSON -- Vue administrativo
       ↑                           │
  Menú, carrito, perfil        Sanctum, roles, validación
                                   │
                                   ▼
                              MySQL / MariaDB
```

1. El cliente puede consultar `GET /api/productos` y `GET /api/categorias` sin iniciar sesión.
2. `POST /api/auth/register` crea cuenta y ficha de cliente; `POST /api/auth/login` devuelve un token Laravel Sanctum.
3. Las operaciones protegidas envían `Authorization: Bearer <token>` mediante los servicios/interceptores de los frontend.
4. Al crear un pedido, Laravel comprueba disponibilidad de mesa/productos, calcula precios y guarda la operación dentro de una transacción.
5. El personal utiliza Vue para consultar pedidos, cocina, productos, inventario y administración.
6. Los usuarios con rol Cliente solo pueden consultar sus pedidos correspondientes; el backend limita qué operaciones pueden realizar.

La progresión habitual de estados es `pendiente → preparación → entregado → pagado`, con opción de `cancelado` según las reglas. La cuenta cliente puede cancelar su pedido únicamente mientras está pendiente.

## Funciones que contiene el código

**Laravel:** autenticación con hash de contraseña y Sanctum; categorías/productos; clientes; mesas; pedidos/detalles; inventario; roles/usuarios; tasa de impuesto configurable mediante `TASA_IMPUESTO`.

**Vue:** acceso para personal; pedidos y detalle; nuevo pedido; cocina; productos; inventario; vistas de gestión de personal, reportes y configuración. El enrutamiento contiene protección de páginas por sesión/rol.

**Ionic:** exploración sin cuenta; registro/login; menú y categorías; carrito; selección de mesa; historial de pedidos y detalle; perfil y cierre de sesión. La pantalla Perfil incorpora información sobre la versión instalada.

Los archivos de migración incluyen `usuarios`, `rols`, `clientes`, `mesas`, `categorias`, `productos`, `pedidos`, `detalle_pedidos`, `inventarios` y tokens de Sanctum, más tablas internas de Laravel.

## Mejoras de la aplicación Android

- **API de producción configurada:** `https://foodorderapi.alwaysdata.net/api` en `environment.prod.ts`.
- **Firma permanente:** GitHub Actions usa cuatro secretos de firma y verifica el APK release.
- **APK automático:** GitHub Actions compila y ofrece el artefacto `FoodOrder-APK-Firmado`.
- **Actualizaciones OTA:** un segundo workflow crea un ZIP + `latest.json` en la rama `foodorder-ota`; el APK consulta esa actualización al iniciarse y recarga los nuevos recursos web.
- **Área segura Android:** barra de navegación inferior adaptada para no superponerse con los controles del sistema.
- **Login nativo:** estilos centrados y espaciado ajustado **solo para la app instalada**, sin alterar el aspecto del navegador.
- **Perfil:** indicador de versión del APK o de la actualización OTA instalada.

La prueba OTA se hizo mostrando temporalmente un aviso en el menú, comprobándolo desde un teléfono **sin reinstalar**, y retirándolo después. La distribución está configurada para contenido web; modificar permisos o plugins nativos requiere generar e instalar un nuevo APK firmado.

## Diferencias que debe conocer quien continúe el proyecto

| Modificación | Dónde hacerlo | Cómo probar/publicar |
| --- | --- | --- |
| Cambiar base de datos local | `laravel/foodorder/.env` | Reiniciar backend, migraciones si procede |
| Cambiar API de Vue local | `vue/foodorder/.env.development` | Reiniciar `npm run serve` |
| Cambiar API de Vue publicada | `VUE_APP_API_URL` durante build | Compilar y desplegar `dist` |
| Cambiar API de Ionic local | `src/environments/environment.ts` | `npx ionic serve` / build de desarrollo |
| Cambiar API del APK release | `src/environments/environment.prod.ts` | Generar nueva versión de producción |
| Modificar la interfaz Ionic | `Ionic/FoodOrder/src/app` | Commit/push y nueva OTA |
| Cambiar Android nativo | Configuración y plugins de Capacitor | Nuevo APK firmado; compatibilidad del canal OTA |
| Cambiar Laravel online | Código de Laravel + hosting | No hay despliegue automático del backend en GitHub Pages |
| Cambiar Vue en la PWA de escritorio | `vue/foodorder/**` | GitHub Actions publica en Pages bajo `/admin/` |
| Cambiar Vue en otro hosting | Código Vue + hosting | Requiere despliegue propio del proveedor |

**Seguridad:** el seeder incluye usuarios de prueba (`admin`, `mesero`, `cocinero`, `cajero`) con claves conocidas; no son adecuados para una instalación pública. Guardar credenciales y claves solo en gestores de secretos o en el servidor, fuera de GitHub.

## Para explicar el proyecto en una defensa

> FoodOrder usa una API Laravel como núcleo: allí se administran autenticación, roles, pedidos, mesas y el almacenamiento en MySQL. El panel Vue permite operar el restaurante y la aplicación Ionic permite a los clientes pedir desde un teléfono. Ambos se comunican con la misma API. Automatizamos la compilación y firma de Android mediante GitHub Actions y agregamos actualizaciones remotas de la interfaz para no reinstalar el APK al cambiar HTML, estilos o Angular.

Las funcionalidades descritas reflejan los módulos presentes en el repositorio. La calidad de cada caso de uso debe comprobarse con pruebas antes de una entrega de producción.

**Más información:** [Instalación local](INSTALACION_LOCAL.md) · [En línea](FUNCIONAMIENTO_ONLINE.md) · [Firma y OTA](../Ionic/FoodOrder/ANDROID_FIRMA_OTA.md).

**Aplicación de escritorio:** Vue también dispone de una PWA instalable desde Chrome/Edge. Comparte la API Laravel y se publica en GitHub Pages junto a la PWA móvil, sin sustituir el panel que ya se usa en otro hosting. Véase [PWA escritorio](../vue/foodorder/PWA_ESCRITORIO.md).
