<template>
    <div class="fo-app">
        <!-- ============ Sidebar ============ -->
        <aside class="fo-sidebar">
            <div class="fo-sidebar__brand">FoodOrder</div>

            <nav class="fo-sidebar__nav" aria-label="Navegación principal">
                <router-link v-for="item in menu" :key="item.to" :to="item.to" class="fo-sidebar__link"
                    active-class="fo-sidebar__link--active">
                    {{ item.label }}
                </router-link>
            </nav>

            <button type="button" class="fo-sidebar__logout" @click="logout">Cerrar sesión</button>
        </aside>

        <!-- ============ Contenido ============ -->
        <div class="fo-main">
            <header class="fo-topbar">
                <nav class="fo-topbar__crumbs" aria-label="Ruta">
                    <router-link to="/pedidos" class="fo-topbar__crumb-link">Inicio</router-link>
                    <template v-for="(crumb, i) in crumbs" :key="i">
                        <span>/</span>
                        <strong v-if="i === crumbs.length - 1" class="fo-topbar__crumb-current">{{ crumb }}</strong>
                        <span v-else>{{ crumb }}</span>
                    </template>
                </nav>

                <div class="fo-topbar__user" ref="userMenuRef">
                    <button type="button" class="fo-user-trigger" :class="{ 'fo-user-trigger--active': isMenuOpen }"
                        :aria-expanded="isMenuOpen" aria-haspopup="menu" @click="isMenuOpen = !isMenuOpen">
                        <span class="fo-topbar__avatar" aria-hidden="true">{{ initials }}</span>
                        <span class="fo-topbar__role">{{ user.role }}</span>
                        <span class="fo-topbar__arrow" :class="{ 'fo-topbar__arrow--up': isMenuOpen }">▾</span>
                    </button>

                    <transition name="fo-dropdown">
                        <div v-if="isMenuOpen" class="fo-user-menu" role="menu">
                            <div class="fo-user-menu__header">
                                <span class="fo-user-menu__name">{{ user.name }}</span>
                                <span class="fo-user-menu__badge">{{ user.role }}</span>
                            </div>

                            <template v-if="admin">
                                <div class="fo-user-menu__divider"></div>
                                <button v-for="item in adminMenu" :key="item.to" type="button"
                                    class="fo-user-menu__item" role="menuitem" @click="goTo(item.to)">
                                    {{ item.label }}
                                </button>
                            </template>

                            <div class="fo-user-menu__divider"></div>
                            <button type="button" class="fo-user-menu__item fo-user-menu__item--danger" role="menuitem"
                                @click="logout">
                                Cerrar sesión
                            </button>
                        </div>
                    </transition>
                </div>
            </header>

            <main class="fo-content">
                <slot />
            </main>
        </div>
    </div>
</template>

<script>
import { getUser, logout as endSession, isAdmin } from '@/services/auth'

export default {
    name: 'AppLayout',

    props: {
        // Migas de pan después de "Inicio", p. ej. ['Administración', 'Reportes']
        crumbs: { type: Array, default: () => [] }
    },

    data() {
        return {
            user: getUser() || { name: 'Usuario', role: '' },
            admin: isAdmin(),
            isMenuOpen: false,

            menu: [
                { label: 'Pedidos', to: '/pedidos' },
                { label: 'Nuevo pedido', to: '/nuevopedido' },
                { label: 'Cocina', to: '/cocina' },
                { label: 'Productos', to: '/productos' },
                { label: 'Inventario', to: '/inventario' }
            ],

            adminMenu: [
                { label: 'Gestión de Personal', to: '/admin/usuarios' },
                { label: 'Reportes y Métricas', to: '/admin/reportes' },
                { label: 'Configuración del Local', to: '/admin/configuracion' }
            ]
        }
    },

    computed: {
        initials() {
            return (this.user.name || 'US')
                .split(' ')
                .map((word) => word[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
        }
    },

    mounted() {
        document.addEventListener('click', this.handleClickOutside)
    },

    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside)
    },

    methods: {
        handleClickOutside(event) {
            if (this.$refs.userMenuRef && !this.$refs.userMenuRef.contains(event.target)) {
                this.isMenuOpen = false
            }
        },

        goTo(route) {
            this.isMenuOpen = false
            if (this.$route.path !== route) this.$router.push(route)
        },

        logout() {
            this.isMenuOpen = false
            endSession()
            this.$router.push('/')
        }
    }
}
</script>

