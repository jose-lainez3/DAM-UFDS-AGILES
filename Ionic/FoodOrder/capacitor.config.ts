import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.joselainez3.foodorder',
  appName: 'FoodOrder',
  webDir: 'www',
  plugins: {
    SystemBars: {
      // Capacitor 8: respeta los botones de Android incluso con WebView antiguas.
      insetsHandling: 'css',
      style: 'LIGHT',
    },
    CapacitorUpdater: {
      // Actualizaciones autohospedadas desde GitHub; sin cuenta Capgo.
      autoUpdate: 'off',
      appReadyTimeout: 10000,
    },
  },
};

export default config;
