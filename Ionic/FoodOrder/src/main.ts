import { bootstrapApplication } from '@angular/platform-browser';
import { Capacitor } from '@capacitor/core';
import { environment } from './environments/environment';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/core/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
  ],
});

// El service worker es solo para la PWA publicada en HTTPS.
// No registrarlo en Capacitor: Android conserva su mecanismo OTA independiente.
if (environment.production && !Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const base = new URL('./', document.baseURI);
    navigator.serviceWorker
      .register(new URL('sw.js', base).toString(), { scope: base.pathname })
      .catch((error) => console.warn('[FoodOrder PWA] No se pudo registrar el servicio:', error));
  });
}