<!--
  Estilos NO scoped a propósito: las vistas que usan <AppLayout> los comparten para
  tablas, botones, modales, etc. Todo va con prefijo "fo-" para no chocar con los
  estilos scoped de pedidosView / GestionPersonalView / nuevopedidoView.
-->
<style>
.fo-app {
    --pine-900: #10302b;
    --pine-800: #163d36;
    --pine-700: #1b4a42;
    --ink: #1d2a28;
    --ink-soft: #5b6b68;
    --saffron: #f2b134;
    --saffron-dark: #d9981a;
    --chili: #c8402a;
    --surface: #f7f8f6;
    --line: #dde4e1;

    --free-bg: #dff1e3;
    --free-fg: #1f6b3a;
    --busy-bg: #fbe0da;
    --busy-fg: #a6321f;
    --pending-bg: #fdf0cf;
    --pending-fg: #8a5a00;
    --prep-bg: #dcebf8;
    --prep-fg: #1c5a8c;
    --done-bg: #dff1e3;
    --done-fg: #1f6b3a;
    --grey-bg: #e9edeb;
    --grey-fg: #4a5855;

    display: grid;
    grid-template-columns: 240px 1fr;
    min-height: 100vh;
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
    color: var(--ink);
    background: var(--surface);
    text-align: left;
}

/* ---------- Sidebar ---------- */
.fo-sidebar {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem 1rem;
    background: var(--pine-900);
    color: #e8f1ee;
}

.fo-sidebar__brand {
    padding: 0 0.5rem;
    font-size: 1.6rem;
    font-weight: 800;
    letter-spacing: -0.02em;
}

.fo-sidebar__nav {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.fo-sidebar__link {
    padding: 0.7rem 0.9rem;
    color: #cfe0db;
    text-decoration: none;
    border-radius: 10px;
    transition: background 0.15s, color 0.15s;
}

.fo-sidebar__link:hover {
    background: var(--pine-700);
    color: #fff;
}

.fo-sidebar__link--active,
.fo-sidebar__link--active:hover {
    font-weight: 700;
    color: var(--ink);
    background: var(--saffron);
}

.fo-sidebar__logout {
    margin-top: auto;
    padding: 0.7rem 0.9rem;
    font: inherit;
    text-align: left;
    color: #e8f1ee;
    background: transparent;
    border: 1.5px solid rgba(232, 241, 238, 0.3);
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.15s;
}

.fo-sidebar__logout:hover {
    background: var(--pine-700);
}

.fo-sidebar__link:focus-visible,
.fo-sidebar__logout:focus-visible {
    outline: 2px solid var(--saffron);
    outline-offset: 2px;
}

/* ---------- Main + topbar ---------- */
.fo-main {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.fo-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid var(--line);
}

.fo-topbar__crumbs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--ink-soft);
}

.fo-topbar__crumb-link {
    color: var(--ink-soft);
    text-decoration: none;
}

.fo-topbar__crumb-link:hover {
    color: var(--pine-700);
    text-decoration: underline;
}

.fo-topbar__crumb-current {
    color: var(--pine-900);
}

.fo-topbar__user {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.fo-user-trigger {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.35rem 0.65rem;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 10px;
    font: inherit;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
}

.fo-user-trigger:hover,
.fo-user-trigger--active {
    background: var(--surface);
    border-color: var(--line);
}

.fo-topbar__avatar {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    font-size: 0.8rem;
    font-weight: 700;
    color: #fff;
    background: var(--pine-700);
    border-radius: 50%;
}

.fo-topbar__role {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--ink);
}

.fo-topbar__arrow {
    font-size: 0.8rem;
    color: var(--ink-soft);
    transition: transform 0.2s ease;
}

.fo-topbar__arrow--up {
    transform: rotate(180deg);
}

.fo-user-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 230px;
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(16, 48, 43, 0.1), 0 8px 10px -6px rgba(16, 48, 43, 0.05);
    z-index: 100;
}

.fo-user-menu__header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem 0.6rem;
}

.fo-user-menu__name {
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--pine-900);
}

.fo-user-menu__badge {
    align-self: flex-start;
    padding: 0.15rem 0.45rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--pending-fg);
    background: var(--pending-bg);
    border-radius: 4px;
}

