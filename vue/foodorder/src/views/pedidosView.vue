<template>
    <div class="app">
        <!-- ============ Sidebar ============ -->
        <aside class="sidebar">
            <div class="sidebar__brand">FoodOrder</div>

            <nav class="sidebar__nav" aria-label="Navegación principal">
                <router-link v-for="item in menu" :key="item.to" :to="item.to" class="sidebar__link"
                    exact-active-class="sidebar__link--active">
                    {{ item.label }}
                </router-link>
            </nav>

            <button type="button" class="sidebar__logout" @click="logout">Cerrar sesión</button>
        </aside>

        <!-- ============ Contenido ============ -->
        <div class="main">
            <!-- Barra superior -->
            <header class="topbar">
                <nav class="topbar__crumbs" aria-label="Ruta">Inicio / Pedidos</nav>

                <div class="topbar__user" ref="userMenuRef">
                    <button type="button" class="topbar__bell" aria-label="Notificaciones">
                        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                            <path fill="currentColor"
                                d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5-6.7V3a2 2 0 1 0-4 0v1.3A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z" />
                        </svg>
                        <span class="topbar__dot" />
                    </button>

                    <!-- Botón disparador del menú -->
                    <button type="button" class="user-trigger" :class="{ 'user-trigger--active': isMenuOpen }"
                        :aria-expanded="isMenuOpen" aria-haspopup="menu" @click="toggleMenu">
                        <span class="topbar__avatar" aria-hidden="true">{{ initials }}</span>
                        <span class="topbar__role">{{ user.role }}</span>
                        <span class="topbar__arrow" :class="{ 'topbar__arrow--up': isMenuOpen }">▾</span>
                    </button>

                    <!-- Menú desplegable con opciones de administración -->
                    <transition name="dropdown-fade">
                        <div v-if="isMenuOpen" class="user-menu" role="menu">
                            <div class="user-menu__header">
                                <span class="user-menu__name">{{ user.name }}</span>
                                <span class="user-menu__badge">{{ user.role }}</span>
                            </div>

                            <template v-if="isAdmin">
                                <div class="user-menu__divider"></div>

                                <button type="button" class="user-menu__item" role="menuitem"
                                    @click="goToAdmin('/admin/usuarios')">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                        <path
                                            d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                                    </svg>
                                    Gestión de Personal
                                </button>

                                <button type="button" class="user-menu__item" role="menuitem"
                                    @click="goToAdmin('/admin/reportes')">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                        <path
                                            d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                                    </svg>
                                    Reportes y Métricas
                                </button>

                                <button type="button" class="user-menu__item" role="menuitem"
                                    @click="goToAdmin('/admin/configuracion')">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                        <path
                                            d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                                    </svg>
                                    Configuración del Local
                                </button>
                            </template>

                            <div class="user-menu__divider"></div>

                            <button type="button" class="user-menu__item user-menu__item--danger" role="menuitem"
                                @click="logout">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                    <path
                                        d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                                </svg>
                                Cerrar sesión
                            </button>
                        </div>
                    </transition>
                </div>
            </header>

            <main class="content">
                <p v-if="error" class="alert" role="alert">
                    {{ error }}
                    <button type="button" class="link-btn" @click="loadAll">Reintentar</button>
                </p>

                <!-- Título + filtros -->
                <div class="toolbar">
                    <h1 class="toolbar__title">Pedidos</h1>

                    <input v-model="search" type="search" class="toolbar__search" placeholder="Buscar pedido o cliente"
                        aria-label="Buscar pedido o cliente" />

                    <select v-model="statusFilter" class="toolbar__select" aria-label="Filtrar por estado">
                        <option value="todos">Estado: Todos</option>
                        <option v-for="(label, key) in statusLabels" :key="key" :value="key">
                            {{ label }}
                        </option>
                    </select>

                    <button type="button" class="btn-primary" @click="newOrder">
                        <span aria-hidden="true">+</span> Nuevo pedido
                    </button>
                </div>

                <!-- Tarjetas de resumen -->
                <section class="stats" aria-label="Resumen">
                    <article class="stat">
                        <strong class="stat__value">{{ stats.pending }}</strong>
                        <span class="stat__label">Pendientes</span>
                    </article>
                    <article class="stat">
                        <strong class="stat__value">{{ stats.preparing }}</strong>
                        <span class="stat__label">En preparación</span>
                    </article>
                    <article class="stat">
                        <strong class="stat__value">{{ stats.delivered }}</strong>
                        <span class="stat__label">Entregados</span>
                    </article>
                    <article class="stat stat--money">
                        <strong class="stat__value">{{ formatMoney(stats.sales) }}</strong>
                        <span class="stat__label">Ventas de hoy</span>
                    </article>
                </section>

                <!-- Mesas -->
                <section>
                    <h2 class="section-title">Mesas</h2>
                    <div class="tables">
                        <div v-for="table in tables" :key="table.id" class="table-card"
                            :class="[tableClass(table), { 'table-card--clickable': table.estado === 'disponible' }]"
                            :title="table.estado === 'disponible' ? 'Crear pedido en esta mesa' : ''"
                            @click="table.estado === 'disponible' && newOrder(table.id)">
                            <span>Mesa {{ table.numero_mesa }}</span>
                            <strong>{{ tableLabel(table) }}</strong>
                        </div>
                        <p v-if="!loading && !tables.length" class="orders__empty">No hay mesas registradas.</p>
                    </div>
                </section>

                <!-- Pedidos recientes -->
                <section>
                    <h2 class="section-title">Pedidos recientes</h2>

                    <div class="table-wrap">
                        <table class="orders">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Cliente</th>
                                    <th>Mesa</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="order in pagedOrders" :key="order.id">
                                    <td>{{ order.id }}</td>
                                    <td>{{ order.customer }}</td>
                                    <td>{{ order.table }}</td>
                                    <td>{{ formatMoney(order.total) }}</td>
                                    <td>
                                        <span class="badge" :class="'badge--' + order.status">
                                            {{ statusLabels[order.status] }}
                                        </span>
                                    </td>
                                    <td>
                                        <button type="button" class="link-btn" @click="viewOrder(order)">
                                            Ver
                                        </button>
                                    </td>
                                </tr>
                                <tr v-if="loading && !orders.length">
                                    <td colspan="6" class="orders__empty">Cargando pedidos…</td>
                                </tr>
                                <tr v-else-if="!pagedOrders.length">
                                    <td colspan="6" class="orders__empty">No hay pedidos que coincidan.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Paginación -->
                    <div class="pager">
                        <span class="pager__info">{{ showingText }}</span>
                        <button type="button" class="pager__btn" :disabled="page === 1" aria-label="Página anterior"
                            @click="goTo(page - 1)">
                            &lt;
                        </button>
                        <button v-for="n in totalPages" :key="n" type="button" class="pager__btn"
                            :class="{ 'pager__btn--active': n === page }" :aria-current="n === page ? 'page' : null"
                            @click="goTo(n)">
                            {{ n }}
                        </button>
                        <button type="button" class="pager__btn" :disabled="page === totalPages"
                            aria-label="Página siguiente" @click="goTo(page + 1)">
                            &gt;
                        </button>
                    </div>
                </section>
            </main>
        </div>
    </div>
