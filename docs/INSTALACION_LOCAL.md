# FoodOrder — instalación local (Windows/XAMPP)

Para instalar el proyecto desde cero se necesitan tres terminales: **Laravel API**, **Vue administrativo** y **cliente Ionic**. Los tres módulos funcionan por separado, pero consumen la misma base de datos mediante Laravel.

## 1. Preparativos

- Git y un editor (VS Code, por ejemplo).
- PHP **8.2 o posterior** y Composer (requisito declarado en `laravel/foodorder/composer.json`).
- MySQL/MariaDB (por ejemplo, XAMPP) y, opcionalmente, phpMyAdmin.
- Node.js **24.x** y npm.
- Android Studio, JDK y SDK Android **solo** si quieres compilar el APK localmente.

Verifica en PowerShell:

```powershell
php -v
composer --version
node -v
npm -v
git --version
```

Clona el repositorio:

```powershell
git clone https://github.com/jose-lainez3/DAM-UFDS-AGILES.git
cd DAM-UFDS-AGILES
```

No hace falta moverlo a `htdocs`: Laravel usa su propio servidor local.

## 2. Configurar MySQL/MariaDB

En XAMPP inicia **MySQL**. Para usar phpMyAdmin, también inicia Apache y abre `http://localhost/phpmyadmin`. Crea una base:

```sql
CREATE DATABASE IF NOT EXISTS foodorder
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Importante:** usa el mismo nombre `foodorder` en SQL y en `DB_DATABASE` del backend. Puedes cambiarlo por otro, pero en ambas partes debe coincidir.

## 3. Configurar y arrancar Laravel

Desde la raíz del repositorio:

```powershell
cd .\laravel\foodorder
composer install
Copy-Item .env.example .env
```

En `laravel/foodorder/.env` configura, como ejemplo para XAMPP local:

```dotenv
APP_NAME=FoodOrder
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=foodorder
DB_USERNAME=root
DB_PASSWORD=

TASA_IMPUESTO=0.13
CORS_ALLOWED_ORIGINS=*
```

Ajusta `DB_USERNAME`, `DB_PASSWORD`, `DB_PORT` si tu base de datos es distinta. `CORS_ALLOWED_ORIGINS=*` solo es adecuado para **desarrollo**, no para un servidor público.

```powershell
php artisan key:generate
php artisan optimize:clear
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

`migrate --seed` crea tablas y datos iniciales de demostración. Si tu base contiene datos valiosos, respáldala primero; para aplicar nuevas migraciones sin reiniciar tablas usa `php artisan migrate`. **No uses `migrate:fresh` sin querer eliminar los datos**.

Comprueba:
- `http://127.0.0.1:8000/api/productos` (lista JSON de productos, pública).
- `http://127.0.0.1:8000/api/categorias` (categorías, pública).

Las rutas de pedidos necesitan token de sesión (un 401 sin token es esperable).

### Usuarios de demostración

El seeder `DatabaseSeeder.php` crea las siguientes cuentas para una **base local nueva**:

| Usuario | Contraseña inicial | Rol |
| --- | --- | --- |
| `admin` | `admin123` | Administrador |
| `mesero` | `mesero123` | Mesero |
| `cocinero` | `cocina123` | Cocinero |
| `cajero` | `cajero123` | Cajero |

**Jamás** uses esas contraseñas en un servidor público. No ejecutes el seeder de demostración en producción sin revisarlo.

## 4. Ejecutar el panel web Vue

Abre **otra terminal** desde la raíz:

```powershell
cd .\vue\foodorder
npm ci
npm run serve
```

Abre `http://localhost:8080` (o el puerto mostrado en consola). La dirección del backend se obtiene de `vue/foodorder/.env.development`:

```dotenv
VUE_APP_API_URL=http://127.0.0.1:8000/api
```

Si cambias de puerto o dominio la API, actualiza esa línea y reinicia el proceso de Vue. **Este módulo usa Vue CLI**, no Vite.

## 5. Ejecutar Ionic en el navegador

Abre una **tercera terminal**:

```powershell
cd .\Ionic\FoodOrder
npm ci
npx ionic serve
```

Abre `http://localhost:8100` (o la URL que muestre el servidor). En desarrollo, `Ionic/FoodOrder/src/environments/environment.ts` incluye:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
};
```

Mantén abiertos Laravel, Vue e Ionic, además del servicio MySQL.

## 6. Probar Ionic contra una API local desde Android

**No uses `localhost` dentro de un teléfono**: se refiere al teléfono, no al PC.

- **Emulador Android:** suele utilizar `http://10.0.2.2:8000/api`.
- **Teléfono físico:** usa la dirección IPv4 de tu computadora, por ejemplo `http://192.168.1.50:8000/api`, con ambos en la misma Wi-Fi. Obtén la IP mediante `ipconfig`.
- Para aceptar conexiones de la red, inicia Laravel con `php artisan serve --host=0.0.0.0 --port=8000`; revisa el firewall de Windows.

Cambia `environment.ts` a la dirección correspondiente y compila en **modo desarrollo**:

```powershell
cd .\Ionic\FoodOrder
npm ci
npm run build -- --configuration development
npx cap add android
npx cap sync android
npx cap open android
```

`npx cap add android` se hace **solo cuando aún no exista** la carpeta Android; las siguientes veces usa `npx cap sync android`. En este repositorio el proyecto Android se genera durante la compilación.

**Cuidado:** Android puede bloquear solicitudes HTTP a una API de red local por su política de seguridad. Puede requerirse una configuración de tráfico claro específica para pruebas y un nuevo build nativo; para producción usa HTTPS y no habilites HTTP de manera general.

### Diferencia entre compilar para local y para producción

- `npm run build -- --configuration development` → utiliza `environment.ts` (local o IP).
- `npm run build -- --configuration production` → utiliza `environment.prod.ts`, actualmente `https://foodorderapi.alwaysdata.net/api`.
- **El APK firmado de GitHub se compila en producción**. No apunta a tu XAMPP aunque cambies solo `environment.ts`.

## 7. Problemas frecuentes

| Problema | Revisión |
| --- | --- |
| Error `SQLSTATE` | MySQL activo, credenciales, nombre y puerto de DB en `.env` |
| Vue/Ionic sin productos | Probar `/api/productos` y comprobar la URL de API correspondiente |
| CORS | `CORS_ALLOWED_ORIGINS`; limpiar caché con `php artisan optimize:clear` |
| Error 401 | Autenticación o token Sanctum ausente/caducado |
| Error 403 | Cuenta sin autorización o estado/rol incorrecto |
| Android no conecta | IP local, misma red, firewall y restricciones HTTP de Android |
| Cambio `.env` sin efecto | `php artisan optimize:clear` y reiniciar el servidor |
| Error de migraciones | `php artisan migrate:status`; no borrar BD con datos |

Registro de errores de Laravel: `laravel/foodorder/storage/logs/laravel.log`.

## 8. Inicio normal después de instalar

1. Inicia MySQL.
2. En `laravel/foodorder` ejecuta `php artisan serve`.
3. En `vue/foodorder` ejecuta `npm run serve`.
4. En `Ionic/FoodOrder` ejecuta `npx ionic serve`.

La instalación de dependencias y las migraciones no tienen que repetirse cada vez.

Consulta [operación en línea](FUNCIONAMIENTO_ONLINE.md).