.fo-user-menu__divider {
    height: 1px;
    margin: 0.35rem 0;
    background: var(--line);
}

.fo-user-menu__item {
    width: 100%;
    padding: 0.6rem 0.65rem;
    font: inherit;
    font-size: 0.88rem;
    text-align: left;
    color: var(--ink);
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
}

.fo-user-menu__item:hover {
    background: var(--surface);
    color: var(--pine-900);
}

.fo-user-menu__item--danger,
.fo-user-menu__item--danger:hover {
    color: var(--chili);
}

.fo-user-menu__item--danger:hover {
    background: #fdf2f0;
}

.fo-dropdown-enter-active,
.fo-dropdown-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.fo-dropdown-enter-from,
.fo-dropdown-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}

/* ---------- Contenido ---------- */
.fo-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
}

.fo-toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.fo-title {
    margin: 0 auto 0 0;
    font-size: 1.9rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--pine-900);
}

.fo-heading {
    margin-right: auto;
}

.fo-subtitle {
    margin: 0.2rem 0 0;
    font-size: 0.95rem;
    font-weight: 400;
    letter-spacing: 0;
    color: var(--ink-soft);
}

.fo-section-title {
    margin: 0 0 0.75rem;
    font-size: 1.1rem;
    font-weight: 700;
}

/* ---------- Inputs y botones ---------- */
.fo-input,
.fo-select {
    box-sizing: border-box;
    min-width: 180px;
    padding: 0.7rem 1rem;
    font: inherit;
    color: var(--ink);
    background: #fff;
    border: 1.5px solid var(--line);
    border-radius: 10px;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.fo-input:focus,
.fo-select:focus,
.fo-form-group input:focus,
.fo-form-group select:focus,
.fo-form-group textarea:focus {
    outline: none;
    border-color: var(--pine-700);
    box-shadow: 0 0 0 3px rgba(27, 74, 66, 0.2);
}

.fo-btn {
    display: inline-block;
    box-sizing: border-box;
    text-align: center;
    text-decoration: none;
    padding: 0.7rem 1.1rem;
    font: inherit;
    font-weight: 700;
    white-space: nowrap;
    color: var(--ink);
    background: #fff;
    border: 1.5px solid var(--line);
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.15s, transform 0.05s, border-color 0.15s;
}

.fo-btn:hover:not(:disabled) {
    background: var(--surface);
}

.fo-btn:active:not(:disabled) {
    transform: translateY(1px);
}

.fo-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.fo-btn:focus-visible {
    outline: 3px solid var(--pine-700);
    outline-offset: 2px;
}

.fo-btn--primary {
    background: var(--saffron);
    border-color: var(--saffron);
}

.fo-btn--primary:hover:not(:disabled) {
    background: var(--saffron-dark);
    border-color: var(--saffron-dark);
}

.fo-btn--danger {
    color: var(--chili);
    border-color: #f0b9ae;
}

.fo-btn--danger:hover:not(:disabled) {
    background: #fdf2f0;
}

.fo-btn--small {
    padding: 0.45rem 0.8rem;
    font-size: 0.88rem;
}

.fo-link-btn {
    padding: 0.2rem 0.4rem;
    font: inherit;
    font-weight: 600;
    color: var(--pine-700);
    background: none;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.fo-link-btn:hover {
    text-decoration: underline;
}

.fo-link-btn--danger {
    color: var(--chili);
}

.fo-actions {
    display: flex;
    gap: 0.5rem;
}

/* ---------- Alertas ---------- */
.fo-alert {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 1rem;
    font-size: 0.92rem;
    border-radius: 10px;
    border-left: 4px solid;
}

.fo-alert--error {
    color: var(--busy-fg);
    background: #fbebe8;
    border-color: var(--chili);
}

.fo-alert--success {
    color: var(--free-fg);
    background: var(--free-bg);
    border-color: #4a9c64;
}

.fo-alert button {
    font: inherit;
    font-size: 1.2rem;
    line-height: 1;
    color: inherit;
    background: none;
    border: none;
    cursor: pointer;
}

/* ---------- Tarjetas de resumen ---------- */
.fo-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}

.fo-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 1.1rem 1rem;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 14px;
}

.fo-stat__value {
    font-size: 2rem;
    font-weight: 800;
    line-height: 1.1;
    color: var(--pine-900);
}

