# FoodOrder — API Laravel

Este módulo es el **backend central** del sistema FoodOrder. Expone una API REST que consumen el panel Vue y la app Ionic; es quien consulta y modifica la base MySQL/MariaDB.

**Tecnologías:** PHP 8.2 o posterior, Laravel 12, Sanctum 4, Eloquent, migraciones y seeders.

## Instalación local

Para Windows y XAMPP, desde la **raíz del repositorio**:

```powershell
cd .\laravel\foodorder
composer install
Copy-Item .env.example .env
```

Crea la base:

```sql
CREATE DATABASE IF NOT EXISTS foodorder
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

En `.env` configura las credenciales que correspondan:

```dotenv
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

`CORS_ALLOWED_ORIGINS=*` es solo para pruebas locales.

```powershell
php artisan key:generate
php artisan optimize:clear
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

Probar: `http://127.0.0.1:8000/api/productos` o `http://127.0.0.1:8000/api/categorias`. Deben devolver JSON. Estas dos consultas son públicas; pedidos, mesas, personal e inventario requieren token Sanctum.

Si se utiliza una base existente, respáldala y ejecuta `php artisan migrate` en lugar de reiniciar tablas. **Nunca** ejecutes `migrate:fresh` sobre datos que se quieran conservar.

## Estructura y endpoints

| Ubicación | Función |
|---|---|
| `routes/api.php` | Define endpoints y permisos |
| `app/Http/Controllers/Api` | Lógica de autenticación, pedidos, productos, usuarios, mesas e inventarios |
| `app/Models` | Entidades Eloquent y sus relaciones |
| `database/migrations` | Esquema de base de datos |
| `database/seeders/DatabaseSeeder.php` | Datos y usuarios para demostración |
| `config/cors.php` | Orígenes permitidos para frontend |
| `config/foodorder.php` | Impuesto configurable (`TASA_IMPUESTO`) |

Rutas principales:

- `POST /api/auth/login`, `POST /api/auth/register` (públicas).
- `GET /api/productos`, `GET /api/categorias` (públicas).
- `GET /api/auth/me` y `POST /api/auth/logout` (requieren token).
- `/api/pedidos`, `/api/mesas`, `/api/clientes`, `/api/inventarios` (con autenticación).
- `/api/usuarios` y gestión de roles (con protección de administrador).

La app cliente identifica al usuario desde el token y Laravel limita el acceso a sus propios pedidos. Al crear una orden, el backend valida mesa/productos, registra detalles y calcula el precio, con operaciones de BD en transacción.

## Usuarios de prueba y seguridad

`php artisan migrate --seed` inserta `admin/admin123`, `mesero/mesero123`, `cocinero/cocina123` y `cajero/cajero123` para pruebas **locales**. Estas cuentas y contraseñas **no son seguras para producción**. El registro público genera cuentas de rol Cliente vinculadas con su ficha de cliente.

Para un hosting en línea se requieren `APP_DEBUG=false`, HTTPS, origen CORS limitado, credenciales de BD privadas, copias de seguridad y migraciones planificadas. `APP_KEY` debe conservarse si ya existe una instalación con datos. **No publiques `.env`.**

## Más documentación

- [Instalación local](../../docs/INSTALACION_LOCAL.md)
- [Funcionamiento y publicación online](../../docs/FUNCIONAMIENTO_ONLINE.md)
- [Arquitectura y cambios](../../docs/ARQUITECTURA_Y_CAMBIOS.md)
