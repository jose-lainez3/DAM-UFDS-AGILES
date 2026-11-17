# FoodOrder — funcionamiento en línea y publicación

Esta guía distingue **configuraciones verificadas en el repositorio** de datos privados que no están guardados en GitHub. El código identifica la API de AlwaysData; el dominio donde está publicado Vue y las credenciales de la base de datos remota se deben confirmar en el hosting.

## 1. Arquitectura en producción

```text
APK Android / Ionic ---- HTTPS ----┐
                                  ├── Laravel REST API --> MySQL/MariaDB remota
Panel administrativo Vue -- HTTPS-┘
                     tokens de Laravel Sanctum
```

- **API configurada para producción:** `https://foodorderapi.alwaysdata.net/api`.
- **Ionic:** lee esa URL de `Ionic/FoodOrder/src/environments/environment.prod.ts`.
- **Vue:** lee `VUE_APP_API_URL`; sin esa variable, `vue/foodorder/src/services/api.js` usa la API de AlwaysData como alternativa.
- **Laravel:** se conecta a una base de datos cuyos parámetros debe proporcionar el servidor en su `.env` privado. GitHub no incluye las credenciales.

La app instalada consume la API por internet; no necesita XAMPP encendido en la computadora del usuario. Sí necesita que el servidor y la base de datos estén disponibles.

## 2. Publicar/actualizar Laravel

El servidor necesita PHP compatible (Laravel 12, PHP 8.2+), Composer o dependencias instaladas, conexión MySQL/MariaDB, HTTPS y un servidor web cuyo directorio público sea `laravel/foodorder/public`.

Ejemplo **orientativo** de variables en el servidor; sustituye todos los marcadores:

```dotenv
APP_NAME=FoodOrder
APP_ENV=production
APP_DEBUG=false
APP_URL=https://TU_DOMINIO_API
APP_KEY=CLAVE_PRIVADA_EXISTENTE

DB_CONNECTION=mysql
DB_HOST=HOST_REAL
DB_PORT=3306
DB_DATABASE=BASE_REAL
DB_USERNAME=USUARIO_BD
DB_PASSWORD=CONTRASEÑA_PRIVADA

TASA_IMPUESTO=0.13
CORS_ALLOWED_ORIGINS=https://TU_DOMINIO_DEL_PANEL
```

Procedimiento típico, adaptado a los permisos y panel del proveedor:

```bash
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize
```

Genera `APP_KEY` **una sola vez al instalar**; no cambies la clave de una instalación existente porque puede invalidar información cifrada y sesiones. Respaldar la BD antes de migrar. Configurar escritura en `storage` y `bootstrap/cache`. El `.env` del hosting nunca se sube al repositorio.

**No ejecutes `migrate --seed` en producción** sin inspeccionar el seeder: incluye cuentas de demostración con contraseñas conocidas. Restringe CORS a los orígenes que realmente acceden desde navegador.

## 3. Publicar el panel administrativo Vue

Vue 3 utiliza `vue-cli-service`. Crea `vue/foodorder/.env.production` **solo en el equipo de compilación o como variable de tu proveedor**, por ejemplo:

```dotenv
VUE_APP_API_URL=https://foodorderapi.alwaysdata.net/api
```

Compila:

```bash
cd vue/foodorder
npm ci
npm run build
```

Publica el directorio generado `vue/foodorder/dist` en un hosting web estático. Como Vue Router utiliza `createWebHistory`, configura una regla de **fallback a `index.html`** para que recargar `/pedidos` u otra ruta no produzca 404.

**No se encontró en el repositorio un workflow de despliegue automático para Laravel ni para Vue.** Actualizar sus archivos en GitHub no modifica por sí solo el código publicado en sus hosting.

## 4. Publicar y actualizar el APK de Android

En `main`, cambios dentro de `Ionic/FoodOrder/**` inician dos flujos de GitHub Actions:

1. **`.github/workflows/android-apk.yml`:** compila Angular en producción, genera Android (Capacitor), aumenta el `versionCode` y firma el APK release. Publica el artefacto `FoodOrder-APK-Firmado` si existen los cuatro secretos.
2. **`.github/workflows/foodorder-ota.yml`:** crea un ZIP del contenido web, comprueba su SHA-256 y publica `latest.json` en la rama pública `foodorder-ota`.

Los secretos de firma de Actions se llaman:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

**Nunca subas la clave privada `.jks` o contraseñas al repositorio.** Conserva respaldo seguro; futuras actualizaciones Android deben utilizar la misma clave y el mismo `appId` (`com.joselainez3.foodorder`).

### ¿Cuándo se actualiza sola la app?

El servicio `foodorder-update.service.ts` consulta el manifiesto al iniciar la app, verifica el canal de compatibilidad y, si hay una versión web nueva, descarga el ZIP y recarga su interfaz. Una conexión a internet es necesaria para recibir nuevas versiones.

| Tipo de modificación | Forma de actualización |
| --- | --- |
| Angular, HTML o estilos del cliente Ionic | OTA, **sin reinstalar APK**, cuando el nuevo paquete se publique |
| Plugin nativo, permisos Android, configuración nativa | Crear **nuevo APK firmado** y actualizar la instalación |
| Vue administrativo | Publicar un nuevo `dist` en el hosting |
| API Laravel o base de datos | Desplegar backend y aplicar migraciones que correspondan |

El sistema **no** convierte pedidos y autenticación en funciones offline: esas operaciones siguen requiriendo la API y su base de datos.

Consulta [Ionic: firma y OTA](../Ionic/FoodOrder/ANDROID_FIRMA_OTA.md).

## 5. Comparación rápida: local y en línea

| Concepto | Desarrollo local | Producción en línea |
| --- | --- | --- |
| Base de datos | MySQL/MariaDB en PC | Base del servidor, credenciales privadas |
| Laravel | `http://127.0.0.1:8000/api` | `https://foodorderapi.alwaysdata.net/api` (configurada) |
| Vue | `npm run serve`, normalmente 8080 | Carpeta `dist` publicada en hosting |
| Ionic en navegador | `npx ionic serve`, normalmente 8100 | Solo si se publica una web adicional |
| APK firmado por GitHub | No usa la API local por defecto | Usa `environment.prod.ts` y API de producción |
| Cambios UI Android | Recarga durante desarrollo | OTA al iniciar, si se publicó y hay conexión |
| Seguridad | Configuraciones de pruebas | HTTPS, debug apagado, CORS estricto |

## 6. Lista de comprobación antes de entregar

- [ ] API responde JSON por HTTPS desde un navegador externo.
- [ ] Base de datos con respaldo y migraciones aplicadas.
- [ ] `APP_DEBUG=false` y clave de aplicación original respaldada.
- [ ] CORS acepta solo orígenes web autorizados.
- [ ] Vue compilado con la API correcta; sus rutas no generan 404 al recargar.
- [ ] APK Android firmado y verificado; la clave está resguardada.
- [ ] OTA probada en dispositivo físico sin reinstalar.
- [ ] No se publicaron `.env`, tokens ni claves privadas.

Para montar todo desde cero: [Instalación local](INSTALACION_LOCAL.md).