.fo-stat__label {
    font-size: 0.9rem;
    color: var(--ink-soft);
}

.fo-card {
    padding: 1.25rem;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 14px;
}

/* ---------- Tablas ---------- */
.fo-table-wrap {
    overflow-x: auto;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 14px;
}

.fo-table {
    width: 100%;
    min-width: 560px;
    border-collapse: collapse;
    font-size: 0.95rem;
}

.fo-table th,
.fo-table td {
    padding: 0.85rem 1rem;
    text-align: left;
    border-bottom: 1px solid var(--line);
}

.fo-table th {
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink-soft);
    background: var(--surface);
}

.fo-table tbody tr:last-child td {
    border-bottom: none;
}

.fo-table tbody tr:hover {
    background: #fafbfa;
}

.fo-table__num {
    text-align: right !important;
}

.fo-empty {
    padding: 2rem 1rem !important;
    text-align: center !important;
    color: var(--ink-soft);
}

/* ---------- Badges ---------- */
.fo-badge {
    display: inline-block;
    padding: 0.25rem 0.7rem;
    font-size: 0.82rem;
    font-weight: 600;
    white-space: nowrap;
    color: var(--grey-fg);
    background: var(--grey-bg);
    border-radius: 999px;
}

.fo-badge--pendiente,
.fo-badge--reservada,
.fo-badge--bajo {
    color: var(--pending-fg);
    background: var(--pending-bg);
}

.fo-badge--preparacion {
    color: var(--prep-fg);
    background: var(--prep-bg);
}

.fo-badge--entregado,
.fo-badge--pagado,
.fo-badge--disponible,
.fo-badge--ok {
    color: var(--done-fg);
    background: var(--done-bg);
}

.fo-badge--ocupada,
.fo-badge--agotado,
.fo-badge--cancelado {
    color: var(--busy-fg);
    background: var(--busy-bg);
}

/* ---------- Paginación ---------- */
.fo-pager {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.85rem;
}

.fo-pager__info {
    margin-right: 0.5rem;
    font-size: 0.9rem;
    color: var(--ink-soft);
}

.fo-pager__btn {
    min-width: 36px;
    height: 36px;
    padding: 0 0.6rem;
    font: inherit;
    font-size: 0.9rem;
    color: var(--ink);
    background: #fff;
    border: 1.5px solid var(--line);
    border-radius: 8px;
    cursor: pointer;
}

.fo-pager__btn:hover:not(:disabled) {
    border-color: var(--pine-700);
}

.fo-pager__btn--active {
    font-weight: 700;
    background: var(--saffron);
    border-color: var(--saffron);
}

.fo-pager__btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

/* ---------- Modal + formularios ---------- */
.fo-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: grid;
    place-items: center;
    padding: 1rem;
    background: rgba(16, 48, 43, 0.45);
}

.fo-modal {
    width: 100%;
    max-width: 480px;
    max-height: 92vh;
    overflow-y: auto;
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.fo-modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--line);
}

.fo-modal__title {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--pine-900);
}

.fo-modal__close {
    font-size: 1.4rem;
    line-height: 1;
    color: var(--ink-soft);
    background: none;
    border: none;
    cursor: pointer;
}

.fo-modal__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
}

.fo-modal__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.fo-form-group {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.fo-form-group label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--ink);
}

.fo-form-group input,
.fo-form-group select,
.fo-form-group textarea {
    padding: 0.65rem 0.85rem;
    font: inherit;
    color: var(--ink);
    background: #fff;
    border: 1.5px solid var(--line);
    border-radius: 8px;
}

.fo-form-group textarea {
    resize: vertical;
    min-height: 70px;
}

.fo-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
}

.fo-check {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.92rem;
    cursor: pointer;
}

/* ---------- Responsive ---------- */
@media (max-width: 1000px) {
    .fo-stats {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 760px) {
    .fo-app {
        grid-template-columns: 1fr;
    }

    .fo-sidebar {
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
        padding: 0.9rem 1rem;
    }

    .fo-sidebar__nav {
        flex-direction: row;
        flex-wrap: wrap;
        order: 3;
        width: 100%;
    }

    .fo-sidebar__logout {
        margin: 0 0 0 auto;
    }

    .fo-form-row {
        grid-template-columns: 1fr;
    }
}
</style>
