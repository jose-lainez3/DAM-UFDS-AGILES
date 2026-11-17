import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

createApp(App).use(store).use(router).mount('#app')

// Registro exclusivamente para la compilación PWA de escritorio.
// La web Vue normal no cambia su comportamiento y no registra un SW nuevo.
if (process.env.NODE_ENV === 'production' &&
    process.env.VUE_APP_DESKTOP_PWA === 'true' &&
    'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const base = new URL(process.env.BASE_URL || '/', window.location.origin)
    navigator.serviceWorker
      .register(new URL('sw.js', base).toString(), { scope: base.pathname })
      .catch((error) => console.warn('[FoodOrder Desktop PWA] Servicio no disponible:', error))
  })
}