</template>

<script>
import api from '@/services/api'
import { getUser, logout as endSession, isAdmin } from '@/services/auth'
import { errorMessage, fullName, isSameDay, ESTADOS_PEDIDO } from '@/services/utils'

export default {
    name: 'pedidosView',

    data() {
        return {
            user: getUser() || { name: 'Usuario', role: '' },
            isAdmin: isAdmin(),
            isMenuOpen: false,
            loading: false,
            error: '',
            refreshTimer: null,

            menu: [
                { label: 'Pedidos', to: '/pedidos' },
                { label: 'Nuevo pedido', to: '/nuevopedido' },
                { label: 'Cocina', to: '/cocina' },
                { label: 'Productos', to: '/productos' },
                { label: 'Inventario', to: '/inventario' }
            ],

            statusLabels: ESTADOS_PEDIDO,

            search: '',
            statusFilter: 'todos',
            page: 1,
            pageSize: 5,

            // Datos reales de la API (GET /pedidos y GET /mesas)
            orders: [],
            tables: []
        }
    },

    computed: {
        initials() {
            return (this.user.name || 'Admin')
                .split(' ')
                .map((word) => word[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
        },

        filteredOrders() {
            const term = this.search.trim().toLowerCase()
            return this.orders.filter((order) => {
                const matchesStatus = this.statusFilter === 'todos' || order.status === this.statusFilter
                const matchesText =
                    !term ||
                    order.customer.toLowerCase().includes(term) ||
                    String(order.id).includes(term)
                return matchesStatus && matchesText
            })
        },

        totalPages() {
            return Math.max(1, Math.ceil(this.filteredOrders.length / this.pageSize))
        },

        pagedOrders() {
            const start = (this.page - 1) * this.pageSize
            return this.filteredOrders.slice(start, start + this.pageSize)
        },

        showingText() {
            const total = this.filteredOrders.length
            if (!total) return 'Sin resultados'
            const start = (this.page - 1) * this.pageSize + 1
            const end = Math.min(this.page * this.pageSize, total)
            return `Mostrando ${start}–${end} de ${total}`
        },

        stats() {
            const count = (status) => this.orders.filter((o) => o.status === status).length
            return {
                pending: count('pendiente'),
                preparing: count('preparacion'),
                delivered: count('entregado'),
                sales: this.orders
                    .filter((o) => o.status !== 'cancelado' && isSameDay(o.fecha))
                    .reduce((sum, o) => sum + o.total, 0)
            }
        }
    },

    watch: {
        search() {
            this.page = 1
        },
        statusFilter() {
            this.page = 1
        }
    },

    mounted() {
        document.addEventListener('click', this.handleClickOutside)
        this.loadAll()
        // Refresco automático para ver pedidos nuevos y cambios de estado
        this.refreshTimer = setInterval(() => this.loadAll(true), 30000)
    },

    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside)
        clearInterval(this.refreshTimer)
    },

    methods: {
        customerName(pedido) {
            // Compatible con una relación cliente y con nombres planos de la API.
            const cliente = pedido.cliente ?? pedido.customer ?? null
            if (typeof cliente === 'string' && cliente.trim()) return cliente.trim()
            if (cliente && typeof cliente === 'object') {
                const nombre = fullName(cliente)
                if (nombre && nombre !== 'Sin cliente') return nombre
                const alternativo = cliente.nombre_completo ?? cliente.name
                if (typeof alternativo === 'string' && alternativo.trim()) return alternativo.trim()
            }
            const directo = pedido.nombre_cliente ?? pedido.cliente_nombre ?? pedido.customer_name
            if (typeof directo === 'string' && directo.trim()) return directo.trim()
            return 'Sin cliente'
        },

        async loadAll(silent = false) {
            if (!silent) this.loading = true
            try {
                const [pedidos, mesas] = await Promise.all([api.get('/pedidos'), api.get('/mesas')])

                this.orders = pedidos.data.map((p) => ({
                    id: p.id,
                    customer: this.customerName(p),
                    table: p.mesa ? p.mesa.numero_mesa : '—',
                    total: Number(p.precio_total),
                    status: p.estado,
                    fecha: p.fecha_pedido || p.created_at
                }))
                this.tables = mesas.data
                this.error = ''
            } catch (e) {
                this.error = errorMessage(e, 'No se pudieron cargar los pedidos.')
            } finally {
                this.loading = false
            }
        },

        tableClass(table) {
            if (table.estado === 'ocupada') return 'table-card--busy'
            if (table.estado === 'reservada') return 'table-card--reserved'
            return 'table-card--free'
        },

        tableLabel(table) {
            if (table.estado === 'ocupada') return 'Ocupada'
            if (table.estado === 'reservada') return 'Reservada'
            return 'Libre'
        },

        toggleMenu() {
            this.isMenuOpen = !this.isMenuOpen
        },

        closeMenu() {
            this.isMenuOpen = false
        },

        handleClickOutside(event) {
            if (this.$refs.userMenuRef && !this.$refs.userMenuRef.contains(event.target)) {
                this.closeMenu()
            }
        },

        goToAdmin(route) {
            this.closeMenu()
            this.$router.push(route)
        },

        formatMoney(value) {
            return `$${Number(value || 0).toFixed(2)}`
        },

        goTo(n) {
            if (n >= 1 && n <= this.totalPages) this.page = n
        },

        newOrder(mesaId) {
            // Si se llama desde el botón, Vue pasa el evento de click: solo aceptamos un id numérico
            const query = typeof mesaId === 'number' ? { mesa: mesaId } : {}
            this.$router.push({ path: '/nuevopedido', query })
        },

        viewOrder(order) {
            this.$router.push(`/pedidos/${order.id}`)
        },

        logout() {
            this.closeMenu()
            endSession()
            this.$router.push('/')
        }
    }
}
</script>

