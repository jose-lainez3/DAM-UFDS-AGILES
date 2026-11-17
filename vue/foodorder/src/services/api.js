import axios from 'axios'
import { getToken, clearSession } from './session'

export const API_URL = process.env.VUE_APP_API_URL || 'https://foodorderapi.alwaysdata.net/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  timeout: 15000
})

// Adjunta el token Bearer de Sanctum a cada petición
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si el token caduca o es inválido, se limpia la sesión y se vuelve al login.
// El login en sí también responde 401 con credenciales incorrectas: ahí no se redirige.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = (error.config && error.config.url) || ''
    const esAuth = url.includes('/auth/login') || url.includes('/auth/register')

    if (error.response && error.response.status === 401 && !esAuth) {
      clearSession()
      const base = process.env.BASE_URL || '/'
      // En la PWA de escritorio las rutas usan hash (GitHub Pages).
      // Redirigir correctamente al login si el token expira.
      const destino = process.env.VUE_APP_DESKTOP_PWA === 'true' ? `${base}#/` : base
      if (`${window.location.pathname}${window.location.hash}` !== destino) {
        window.location.assign(destino)
      }
    }
    return Promise.reject(error)
  }
)

export default api
