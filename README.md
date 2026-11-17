# Documentación del sistema FoodOrder

**FoodOrder** integra una API Laravel, un panel Vue para el personal y una aplicación cliente Ionic Angular para navegador/Android.

### Empieza por la guía adecuada

| Guía | Para qué sirve |
| --- | --- |
| **[Instalación local paso a paso](docs/INSTALACION_LOCAL.md)** | Configurar Windows/XAMPP, base de datos, Laravel, Vue, Ionic y pruebas |
| **[Funcionamiento y despliegue en línea](docs/FUNCIONAMIENTO_ONLINE.md)** | Diferencias entre local y servidor, despliegue, API de producción, APK y OTA |
| **[Arquitectura y cambios realizados](docs/ARQUITECTURA_Y_CAMBIOS.md)** | Explicación del sistema, flujo de pedidos, roles, tecnologías y mejoras |
| [README Laravel](laravel/foodorder/README.md) | Configuración del backend y endpoints |
| [README Vue](vue/foodorder/README.md) | Instalación y publicación del panel administrativo |
| [README Ionic/Android](Ionic/FoodOrder/README.md) | Cliente móvil, API, APK y actualizaciones |
| [PWA para iPhone](Ionic/FoodOrder/PWA_IOS.md) | Instalación desde Safari sin App Store y publicación automática |
| [Firma Android y OTA](Ionic/FoodOrder/ANDROID_FIRMA_OTA.md) | Firma release, secretos y distribución OTA |

**API de producción configurada en Ionic:** `https://foodorderapi.alwaysdata.net/api`. La publicación de Laravel y Vue se gestiona por separado; solo el APK y la OTA tienen workflows de GitHub Actions en este repositorio.

**Aviso de seguridad:** los datos del seeder son solo para pruebas locales. No publiques `.env`, contraseñas ni claves de firma.

---

## Guía rápida original

Guía para instalar y usar el sistema.

El proyecto tiene tres partes: el servidor en Laravel, el panel web en Vue y la aplicación para clientes en Ionic. Las tres se encuentran en el mismo ZIP, pero se ejecutan por separado.

## 1. Programas que se necesitan

Antes de empezar hay que tener instalados:

- XAMPP (para MySQL/MariaDB).
- PHP 8.2 o superior.
- Composer.
- Node.js 24.15 o superior (también funciona una versión compatible de la rama 22, desde 22.22.3).
- Visual Studio Code o cualquier editor de código.
- Android Studio, solo si se quiere instalar la aplicación en un celular Android.

Para revisar que PHP, Composer y Node estén instalados, abrir una terminal y ejecutar:

```powershell
php -v
composer -V
node -v
npm -v
```

## 2. Preparar el proyecto

1. Descomprimir el archivo ZIP.
2. Abrir la carpeta del proyecto en Visual Studio Code.
3. Dentro se encuentran estas carpetas:
   - `laravel/foodorder`: servidor y base de datos.
   - `vue/foodorder`: panel administrativo.
   - `Ionic/FoodOrder`: aplicación para clientes.
4. Abrir una terminal para cada parte del sistema. Es importante dejar las terminales abiertas mientras se usa FoodOrder.

No es obligatorio copiar el proyecto en `htdocs`: Laravel se puede iniciar desde su propia carpeta.

## 3. Crear la base de datos

1. Abrir el panel de XAMPP e iniciar **Apache** y **MySQL**.
2. Entrar a `http://localhost/phpmyadmin`.
3. Abrir la pestaña **SQL** y ejecutar:

```sql
CREATE DATABASE IF NOT EXISTS foodorder
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

No hace falta crear las tablas a mano. Se crearán desde Laravel.

## 4. Instalar y ejecutar Laravel

Desde la carpeta principal del proyecto, abrir una terminal de PowerShell y ejecutar:

```powershell
cd .\laravel\foodorder
composer install
```

Si todavía no existe el archivo `.env`, crearlo así:

```powershell
Copy-Item .env.example .env
```

Abrir `laravel/foodorder/.env` y dejar configurada la conexión a la base de datos:

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

Estos datos son para XAMPP en una computadora local. Si MySQL tiene contraseña, colocarla en `DB_PASSWORD`.

Después, ejecutar los siguientes comandos en la misma terminal:

```powershell
php artisan key:generate
php artisan optimize:clear
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

`migrate --seed` crea las tablas y agrega datos de prueba. Si ya hay información guardada, hacer un respaldo antes de cambiar la base de datos. No usar `migrate:fresh` si se quieren conservar los datos.

Para comprobar que Laravel está funcionando, abrir:

`http://127.0.0.1:8000/api/productos`

Si aparece información en formato JSON, la API está respondiendo. Dejar abierta la terminal de Laravel.

## 5. Iniciar el panel administrativo (Vue)

Abrir otra terminal desde la carpeta principal y ejecutar:

```powershell
cd .\vue\foodorder
npm install
npm run serve
```

Abrir en el navegador:

`http://localhost:8080`

El panel ya tiene configurada la dirección de la API en `vue/foodorder/.env.development`:

```dotenv
VUE_APP_API_URL=http://127.0.0.1:8000/api
```

Si Laravel se está ejecutando en otro puerto, cambiar esa dirección y volver a iniciar Vue.

## 6. Iniciar la aplicación de clientes (Ionic)

Abrir una tercera terminal desde la carpeta principal y ejecutar:

```powershell
cd .\Ionic\FoodOrder
npm install
npm install -g @ionic/cli
ionic serve
```

