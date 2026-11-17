# FoodOrder: APK firmado y actualizaciones OTA

## Qué quedó configurado

- `.github/workflows/android-apk.yml`: crea un APK **release firmado** cuando existen los cuatro secretos Android; mientras tanto crea solo un APK debug de prueba.
- `.github/workflows/foodorder-ota.yml`: en cada push a `main` que afecte a Ionic compila Angular, comprueba que exista `www/index.html`, genera un ZIP y un manifiesto SHA-256 en la rama `foodorder-ota`.
- La app nativa consulta `latest.json` y descarga los cambios web; los aplica al abrir la app. Necesita conexión para obtener las nuevas versiones, pero conserva el último bundle cuando falla internet.
- Las actualizaciones OTA sirven para **HTML, SCSS, TypeScript/Angular**. Para cambiar código nativo o permisos se necesita un APK nuevo firmado.
- Corrección de la barra inferior: `SystemBars.insetsHandling='css'` y respeto de `--ion-safe-area-bottom` con Capacitor 8.
- Identificador nativo permanente: `com.joselainez3.foodorder`.

## El ÚNICO paso privado obligatorio

La API conectada a GitHub no puede escribir en Secrets. El propietario del repositorio debe configurarlos manualmente en:

**GitHub > DAM-UFDS-AGILES > Settings > Secrets and variables > Actions > New repository secret**

Agrega los siguientes secretos con los valores del documento privado `secrets-github.txt` entregado por separado:
1. `ANDROID_KEYSTORE_BASE64`
2. `ANDROID_KEYSTORE_PASSWORD`
3. `ANDROID_KEY_ALIAS`
4. `ANDROID_KEY_PASSWORD`

No subas el archivo .jks ni el .txt al repositorio, ni publiques su contenido. Guarda una copia de respaldo fuera de GitHub; perder la firma imposibilita actualizar una aplicación firmada con esa clave.

Después ejecuta **Actions > FoodOrder Android - APK firmado > Run workflow**. El artefacto correcto será `FoodOrder-APK-Firmado`. Si aparece `Debug-Sin-Firma-Estable`, faltan uno o más secretos.

## Comportamiento de las actualizaciones

- GitHub Actions actualiza `foodorder-ota/latest.json` con una versión nueva y un ZIP con SHA-256.
- La aplicación inicia, confirma al actualizador que arrancó correctamente, consulta el manifiesto y, cuando detecta una versión diferente, descarga y activa el nuevo bundle web.
- Puedes consultar el estado en **Actions > FoodOrder - publicar actualizaciones OTA** y en el archivo `foodorder-ota/latest.json` tras el primer workflow exitoso.
- El repositorio es público: los paquetes OTA son públicos; nunca incluyas secretos en `src/` o `www/`.
- No se actualizan funciones nativas mediante OTA. Mantén `OTA_NATIVE_CHANNEL` si solamente cambias UI. Si añades o actualizas plugins nativos, configura un canal nuevo para no distribuir código incompatible a instalaciones antiguas.
- Para recuperar un cambio defectuoso, vuelve a hacer un commit con la versión web anterior y despliega de nuevo. El plugin también revierte bundles que no notifican arranque correcto.

## Primer cambio de aplicación

El APK antiguo tenía id `io.ionic.starter` y una firma debug distinta. El APK firmado nuevo usa id `com.joselainez3.foodorder`, por lo que Android lo tratará como una aplicación diferente. Una vez instales la versión firmada nueva, las siguientes versiones firmadas con **la misma clave** podrán actualizarse encima (si el código de versión aumenta).

## No es una publicación en Google Play

Es un APK para instalación directa. Para Play Store también se necesita preparar un AAB firmado, la ficha y la política de privacidad. Android puede advertir que procede de una fuente externa cuando se instala fuera de Google Play.