<style scoped>
.app {
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

    display: grid;
    grid-template-columns: 240px 1fr;
    min-height: 100vh;
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
    color: var(--ink);
    background: var(--surface);
}

/* ---------- Sidebar ---------- */
.sidebar {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem 1rem;
    background: var(--pine-900);
    color: #e8f1ee;
}

.sidebar__brand {
    padding: 0 0.5rem;
    font-size: 1.6rem;
    font-weight: 800;
    letter-spacing: -0.02em;
}

.sidebar__nav {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.sidebar__link {
    padding: 0.7rem 0.9rem;
    color: #cfe0db;
    text-decoration: none;
    border-radius: 10px;
    transition: background 0.15s, color 0.15s;
}

.sidebar__link:hover {
    background: var(--pine-700);
    color: #fff;
}

.sidebar__link--active,
.sidebar__link--active:hover {
    font-weight: 700;
    color: var(--ink);
    background: var(--saffron);
}

.sidebar__link:focus-visible,
.sidebar__logout:focus-visible {
    outline: 2px solid var(--saffron);
    outline-offset: 2px;
}

.sidebar__logout {
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

.sidebar__logout:hover {
    background: var(--pine-700);
}

/* ---------- Main + topbar ---------- */
.main {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid var(--line);
}

.topbar__crumbs {
    font-size: 0.9rem;
    color: var(--ink-soft);
}

.topbar__user {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.topbar__bell {
    position: relative;
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    color: var(--ink-soft);
    background: none;
    border: none;
    border-radius: 50%;
    cursor: pointer;
}

.topbar__bell:hover {
    background: var(--surface);
}

.topbar__dot {
    position: absolute;
    top: 7px;
    right: 8px;
    width: 8px;
    height: 8px;
    background: var(--chili);
    border: 2px solid #fff;
    border-radius: 50%;
    box-sizing: content-box;
}

/* ---------- Botón y Menú Desplegable Administrador ---------- */
.user-trigger {
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

.user-trigger:hover,
.user-trigger--active {
    background: var(--surface);
    border-color: var(--line);
}

.topbar__avatar {
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

.topbar__role {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--ink);
}

.topbar__arrow {
    font-size: 0.8rem;
    color: var(--ink-soft);
    transition: transform 0.2s ease;
}

.topbar__arrow--up {
    transform: rotate(180deg);
}

.user-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 230px;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(16, 48, 43, 0.1), 0 8px 10px -6px rgba(16, 48, 43, 0.05);
    padding: 0.5rem;
    z-index: 100;
    display: flex;
    flex-direction: column;
}

.user-menu__header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem 0.6rem;
}

.user-menu__name {
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--pine-900);
}

.user-menu__badge {
    align-self: flex-start;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.15rem 0.45rem;
    background: var(--pending-bg);
    color: var(--pending-fg);
    border-radius: 4px;
}

.user-menu__divider {
    height: 1px;
    background: var(--line);
    margin: 0.35rem 0;
}

.user-menu__item {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    width: 100%;
    padding: 0.6rem 0.65rem;
    font: inherit;
    font-size: 0.88rem;
    color: var(--ink);
    background: transparent;
    border: none;
    border-radius: 8px;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
}

.user-menu__item svg {
    color: var(--ink-soft);
    flex-shrink: 0;
}

.user-menu__item:hover {
    background: var(--surface);
    color: var(--pine-900);
}

.user-menu__item:hover svg {
    color: var(--pine-700);
}

.user-menu__item--danger {
    color: var(--chili);
}

.user-menu__item--danger svg {
    color: var(--chili);
}

.user-menu__item--danger:hover {
    background: #fdf2f0;
    color: var(--chili);
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}

/* ---------- Contenido ---------- */
.content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
}

