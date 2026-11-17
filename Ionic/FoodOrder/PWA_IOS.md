# FoodOrder para iPhone — PWA instalable sin App Store

La aplicación cliente de **Ionic Angular** también se publica como **Progressive Web App (PWA)**. La PWA se puede instalar desde Safari en iPhone sin Apple Developer Program, sin TestFlight y sin archivo IPA.

## 1. Qué quedó incluido

- `src/manifest.webmanifest`: nombre, descripción, colores, icono y modo de apertura independiente.
- `src/assets/foodorder-icon.svg`: icono web (el logo existente continúa en la app y se usa como icono táctil de Apple).
- `src/sw.js`: service worker que intenta la red primero y conserva recursos web ya descargados como respaldo. No guarda respuestas de la API.
- `src/main.ts`: registra ese service worker **solo en producción web**, nunca dentro del APK Android.
- `tabs.page.ts/html`: enlaces preparados para la subruta de GitHub Pages sin romper los enlaces de Android.
- `.github/workflows/foodorder-pwa.yml`: compila y publica la web por GitHub Actions cuando cambian archivos de Ionic.

## 2. Activar publicación en GitHub Pages (una única vez)

La conexión de GitHub usada para actualizar el código no permite cambiar por sí sola los ajustes administrativos de Pages. El propietario debe abrir:

**https://github.com/jose-lainez3/DAM-UFDS-AGILES/settings/pages**

En **Build and deployment → Source**, elegir **GitHub Actions**.

Después, desde **Actions → FoodOrder PWA - iPhone y web (GitHub Pages)**, usar **Run workflow** para volver a ejecutar la publicación si fue necesario. GitHub mostrará la dirección real en la ejecución exitosa y en **Settings → Pages**.

La dirección esperada para un sitio de proyecto, si no hay dominio personalizado, es:

**https://jose-lainez3.github.io/DAM-UFDS-AGILES/**

**No compartas el enlace como disponible hasta que Pages muestre una publicación exitosa.** Una compilación Angular exitosa no prueba que la web sea accesible públicamente.

## 3. Instalar en iPhone

1. Abrir la URL HTTPS de FoodOrder en **Safari** del iPhone.
2. Pulsar **Compartir → Agregar a pantalla de inicio**.
3. Activar **Abrir como app** cuando aparezca la opción.
4. Pulsar **Agregar**. El icono de FoodOrder quedará en la pantalla de inicio.

Esta versión es una **app web instalada**, no un IPA nativo. Puede tener limitaciones de API nativas, acceso a archivos y comportamiento offline respecto de un programa iOS firmado.

## 4. Funcionamiento de los pedidos

La compilación PWA usa `environment.prod.ts`: la API está configurada en **https://foodorderapi.alwaysdata.net/api**.

El menú, autenticación y pedidos requieren disponibilidad de la API cuando corresponda. El service worker guarda solo recursos **del mismo origen web**, no respuestas de Laravel; por tanto **no hay pedidos offline**.

Si Safari muestra errores de red o CORS, comprueba que el backend responda a `https://jose-lainez3.github.io` desde la configuración de `CORS_ALLOWED_ORIGINS` en producción. Cambiar CORS en la instalación local no corrige el servidor AlwaysData.

## 5. Actualizaciones

Cada cambio dentro de `Ionic/FoodOrder/**` publicado en `main` vuelve a compilar la PWA y la publica en GitHub Pages. El service worker usa **red primero** y mantiene un respaldo; las mejoras llegan en posteriores aperturas o recargas con conexión. No necesitas reenviar un enlace ni reinstalar el acceso directo.

El APK Android sigue teniendo su propia firma y su propio sistema **OTA**; estos flujos funcionan de manera independiente.

## 6. Verificación

- [ ] En **Actions**, el workflow de PWA finaliza en verde.
- [ ] En **Settings → Pages**, el sitio tiene una URL activa.
- [ ] Abre la URL en un navegador: Menú, Carrito, Pedidos y Perfil navegan correctamente.
- [ ] En Safari, la opción **Agregar a pantalla de inicio** permite instalar el icono.
- [ ] Desde un iPhone con internet, el menú carga productos reales de AlwaysData.
- [ ] El inicio de sesión, carrito y creación de pedido funcionan con usuario de pruebas.
- [ ] Actualiza el frontend en GitHub y comprueba que se vea en la PWA instalada.

[Volver al README de Ionic](README.md) · [Despliegue online](../../docs/FUNCIONAMIENTO_ONLINE.md)
