import api from './api'
import { getToken, getUser, setSession, clearSession } from './session'

export { getUser }

/**
 * Inicia sesión contra Laravel (POST /api/auth/login).
 * Guarda el token Sanctum y un resumen del usuario con la forma que usan las vistas:
 * { id, username, name, correo, rol_id, role }
 */
export async function login(username, clave) {
    const { data } = await api.post('/auth/login', { username, clave })

    const u = data.usuario
    const user = {
        id: u.id,
        username: u.username,
        name: u.username,
        correo: u.correo,
        rol_id: u.rol_id,
        role: u.rol ? u.rol.nombre : 'Sin rol'
    }

    setSession(data.token, user)
    return user
}

/**
 * Registro público (POST /api/auth/register). La cuenta queda inactiva hasta
 * que un administrador la active desde Gestión de Personal.
 */
export async function register({ username, correo, clave, clave_confirmation }) {
    const { data } = await api.post('/auth/register', { username, correo, clave, clave_confirmation })
    return data
}

/**
 * Cierra la sesión. Es síncrona a propósito (las vistas hacen logout() y luego router.push):
 * limpia el estado local al instante y revoca el token en el servidor en segundo plano.
 */
export function logout() {
    const token = getToken()
    clearSession()

    if (token) {
        api.post('/auth/logout', null, { headers: { Authorization: `Bearer ${token}` } }).catch(() => { })
    }
}

export function isAuthenticated() {
    return Boolean(getToken() && getUser())
}

export function hasRole(...roles) {
    const user = getUser()
    if (!user || !user.role) return false
    return roles.map((r) => r.toLowerCase()).includes(user.role.toLowerCase())
}

export function isAdmin() {
    return hasRole('Administrador')
}