También se puede usar `npx ionic serve` si no se desea instalar Ionic CLI globalmente.

Abrir:

`http://localhost:8100`

Comprobar que en `Ionic/FoodOrder/src/environments/environment.ts` esté esta dirección:

```ts
apiUrl: 'http://localhost:8000/api'
```

Para que aparezcan los productos y funcionen los pedidos, MySQL y Laravel deben seguir encendidos.

## 7. Usuarios para entrar al panel

Al ejecutar `php artisan migrate --seed` se crean estas cuentas de prueba:

| Usuario | Contraseña | Rol |
| --- | --- | --- |
| `admin` | `admin123` | Administrador |
| `mesero` | `mesero123` | Mesero |
| `cocinero` | `cocina123` | Cocinero |
| `cajero` | `cajero123` | Cajero |

Son únicamente para probar el sistema en una instalación local. Para entrar a la aplicación Ionic como cliente hay que crear una cuenta desde **Registrarse**.

## 8. Cómo usar FoodOrder

### Desde el panel de Vue

1. Entrar a `http://localhost:8080` e iniciar sesión.
2. En **Pedidos**, revisar los pedidos que se han realizado.
3. En **Nuevo pedido**, seleccionar cliente, mesa y productos para registrar una orden.
4. En **Cocina**, consultar los pedidos pendientes y cambiar el estado cuando corresponda.
5. En **Productos**, consultar y administrar el menú.
6. En **Inventario**, revisar y actualizar existencias.
7. Con el usuario administrador también se pueden gestionar las cuentas de personal, revisar reportes y configurar las mesas.

Los estados de un pedido siguen normalmente este orden:

`pendiente → preparación → entregado → pagado`

También se puede cancelar un pedido cuando la operación lo permita.

### Desde Ionic

1. Abrir `http://localhost:8100`.
2. Revisar los productos en **Menú**.
3. Registrarse o iniciar sesión para poder realizar pedidos.
4. Agregar productos al **Carrito**.
5. Seleccionar una mesa disponible o la opción para llevar y confirmar.
6. Entrar a **Pedidos** para revisar el estado de la orden.
7. En **Perfil** se puede consultar la cuenta o cerrar sesión.

## 9. Instalar Ionic en un celular Android (opcional)

Para usar la aplicación en un teléfono, la computadora que ejecuta Laravel y el celular deben estar conectados a la misma red durante las pruebas.

1. En la computadora abrir CMD y ejecutar `ipconfig`.
2. Buscar la dirección **IPv4** de la computadora. Por ejemplo, `192.168.1.50` (cada equipo tendrá una diferente).
3. Detener Laravel y volver a ejecutarlo desde `laravel/foodorder`:

```powershell
php artisan serve --host=0.0.0.0 --port=8000
```

4. En `Ionic/FoodOrder/src/environments/environment.ts` cambiar la API por la IP real de la computadora:

```ts
apiUrl: 'http://192.168.1.50:8000/api'
```

5. Desde la carpeta `Ionic/FoodOrder`, ejecutar:

```powershell
npm install
npm install @capacitor/android@^8
npm run build -- --configuration development
npx cap add android
npx cap sync android
npx cap open android
```

6. Cuando se abra Android Studio, elegir el dispositivo y ejecutar la aplicación. También se puede generar un APK de prueba desde las opciones de compilación de Android Studio.

Si ya existe la carpeta `android`, no volver a ejecutar `npx cap add android`; basta con compilar y sincronizar. Si se cambia la dirección de la API, hay que volver a ejecutar el build y `npx cap sync android`.

**Importante:** en un celular físico no se debe usar `localhost` para conectarse con Laravel. En un emulador Android se suele usar `http://10.0.2.2:8000/api`. Verificar el firewall de Windows si el teléfono no consigue conectarse. La conexión HTTP de esta guía es solo para pruebas en una red privada.

## 10. Si algo no funciona

- **No conecta con la base de datos:** comprobar que MySQL esté iniciado y que los datos de `.env` sean correctos.
- **Error de migración:** ejecutar `php artisan migrate:status` y revisar que se esté usando la base de datos `foodorder`.
- **El panel o Ionic no cargan productos:** abrir `http://127.0.0.1:8000/api/productos` y revisar la URL de la API.
- **El puerto 8000 está ocupado:** iniciar Laravel con otro puerto y cambiar las direcciones de Vue e Ionic.
- **Aparece un error de CORS:** revisar `CORS_ALLOWED_ORIGINS` y ejecutar `php artisan optimize:clear`.
- **Ionic falla al instalar dependencias:** comprobar la versión de Node.js y volver a ejecutar `npm install`.
- **No inicia sesión:** revisar las credenciales y confirmar que se ejecutó `php artisan migrate --seed`.

Para revisar errores del servidor, abrir `laravel/foodorder/storage/logs/laravel.log`.

## 11. Orden para iniciar el sistema cada vez que se use

1. Iniciar **MySQL** en XAMPP.
2. Entrar a `laravel/foodorder` y ejecutar `php artisan serve --host=127.0.0.1 --port=8000`.
3. Entrar a `vue/foodorder` y ejecutar `npm run serve`.
4. Entrar a `Ionic/FoodOrder` y ejecutar `ionic serve`.
5. Abrir Vue en `http://localhost:8080` e Ionic en `http://localhost:8100`.

La primera instalación requiere `composer install`, `npm install` y `php artisan migrate --seed`. Para los siguientes usos normalmente solo hay que iniciar los servicios.
