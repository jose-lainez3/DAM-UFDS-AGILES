<template>
    <div class="login-layout">
        <!-- Panel Izquierdo: Branding -->
        <div class="login-left">
            <div class="brand-container">
                <!-- Asegúrate de poner la ruta correcta de tu imagen aquí -->
                <img src="@/assets/logo.png" alt="Food Order Logo" class="brand-logo" />
            </div>
        </div>

        <!-- Panel Derecho: Formulario -->
        <div class="login-right">
            <div class="form-container">
                <div class="form-header">
                    <h1 class="title">FoodOrder</h1>
                    <p class="subtitle">Sistema de gestión de pedidos</p>
                </div>

                <form @submit.prevent="realizarLogin" class="login-form">
                    <!-- Campo Usuario -->
                    <div class="input-group">
                        <label for="username">Usuario o Correo</label>
                        <input id="username" v-model="usuario" type="text" placeholder="Ingresa tu usuario" required />
                    </div>

                    <!-- Campo Contraseña -->
                    <div class="input-group">
                        <label for="password">Contraseña</label>
                        <div class="password-wrapper">
                            <input id="password" v-model="clave" :type="mostrarClave ? 'text' : 'password'"
                                placeholder="••••••••" required />
                            <button type="button" class="btn-toggle-pass" @click="mostrarClave = !mostrarClave">
                                {{ mostrarClave ? 'Ocultar' : 'Mostrar' }}
                            </button>
                        </div>
                    </div>

                    <!-- Botón Iniciar Sesión -->
                    <button type="submit" class="btn-submit">
                        Iniciar sesión
                    </button>
                </form>

                <p class="register-link">
                    Si necesitas acceso de personal, solicita tu usuario al administrador.
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/services/auth'
import { errorMessage } from '@/services/utils'

const router = useRouter()

const usuario = ref('')
const clave = ref('')
const mostrarClave = ref(false)
const cargando = ref(false)
const errorLogin = ref('')

const puedeIngresar = computed(() =>
    usuario.value.trim() !== '' &&
    clave.value !== '' &&
    !cargando.value
)

const realizarLogin = async () => {
    if (!puedeIngresar.value) return

    cargando.value = true
    errorLogin.value = ''

    try {
        // Utiliza el servicio que ya manejaba
        // la autenticación y el token.
        const respuesta = await login(
            usuario.value.trim(),
            clave.value
        )

        // Si el servicio devuelve los datos del usuario,
        // comprobamos el rol sin provocar errores.
        const datos = respuesta?.data ?? respuesta
        const user = datos?.usuario ?? datos?.user

        const nombreRol =
            typeof user?.rol === 'string'
                ? user.rol
                : user?.rol?.nombre

        if (nombreRol?.toLowerCase() === 'cliente') {
            errorLogin.value =
                'Acceso exclusivo para personal administrativo.'
            return
        }

        await router.push('/pedidos')

    } catch (error) {
        console.error('Error de inicio de sesión:', error)

        errorLogin.value = errorMessage(
            error,
            'No se pudo iniciar sesión. Verifica tus credenciales.'
        )
    } finally {
        cargando.value = false
    }
}
</script>


<style scoped>
/* Contenedor principal a pantalla completa */
.login-layout {
    display: flex;
    min-height: 100vh;
    width: 100vw;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f8fafc;
}

/* --- Panel Izquierdo --- */
.login-left {
    flex: 1;
    background-color: #1a4031;
    /* El verde oscuro de tu marca */
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.brand-container {
    background: white;
    padding: 3rem;
    border-radius: 20px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    max-width: 450px;
    width: 100%;
    display: flex;
    justify-content: center;
}

.brand-logo {
    max-width: 100%;
    height: auto;
    display: block;
}

/* --- Panel Derecho --- */
.login-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ffffff;
    padding: 2rem;
}

.form-container {
    max-width: 400px;
    width: 100%;
}

.form-header {
    text-align: center;
    margin-bottom: 2.5rem;
}

.title {
    font-size: 2.5rem;
    font-weight: 800;
    color: #1a4031;
    margin: 0 0 0.5rem 0;
}

.subtitle {
    color: #64748b;
    font-size: 1rem;
    margin: 0;
}

/* --- Formulario --- */
.login-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #334155;
}

input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 1rem;
    color: #1e293b;
    transition: all 0.2s ease;
    box-sizing: border-box;
}

input:focus {
    outline: none;
    border-color: #1a4031;
    box-shadow: 0 0 0 3px rgba(26, 64, 49, 0.1);
}

/* --- Contraseña con botón mostrar --- */
.password-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.btn-toggle-pass {
    position: absolute;
    right: 10px;
    background: none;
    border: none;
    color: #1a4031;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    padding: 0.5rem;
}

.btn-toggle-pass:hover {
    text-decoration: underline;
}

/* --- Botón Submit --- */
.btn-submit {
    background-color: #f59e0b;
    /* Naranja/Dorado vibrante */
    color: white;
    font-weight: 700;
    font-size: 1.1rem;
    padding: 0.85rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
    margin-top: 1rem;
}

.btn-submit:hover {
    background-color: #d97706;
}

.btn-submit:active {
    transform: scale(0.98);
}

/* --- Link de registro --- */
.register-link {
    text-align: center;
    margin-top: 2rem;
    color: #64748b;
    font-size: 0.95rem;
}

.register-link a {
    color: #1a4031;
    font-weight: 600;
    text-decoration: none;
}

.register-link a:hover {
    text-decoration: underline;
}

/* --- Responsividad --- */
@media (max-width: 768px) {
    .login-layout {
        flex-direction: column;
    }

    .login-left {
        padding: 2rem 1rem;
        min-height: 30vh;
    }

    .brand-container {
        padding: 1.5rem;
    }

    .login-right {
        padding: 3rem 1.5rem;
    }
}
</style>