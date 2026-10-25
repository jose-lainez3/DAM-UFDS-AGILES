<template>
    <main class="login">
        <!-- Panel izquierdo: imagen / logo del restaurante -->
        <section class="login__brand" aria-label="Restaurante">
            <!-- Reemplaza el div por <img src="/logo.png" alt="Logo del restaurante" /> -->
            <div class="login__placeholder">Imagen / logo del restaurante</div>
        </section>

        <!-- Panel derecho: formulario -->
        <section class="login__panel">
            <form class="form" novalidate @submit.prevent="onSubmit">
                <h1 class="form__title">FoodOrder</h1>
                <p class="form__subtitle">Sistema de gestión de pedidos</p>

                <div class="field">
                    <label for="username">Usuario</label>
                    <input id="username" v-model="username" type="text" placeholder="username" autocomplete="username"
                        autofocus />
                </div>

                <div class="field">
                    <label for="password">Contraseña</label>
                    <div class="field__password">
                        <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
                            placeholder="clave" autocomplete="current-password" />
                        <button type="button" class="field__toggle"
                            :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                            @click="showPassword = !showPassword">
                            {{ showPassword ? 'Ocultar' : 'Mostrar' }}
                        </button>
                    </div>
                </div>

                <p v-if="error" class="form__error" role="alert">{{ error }}</p>

                <button type="submit" class="form__submit" :disabled="!canSubmit">
                    {{ loading ? 'Ingresando…' : 'Iniciar sesión' }}
                </button>

                <p class="form__register">
                    ¿No tienes cuenta?
                    <!-- Con vue-router: <router-link to="/register">Regístrate</router-link> -->
                    <a href="/register">Regístrate</a>
                </p>
            </form>
        </section>
    </main>
</template>

<script>
// import api from '@/services/api'

export default {
    name: 'loginView',

    data() {
        return {
            username: '',
            password: '',
            showPassword: false,
            loading: false,
            error: ''
        }
    },

    computed: {
        canSubmit() {
            return Boolean(this.username.trim() && this.password && !this.loading)
        }
    },

    methods: {
        async onSubmit() {
            if (!this.canSubmit) return

            this.error = ''
            this.loading = true

            try {
                // TODO: reemplazar por tu llamada real a la API
                // const { data } = await api.post('/auth/login', {
                //     username: this.username,
                //     password: this.password
                // })
                // localStorage.setItem('token', data.token)
                // this.$router.push('/dashboard')
                await new Promise((resolve) => setTimeout(resolve, 800))
            } catch (e) {
                this.error = 'Usuario o contraseña incorrectos. Revisa tus datos e inténtalo de nuevo.'
            } finally {
                this.loading = false
            }
        }
    }
}
</script>

<style scoped>
/*
  Paleta para administración de restaurante
  Verde pino: base y títulos | Azafrán: acción principal | Rojo chile: errores
*/
.login {
    --pine-900: #10302b;
    --pine-700: #1b4a42;
    --ink: #1d2a28;
    --ink-soft: #5b6b68;
    --saffron: #f2b134;
    --saffron-dark: #d9981a;
    --chili: #c8402a;
    --surface: #f7f8f6;
    --line: #cfd8d5;

    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 100vh;
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
    color: var(--ink);
}

/* ---------- Panel izquierdo ---------- */
.login__brand {
    display: grid;
    place-items: center;
    padding: 2rem;
    background: linear-gradient(160deg, var(--pine-700), var(--pine-900));
    color: #e8f1ee;
}

.login__placeholder {
    padding: 2rem 2.5rem;
    border: 2px dashed rgba(232, 241, 238, 0.4);
    border-radius: 16px;
    font-size: 1.25rem;
    text-align: center;
}

/* ---------- Panel derecho ---------- */
.login__panel {
    display: grid;
    place-items: center;
    padding: 2rem;
    background: var(--surface);
}

/* ---------- Formulario ---------- */
.form {
    width: 100%;
    max-width: 400px;
}

.form__title {
    margin: 0;
    font-size: 2.25rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--pine-900);
}

.form__subtitle {
    margin: 0.25rem 0 1.75rem;
    color: var(--ink-soft);
}

.form__error {
    margin: 0 0 1rem;
    padding: 0.7rem 0.9rem;
    font-size: 0.9rem;
    color: var(--chili);
    background: #fbebe8;
    border-left: 3px solid var(--chili);
    border-radius: 6px;
}

.form__submit {
    width: 100%;
    padding: 0.85rem 1rem;
    font: inherit;
    font-weight: 700;
    color: var(--ink);
    background: var(--saffron);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.15s, transform 0.05s;
}

.form__submit:hover:not(:disabled) {
    background: var(--saffron-dark);
}

.form__submit:active:not(:disabled) {
    transform: translateY(1px);
}

.form__submit:focus-visible {
    outline: 3px solid var(--pine-700);
    outline-offset: 2px;
}

.form__submit:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.form__register {
    margin: 1.1rem 0 0;
    font-size: 0.95rem;
    color: var(--ink-soft);
}

.form__register a {
    font-weight: 600;
    color: var(--pine-700);
}

/* ---------- Campos ---------- */
.field {
    margin-bottom: 1.1rem;
}

.field label {
    display: block;
    margin-bottom: 0.4rem;
    font-size: 0.95rem;
    font-weight: 600;
}

.field input {
    width: 100%;
    box-sizing: border-box;
    padding: 0.8rem 1rem;
    font: inherit;
    color: var(--ink);
    background: #fff;
    border: 1.5px solid var(--line);
    border-radius: 10px;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.field input::placeholder {
    color: #93a09d;
}

.field input:focus {
    outline: none;
    border-color: var(--pine-700);
    box-shadow: 0 0 0 3px rgba(27, 74, 66, 0.2);
}

.field__password {
    position: relative;
}

.field__password input {
    padding-right: 5.5rem;
}

.field__toggle {
    position: absolute;
    top: 50%;
    right: 0.5rem;
    transform: translateY(-50%);
    padding: 0.35rem 0.6rem;
    font: inherit;
    font-size: 0.85rem;
    color: var(--pine-700);
    background: none;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.field__toggle:hover {
    background: rgba(27, 74, 66, 0.08);
}

.field__toggle:focus-visible {
    outline: 2px solid var(--pine-700);
}

/* ---------- Responsive ---------- */
@media (max-width: 800px) {
    .login {
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr;
    }

    .login__brand {
        min-height: 160px;
    }
}
</style>