# FoodOrder Admin — Aplicación de escritorio instalable (PWA)

El panel Vue 3 de FoodOrder ahora puede **instalarse como aplicación de escritorio** en Windows, macOS o Linux desde un navegador compatible, sin archivos .exe, instaladores ni publicación en una tienda.

## Enlace de instalación

**https://jose-lainez3.github.io/DAM-UFDS-AGILES/admin/**

Esta es la ruta **prevista** en GitHub Pages. Solo úsala cuando el workflow [FoodOrder PWA - iPhone y escritorio](../../.github/workflows/foodorder-pwa.yml) haya finalizado exitosamente.

El cliente móvil Ionic sigue disponible en la raíz: https://jose-lainez3.github.io/DAM-UFDS-AGILES/

## Instalar en Windows (Chrome o Microsoft Edge)

1. Abre la dirección del panel administrativo en **Chrome** o **Microsoft Edge**.
2. En la barra de direcciones busca el icono **Instalar** (puede estar dentro de los tres puntos: **Aplicaciones → Instalar este sitio como aplicación** en Edge, o **Transmitir, guardar y compartir → Instalar página como aplicación** en Chrome; el nombre depende de la versión).
3. Confirma la instalación con el nombre **FoodOrder Admin**.
4. El panel se abrirá en una ventana separada, podrá anclarse a la barra de tareas y aparecerá entre las aplicaciones instaladas del sistema.

El navegador necesita HTTPS y soporte para PWA. **No se genera un .exe** ni se obtiene acceso nativo irrestricto al sistema operativo; sigue siendo una aplicación web instalada.

## Funciones y conexión

- Usa las vistas Vue existentes: pedidos, cocina, nuevo pedido, productos, inventario, personal, reportes y configuración.
- La compilación de GitHub Pages usa la API Laravel de producción: `https://foodorderapi.alwaysdata.net/api`.
- Debes iniciar sesión con una cuenta **real y autorizada de personal**. Las cuentas del seeder (`admin/admin123`, etc.) son únicamente para una base de datos de desarrollo, nunca para producción.
- Al instalar no se copia la base de datos al equipo; para pedidos, login y consultas es necesaria conexión con la API.
- El service worker utiliza **red primero** y guarda recursos estáticos como respaldo. No almacena respuestas de la API, pedidos ni tokens.

Si la API devuelve errores CORS, el backend de producción debe permitir el origen `https://jose-lainez3.github.io`; se configura en el servidor de Laravel, no en el navegador.

## Publicación automática y versiones

El workflow `.github/workflows/foodorder-pwa.yml` compila **dos proyectos** y los publica juntos en un único sitio Pages:

- **Ionic cliente iPhone:** `/DAM-UFDS-AGILES/`
- **Vue panel escritorio:** `/DAM-UFDS-AGILES/admin/`

Cuando cambie `Ionic/FoodOrder/**` o `vue/foodorder/**` en `main`, el workflow vuelve a compilar ambos. Los cambios llegan a la PWA al abrirla o recargarla con conexión, sin reinstalar.

Para Pages, `vue.config.js` ajusta el prefijo público `/DAM-UFDS-AGILES/admin/` y Vue Router usa **hash** (`#/pedidos`, `#/cocina`) para evitar errores 404. La versión Vue que se ejecuta en el dominio original conserva `createWebHistory` y su misma interfaz.

## Desarrollo y producción en otra plataforma

Desarrollo local normal:

```powershell
cd vue\foodorder
npm ci
npm run serve
```

API local en `.env.development`: `VUE_APP_API_URL=http://127.0.0.1:8000/api`.

Build para hosting diferente de GitHub Pages:

```powershell
npm run build
```

Define la API de producción en `VUE_APP_API_URL`. Las variables `VUE_APP_DESKTOP_PWA=true` y `VUE_APP_PUBLIC_PATH=/DAM-UFDS-AGILES/admin/` son específicas del workflow Pages, no deben colocarse en `.env.development`.

**Las actualizaciones de Vue en GitHub Pages no despliegan automáticamente tu instalación original en Vercel u otros servidores.**

## Diagnóstico

- **Página 404:** revisa el workflow Pages y abre exactamente `/DAM-UFDS-AGILES/admin/`, con la barra final.
- **No aparece instalar:** confirma HTTPS, manifest e iconos; revisa el menú del navegador; puede que la app ya esté instalada.
- **Login funciona pero las vistas no cargan:** revisa permisos de cuenta, API y CORS; las rutas están bajo `#/...`.
- **La aplicación muestra contenido antiguo:** cierra y vuelve a abrir o recarga con conexión; borra los datos del sitio únicamente si es necesario (puede cerrar la sesión).
- **No tienes internet:** puede verse una pantalla previamente guardada, pero no podrás registrar pedidos ni consultar datos del servidor.

Guías: [README Vue](README.md), [instalación local](../../docs/INSTALACION_LOCAL.md) y [despliegue online](../../docs/FUNCIONAMIENTO_ONLINE.md).
