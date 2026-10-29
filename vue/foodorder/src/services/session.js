// Almacenamiento de la sesión (token + datos básicos del usuario).
// Sin dependencias para poder importarlo desde api.js, auth.js y el router sin ciclos.

const TOKEN_KEY = 'token'
const USER_KEY = 'foodorder_user'

export function getToken() {
    return localStorage.getItem(TOKEN_KEY)
}

export function getUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY))
    } catch {
        return null
    }
}

export function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
}
