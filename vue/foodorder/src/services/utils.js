import { API_URL } from './api'

export function formatMoney(value) {
    return `$${Number(value || 0).toFixed(2)}`
}

export function fullName(cliente) {
    if (!cliente) return 'Sin cliente'
    return [cliente.nombre, cliente.apellido].filter(Boolean).join(' ')
}

export function formatDateTime(value) {
    if (!value) return '—'
    const d = new Date(value)
    if (isNaN(d)) return '—'
    return d.toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function isSameDay(value, ref = new Date()) {
    const d = new Date(value)
    return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate()
}

/**
 * Convierte un error de axios en un mensaje legible para el usuario.
 */
export function errorMessage(error, fallback = 'Ocurrió un error inesperado.') {
    if (!error) return fallback

    if (!error.response) {
        return `No se pudo conectar con el servidor (${API_URL}). Comprueba que Laravel esté en marcha.`
    }

    const data = error.response.data || {}

    if (data.errors) {
        return Object.values(data.errors).flat().join(' ')
    }

    return data.message || fallback
}

// Estados del pedido (deben coincidir con Pedido::ESTADOS en Laravel)
export const ESTADOS_PEDIDO = {
    pendiente: 'Pendiente',
    preparacion: 'En preparación',
    entregado: 'Entregado',
    pagado: 'Pagado',
    cancelado: 'Cancelado'
}
