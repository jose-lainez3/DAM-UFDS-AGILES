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

                <div class="topbar__user">
                    <button type="button" class="topbar__bell" aria-label="Notificaciones">
                        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                            <path fill="currentColor"
                                d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5-6.7V3a2 2 0 1 0-4 0v1.3A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z" />
                        </svg>
                        <span class="topbar__dot" />
                    </button>
                    <span class="topbar__avatar" aria-hidden="true">{{ initials }}</span>
                    <span class="topbar__role">{{ user.role }} ▾</span>
                </div>
            </header>

            <main class="content">
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
                            :class="table.occupied ? 'table-card--busy' : 'table-card--free'">
                            <span>Mesa {{ table.id }}</span>
                            <strong>{{ table.occupied ? 'Ocupada' : 'Libre' }}</strong>
                        </div>
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
                                <tr v-if="!pagedOrders.length">
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
// import api from '@/services/api'
import { getUser, logout as endSession } from '@/services/auth'

export default {
    name: 'pedidosView',

    data() {
        return {
            user: getUser() || { name: 'Invitado', role: 'Invitado' },

            menu: [
                { label: 'Pedidos', to: '/pedidos' },
                { label: 'Nuevo pedido', to: '/nuevopedido' },
                { label: 'Cocina', to: '/cocina' },
                { label: 'Productos', to: '/productos' },
                { label: 'Inventario', to: '/inventario' }
            ],

            statusLabels: {
                pendiente: 'Pendiente',
                preparacion: 'En preparación',
                entregado: 'Entregado'
            },

            search: '',
            statusFilter: 'todos',
            page: 1,
            pageSize: 5,

            // TODO: reemplazar estos datos de ejemplo por la respuesta de tu API
            // (en created(): const { data } = await api.get('/pedidos'))
            orders: [
                { id: 101, customer: 'Cliente 1', table: 2, total: 24.5, status: 'preparacion' },
                { id: 102, customer: 'Cliente 2', table: 4, total: 12.0, status: 'pendiente' },
                { id: 103, customer: 'Cliente 3', table: 1, total: 31.75, status: 'entregado' }
            ],

            tables: [
                { id: 1, occupied: false },
                { id: 2, occupied: true },
                { id: 3, occupied: false },
                { id: 4, occupied: true },
                { id: 5, occupied: false },
                { id: 6, occupied: false }
            ]
        }
    },

    computed: {
        initials() {
            return this.user.name
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
                sales: this.orders.reduce((sum, o) => sum + o.total, 0)
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

    methods: {
        formatMoney(value) {
            return `$${Number(value).toFixed(2)}`
        },

        goTo(n) {
            if (n >= 1 && n <= this.totalPages) this.page = n
        },

        newOrder() {
            this.$router.push('/pedidos/nuevo')
        },

        viewOrder(order) {
            this.$router.push(`/pedidos/${order.id}`)
        },

        logout() {
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

.badge--entregado {
    color: var(--done-fg);
    background: var(--done-bg);
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