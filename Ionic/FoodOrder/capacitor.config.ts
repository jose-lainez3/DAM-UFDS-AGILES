import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'FoodOrder',
  webDir: 'www',
  server: {
    // Solo desarrollo: permite que la app Android hable con la API Laravel por HTTP.
    // En producción usa HTTPS y elimina estas dos líneas.
    androidScheme: 'http',
    cleartext: true,
  },
};

export default config;
