const USERS = [
    { username: 'admin', password: 'admin123', name: 'Administrador', role: 'Administrador' },
    { username: 'mesero', password: 'mesero123', name: 'Mesero Sala', role: 'Mesero' }
]

const KEY = 'foodorder_user'

export function login(username, password) {
    const found = USERS.find((u) => u.username === username && u.password === password)
    if (!found) throw new Error('Credenciales inválidas')

    const { password: _omit, ...user } = found // no guardamos la clave
    localStorage.setItem(KEY, JSON.stringify(user))
    return user
}

export function logout() {
    localStorage.removeItem(KEY)
}

export function getUser() {
    try {
        return JSON.parse(localStorage.getItem(KEY))
    } catch {
        return null
    }
}

export function isAuthenticated() {
    return Boolean(getUser())
}