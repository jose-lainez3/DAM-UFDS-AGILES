# FoodOrder — cliente Ionic Angular y APK Android

Aplicación cliente para consultar el menú, iniciar sesión/registrarse, gestionar el carrito, realizar pedidos y revisar su estado.

**Stack:** Angular 22, Ionic 9 y Capacitor 8. **Identificador Android:** `com.joselainez3.foodorder`.

## Descargas de la aplicación

- **[Descargar APK Android firmado (última versión)](https://github.com/jose-lainez3/DAM-UFDS-AGILES/releases/latest/download/FoodOrder-release-firmado.apk)** — archivo `.apk` para instalar en el teléfono.
- [Ver todas las versiones Android](https://github.com/jose-lainez3/DAM-UFDS-AGILES/releases).
- [FoodOrder para iPhone/iPad (PWA)](https://jose-lainez3.github.io/DAM-UFDS-AGILES/) — abrir desde Safari y usar **Agregar a pantalla de inicio**.
- [FoodOrder Admin para PC (PWA)](https://jose-lainez3.github.io/DAM-UFDS-AGILES/admin/) — instalar desde Chrome o Edge sin `.exe`.

El APK firmado se publica automáticamente en GitHub Releases cuando el workflow de Android en `main` termina correctamente y están configurados los secretos de firma. Las compilaciones de Actions también conservan un ZIP temporal para pruebas.

## Ejecutar en navegador (desarrollo)

Con MySQL y Laravel local previamente iniciados:

```powershell
cd .\Ionic\FoodOrder
npm ci
npx ionic serve
```

Normalmente abre `http://localhost:8100`. La URL de la API en desarrollo está en:

```typescript
// src/environments/environment.ts
apiUrl: 'http://localhost:8000/api'
```

Para un teléfono físico conectado a tu API **local** sustituye `localhost` por la IP de tu PC, conecta ambos equipos a la misma Wi-Fi y permite conexiones de Laravel desde la red. En emulador Android suele funcionar `10.0.2.2`. **Android puede bloquear HTTP**, por lo que una prueba nativa local podría requerir configuraciones de red específicas y reconstrucción. Consulta [instalación local](../../docs/INSTALACION_LOCAL.md).

## Qué backend utiliza el APK release

El build de producción reemplaza `environment.ts` por `src/environments/environment.prod.ts`:

```typescript
apiUrl: 'https://foodorderapi.alwaysdata.net/api'
```

**La app firmada generada por GitHub usa la API de producción, no tu XAMPP.** No es necesario instalar Node, Laravel o XAMPP en el teléfono; se conecta a la API externa mediante HTTPS.

## Generar Android localmente

```powershell
npm ci
npm run build -- --configuration production
npx cap add android
npx cap sync android
npx cap open android
```

Ejecuta `npx cap add android` **solo si no existe** el proyecto Android. El build de desarrollo requiere `--configuration development` y la configuración apropiada de la API de prueba.

## APK firmado con GitHub Actions

- Workflow: `.github/workflows/android-apk.yml`.
- Artefacto cuando están configurados los secretos: **`FoodOrder-APK-Firmado`**.
- Secrets necesarios: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` y `ANDROID_KEY_PASSWORD`.
- La misma clave privada se utiliza para firmar futuras versiones; **no guardes archivos `.jks` ni contraseñas en GitHub**.

Para usuarios finales, descarga directamente el APK desde **GitHub Releases** usando el enlace de arriba. En **Actions** también permanece un artefacto ZIP temporal para pruebas. Para actualizar una instalación firmada, conserva el identificador de paquete y la misma clave; la versión Android debe aumentar.

## Actualizaciones OTA

La app comprueba el manifiesto `latest.json` de la rama pública `foodorder-ota` al arrancar; si existe una versión compatible, descarga el paquete web y actualiza la interfaz sin reinstalar el APK. No sustituye un APK en cambios de permisos, plugins ni lógica nativa.

**Dónde está el código:**

- `src/app/core/foodorder-update.service.ts`: consulta y aplica OTA.
- `src/app/core/ota-build.ts`: identifica la compilación; Actions lo sustituye durante el build.
- `src/app/pages/perfil`: muestra versión APK o OTA.
- `src/app/pages/login`: diseño del login con estilos nativos exclusivos, sin alterar el navegador.
- `src/app/tabs` y `src/global.scss`: navegación y área segura para botones del sistema.

## Guías adicionales

- [Instalación completa local](../../docs/INSTALACION_LOCAL.md)
- [Funcionamiento en línea](../../docs/FUNCIONAMIENTO_ONLINE.md)
- [Arquitectura y cambios](../../docs/ARQUITECTURA_Y_CAMBIOS.md)
- [Firma y actualizaciones OTA en detalle](ANDROID_FIRMA_OTA.md)

## Instalación en iPhone sin App Store

FoodOrder puede publicarse como PWA instalable desde Safari. La compilación web se automatiza con GitHub Actions y requiere activar GitHub Pages una sola vez. Consulta la [guía de iPhone y PWA](PWA_IOS.md).