.toolbar {
    display: grid;
    grid-template-columns: auto minmax(180px, 1fr) 220px auto;
    align-items: center;
    gap: 0.75rem;
}

.toolbar__title {
    margin: 0 0.5rem 0 0;
    font-size: 1.9rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--pine-900);
}

.toolbar__search,
.toolbar__select {
    width: 100%;
    box-sizing: border-box;
    padding: 0.75rem 1rem;
    font: inherit;
    color: var(--ink);
    background: #fff;
    border: 1.5px solid var(--line);
    border-radius: 10px;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.toolbar__search:focus,
.toolbar__select:focus {
    outline: none;
    border-color: var(--pine-700);
    box-shadow: 0 0 0 3px rgba(27, 74, 66, 0.2);
}

.btn-primary {
    padding: 0.75rem 1.1rem;
    font: inherit;
    font-weight: 700;
    white-space: nowrap;
    color: var(--ink);
    background: var(--saffron);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.15s, transform 0.05s;
}

.btn-primary:hover {
    background: var(--saffron-dark);
}

.btn-primary:active {
    transform: translateY(1px);
}

.btn-primary:focus-visible {
    outline: 3px solid var(--pine-700);
    outline-offset: 2px;
}

/* ---------- Resumen ---------- */
.stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}

.stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 1.1rem 1rem;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 14px;
}

.stat__value {
    font-size: 2rem;
    font-weight: 800;
    line-height: 1.1;
    color: var(--pine-900);
}

.stat--money .stat__value {
    color: var(--pine-700);
}

.stat__label {
    font-size: 0.9rem;
    color: var(--ink-soft);
}

/* ---------- Mesas ---------- */
.section-title {
    margin: 0 0 0.75rem;
    font-size: 1.1rem;
    font-weight: 700;
}

.tables {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 0.75rem;
}

.table-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    padding: 0.8rem 0.5rem;
    font-size: 0.9rem;
    border-radius: 12px;
    border: 1.5px solid transparent;
}

.table-card--free {
    color: var(--free-fg);
    background: var(--free-bg);
    border-color: #b9dcc2;
}

.table-card--busy {
    color: var(--busy-fg);
    background: var(--busy-bg);
    border-color: #f0b9ae;
}

.table-card--reserved {
    color: var(--pending-fg);
    background: var(--pending-bg);
    border-color: #ecd596;
}

.table-card--clickable {
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.15s;
}

.table-card--clickable:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 14px -6px rgba(16, 48, 43, 0.35);
}

.alert {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin: 0;
    padding: 0.75rem 1rem;
    font-size: 0.92rem;
    color: var(--busy-fg);
    background: #fbebe8;
    border-left: 4px solid var(--chili);
    border-radius: 10px;
}

/* ---------- Tabla de pedidos ---------- */
.table-wrap {
    overflow-x: auto;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 14px;
}

.orders {
    width: 100%;
    min-width: 560px;
    border-collapse: collapse;
    font-size: 0.95rem;
}

.orders th,
.orders td {
    padding: 0.85rem 1rem;
    text-align: left;
    border-bottom: 1px solid var(--line);
}

.orders th {
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink-soft);
    background: var(--surface);
}

.orders tbody tr:last-child td {
    border-bottom: none;
}

.orders tbody tr:hover {
    background: #fafbfa;
}

.orders__empty {
    padding: 2rem 1rem;
    text-align: center;
    color: var(--ink-soft);
}

.badge {
    display: inline-block;
    padding: 0.25rem 0.7rem;
    font-size: 0.82rem;
    font-weight: 600;
    white-space: nowrap;
    border-radius: 999px;
}

.badge--pendiente {
    color: var(--pending-fg);
    background: var(--pending-bg);
}

.badge--preparacion {
    color: var(--prep-fg);
    background: var(--prep-bg);
}

.badge--entregado,
.badge--pagado {
    color: var(--done-fg);
    background: var(--done-bg);
}

.badge--cancelado {
    color: var(--busy-fg);
    background: var(--busy-bg);
}

.link-btn {
    padding: 0.2rem 0.4rem;
    font: inherit;
    font-weight: 600;
    color: var(--pine-700);
    background: none;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.link-btn:hover {
    text-decoration: underline;
}

.link-btn:focus-visible {
    outline: 2px solid var(--pine-700);
}

/* ---------- Paginación ---------- */
.pager {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.85rem;
}

.pager__info {
    margin-right: 0.5rem;
    font-size: 0.9rem;
    color: var(--ink-soft);
}

.pager__btn {
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

.pager__btn:hover:not(:disabled) {
    border-color: var(--pine-700);
}

.pager__btn--active {
    font-weight: 700;
    background: var(--saffron);
    border-color: var(--saffron);
}

.pager__btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

.pager__btn:focus-visible {
    outline: 2px solid var(--pine-700);
    outline-offset: 2px;
}

/* ---------- Responsive ---------- */
@media (max-width: 1000px) {
    .toolbar {
        grid-template-columns: 1fr 1fr;
    }

    .toolbar__title {
        grid-column: 1 / -1;
    }

    .stats {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 760px) {
    .app {
        grid-template-columns: 1fr;
    }

    .sidebar {
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
        padding: 0.9rem 1rem;
    }

    .sidebar__nav {
        flex-direction: row;
        flex-wrap: wrap;
        order: 3;
        width: 100%;
    }

    .sidebar__logout {
        margin: 0 0 0 auto;
    }

    .toolbar {
        grid-template-columns: 1fr;
    }
}
</style>