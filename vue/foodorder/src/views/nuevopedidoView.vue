<template>
    <main class="orders">
        <!-- Menú lateral -->
        <aside class="sidebar">
            <div class="sidebar__top">
                <div class="sidebar__brand">
                    <h1 class="sidebar__title">FoodOrder</h1>
                    <p class="sidebar__subtitle">Sistema de restaurante</p>
                </div>

                <nav class="sidebar__nav" aria-label="Menú principal">
                    <a href="/pedidos" class="sidebar__link">
                        <span class="sidebar__icon">▤</span>
                        Pedidos
                    </a>

                    <a href="/pedidos/nuevo" class="sidebar__link sidebar__link--active" aria-current="page">
                        <span class="sidebar__icon">＋</span>
                        Nuevo pedido
                    </a>

                    <a href="/cocina" class="sidebar__link">
                        <span class="sidebar__icon">♨</span>
                        Cocina
                    </a>

                    <a href="/productos" class="sidebar__link">
                        <span class="sidebar__icon">▦</span>
                        Productos
                    </a>

                    <a href="/inventario" class="sidebar__link">
                        <span class="sidebar__icon">▣</span>
                        Inventario
                    </a>
                </nav>
            </div>

            <div class="sidebar__footer">
                <div class="sidebar__user">
                    <div class="sidebar__avatar">MS</div>

                    <div class="sidebar__user-info">
                        <strong>Mesero</strong>
                        <span>Personal del restaurante</span>
                    </div>
                </div>

                <button class="sidebar__logout" type="button" @click="cerrarSesion">
                    <span>↪</span>
                    Cerrar sesión
                </button>
            </div>
        </aside>

        <!-- Contenido principal -->
        <section class="orders__main">

            <!-- Cabecera -->
            <header class="topbar">
                <div class="topbar__breadcrumb">
                    <span>Inicio</span>
                    <span class="topbar__separator">/</span>
                    <span>Pedidos</span>
                    <span class="topbar__separator">/</span>
                    <strong>Nuevo pedido</strong>
                </div>

                <div class="topbar__profile">
                    <div class="topbar__profile-avatar">MS</div>

                    <div class="topbar__profile-info">
                        <strong>Mesero</strong>
                        <span>Empleado</span>
                    </div>
                </div>
            </header>

            <!-- Área de contenido -->
            <div class="orders__content">

                <!-- Encabezado de página -->
                <div class="page-heading">
                    <div>
                        <span class="page-heading__eyebrow">
                            GESTIÓN DE VENTAS
                        </span>

                        <h2 class="page-heading__title">Nuevo pedido</h2>

                        <p class="page-heading__description">
                            Selecciona los productos y configura los detalles del pedido.
                        </p>
                    </div>

                    <div class="page-heading__status">
                        <span class="status-dot"></span>
                        Nuevo pedido
                    </div>
                </div>

                <!-- Mensaje de confirmación -->
                <div v-if="mensaje" class="notice" :class="mensajeTipo === 'error'
                    ? 'notice--error'
                    : 'notice--success'" role="status">

                    <span>{{ mensaje }}</span>

                    <button type="button" class="notice__close" aria-label="Cerrar mensaje" @click="mensaje = ''">
                        ×
                    </button>
                </div>

                <!-- Datos del pedido -->
                <section class="order-details">
                    <div class="section-heading">
                        <div>
                            <h3>Información del pedido</h3>
                            <p>Completa los datos antes de agregar los productos.</p>
                        </div>

                        <span class="section-heading__number">01</span>
                    </div>

                    <div class="order-details__grid">
                        <div class="field">
                            <label for="cliente">Cliente</label>

                            <select id="cliente" v-model="clienteSeleccionado" class="field__control">

                                <option value="">Seleccionar cliente</option>

                                <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
                                    {{ cliente.nombre }}
                                </option>
                            </select>
                        </div>

                        <div class="field field--button">
                            <label>&nbsp;</label>

                            <button type="button" class="button button--outline" @click="agregarCliente">
                                <span>＋</span>
                                Nuevo cliente
                            </button>
                        </div>

                        <div class="field">
                            <label for="mesa">Mesa</label>

                            <select id="mesa" v-model="mesaSeleccionada" class="field__control">

                                <option value="">Seleccionar mesa</option>

                                <option v-for="mesa in mesas" :key="mesa" :value="mesa">
                                    Mesa {{ mesa }}
                                </option>
                            </select>
                        </div>
                    </div>
                </section>

                <!-- Catálogo y resumen -->
                <div class="orders__layout">

                    <!-- Catálogo de productos -->
                    <section class="catalog">
                        <div class="section-heading">
                            <div>
                                <h3>Menú de productos</h3>
                                <p>Selecciona los productos que deseas agregar.</p>
                            </div>

                            <span class="catalog__count">
                                {{ productosFiltrados.length }} productos
                            </span>
                        </div>

                        <!-- Búsqueda -->
                        <div class="catalog__search">
                            <span class="catalog__search-icon">⌕</span>

                            <input v-model="busqueda" type="search" placeholder="Buscar producto..."
                                aria-label="Buscar productos">
                        </div>

                        <!-- Categorías -->
                        <div class="categories" aria-label="Categorías de productos">

                            <button v-for="categoria in categorias" :key="categoria" type="button" :class="[
                                'categories__button',
                                categoriaActiva === categoria
                                    ? 'categories__button--active'
                                    : ''
                            ]" :aria-pressed="categoriaActiva === categoria" @click="categoriaActiva = categoria">

                                {{ categoria }}
                            </button>
                        </div>

                        <!-- Lista de productos -->
                        <div v-if="productosFiltrados.length" class="product-grid">

                            <article v-for="producto in productosFiltrados" :key="producto.id" class="product-card">

                                <div class="product-card__image" :class="`product-card__image--${producto.color}`">

                                    <span class="product-card__emoji">
                                        {{ producto.icono }}
                                    </span>

                                    <span class="product-card__category">
                                        {{ producto.categoria }}
                                    </span>
                                </div>

                                <div class="product-card__body">
                                    <div class="product-card__info">
                                        <h4>{{ producto.nombre }}</h4>

                                        <p>{{ producto.descripcion }}</p>
                                    </div>

                                    <div class="product-card__footer">
                                        <span class="product-card__price">
                                            ${{ producto.precio.toFixed(2) }}
                                        </span>

                                        <button type="button" class="product-card__add"
                                            :aria-label="`Agregar ${producto.nombre}`"
                                            @click="agregarAlPedido(producto)">
                                            ＋
                                        </button>
                                    </div>
                                </div>
                            </article>
                        </div>

                        <!-- Catálogo vacío -->
                        <div v-else class="empty-state">
                            <span class="empty-state__icon">⌕</span>

                            <h4>No se encontraron productos</h4>

                            <p>
                                Prueba con otra búsqueda o selecciona una categoría diferente.
                            </p>

                            <button type="button" class="button button--outline" @click="limpiarFiltros">
                                Mostrar todos
                            </button>
                        </div>
                    </section>

                    <!-- Resumen del pedido -->
                    <aside class="summary">
                        <div class="summary__header">
                            <div>
                                <span class="summary__eyebrow">
                                    RESUMEN DE VENTA
                                </span>

                                <h3>Detalle del pedido</h3>
                            </div>

                            <span class="summary__icon">▤</span>
                        </div>

                        <div class="summary__count">
                            <span>Productos seleccionados</span>
                            <strong>{{ cantidadTotal }}</strong>
                        </div>

                        <!-- Productos agregados -->
                        <div class="summary__items">
                            <article v-for="item in pedido" :key="item.id" class="summary-item">

                                <div class="summary-item__info">
                                    <h4>{{ item.nombre }}</h4>

                                    <span>
                                        ${{ item.precio.toFixed(2) }} por unidad
                                    </span>

                                    <div class="quantity">
                                        <button type="button" :aria-label="`Quitar una unidad de ${item.nombre}`"
                                            :disabled="item.cantidad <= 1" @click="cambiarCantidad(item.id, -1)">
                                            −
                                        </button>

                                        <span>{{ item.cantidad }}</span>

                                        <button type="button" :aria-label="`Agregar una unidad de ${item.nombre}`"
                                            @click="cambiarCantidad(item.id, 1)">
                                            ＋
                                        </button>
                                    </div>
                                </div>

                                <div class="summary-item__right">
                                    <strong>
                                        ${{ (item.precio * item.cantidad).toFixed(2) }}
                                    </strong>

                                    <button type="button" class="summary-item__remove"
                                        :aria-label="`Eliminar ${item.nombre}`" @click="eliminarDelPedido(item.id)">
                                        ×
                                    </button>
                                </div>
                            </article>

                            <div v-if="pedido.length === 0" class="summary__empty">

                                <span>▤</span>

                                <h4>Tu pedido está vacío</h4>

                                <p>
                                    Agrega productos del menú para comenzar.
                                </p>
                            </div>
                        </div>

                        <!-- Totales -->
                        <div class="summary__totals">
                            <div class="summary__total-row">
                                <span>Subtotal</span>

                                <span>${{ subtotalPedido.toFixed(2) }}</span>
                            </div>

                            <div class="summary__total-row">
                                <span>Impuestos</span>

                                <span>${{ impuestos.toFixed(2) }}</span>
                            </div>

                            <div class="summary__grand-total">
                                <span>Total</span>

                                <strong>${{ totalPedido.toFixed(2) }}</strong>
                            </div>
                        </div>

                        <!-- Acciones -->
                        <div class="summary__actions">
                            <button type="button" class="button button--primary" :disabled="!puedeConfirmar"
                                @click="confirmarPedido">

                                Confirmar pedido
                                <span>→</span>
                            </button>

                            <button type="button" class="button button--cancel" :disabled="pedido.length === 0"
                                @click="cancelarPedido">

                                Cancelar pedido
                            </button>
                        </div>

                        <p class="summary__footnote">
                            Verifica los productos y los datos antes de confirmar.
                        </p>
                    </aside>
                </div>
            </div>
        </section>
    </main>
</template>

<script>
export default {
    name: 'NuevoPedido',

    data() {
        return {
            categoriaActiva: 'Todas',
            busqueda: '',

            clienteSeleccionado: '',
            mesaSeleccionada: '',

            mensaje: '',
            mensajeTipo: 'success',

            clientes: [
                { id: 1, nombre: 'Cliente general' },
                { id: 2, nombre: 'Carlos Martínez' },
                { id: 3, nombre: 'María Hernández' },
                { id: 4, nombre: 'José Ramírez' }
            ],

            mesas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],

            categorias: [
                'Todas',
                'Entradas',
                'Platos',
                'Bebidas',
                'Postres'
            ],

            productos: [
                {
                    id: 1,
                    nombre: 'Ensalada fresca',
                    descripcion: 'Vegetales frescos de temporada.',
                    precio: 5.50,
                    categoria: 'Entradas',
                    icono: '🥗',
                    color: 'green'
                },
                {
                    id: 2,
                    nombre: 'Papas fritas',
                    descripcion: 'Papas doradas y crujientes.',
                    precio: 3.00,
                    categoria: 'Entradas',
                    icono: '🍟',
                    color: 'gold'
                },
                {
                    id: 3,
                    nombre: 'Hamburguesa clásica',
                    descripcion: 'Carne, vegetales y queso.',
                    precio: 8.50,
                    categoria: 'Platos',
                    icono: '🍔',
                    color: 'orange'
                },
                {
                    id: 4,
                    nombre: 'Pizza especial',
                    descripcion: 'Queso, salsa y vegetales.',
                    precio: 12.00,
                    categoria: 'Platos',
                    icono: '🍕',
                    color: 'red'
                },
                {
                    id: 5,
                    nombre: 'Pollo a la plancha',
                    descripcion: 'Pollo acompañado de vegetales.',
                    precio: 9.75,
                    categoria: 'Platos',
                    icono: '🍗',
                    color: 'green'
                },
                {
                    id: 6,
                    nombre: 'Limonada',
                    descripcion: 'Bebida natural refrescante.',
                    precio: 2.00,
                    categoria: 'Bebidas',
                    icono: '🍋',
                    color: 'gold'
                },
                {
                    id: 7,
                    nombre: 'Jugo de naranja',
                    descripcion: 'Jugo de naranja natural.',
                    precio: 2.50,
                    categoria: 'Bebidas',
                    icono: '🍊',
                    color: 'orange'
                },
                {
                    id: 8,
                    nombre: 'Pastel de chocolate',
                    descripcion: 'Pastel con cobertura de chocolate.',
                    precio: 4.00,
                    categoria: 'Postres',
                    icono: '🍰',
                    color: 'red'
                }
            ],

            pedido: [],

            // Tasa de impuesto de ejemplo: 13 %.
            // Ajusta este valor según la normativa y configuración
            // fiscal aplicable a tu restaurante.
            tasaImpuesto: 0.13
        }
    },

    computed: {
        productosFiltrados() {
            const termino = this.busqueda.trim().toLowerCase()

            return this.productos.filter(producto => {
                const coincideCategoria =
                    this.categoriaActiva === 'Todas' ||
                    producto.categoria === this.categoriaActiva

                const coincideBusqueda =
                    producto.nombre.toLowerCase().includes(termino) ||
                    producto.descripcion.toLowerCase().includes(termino)

                return coincideCategoria && coincideBusqueda
            })
        },

        cantidadTotal() {
            return this.pedido.reduce(
                (total, item) => total + item.cantidad,
                0
            )
        },

        subtotalPedido() {
            return this.pedido.reduce(
                (total, item) => total + item.precio * item.cantidad,
                0
            )
        },

        impuestos() {
            return Number(
                (this.subtotalPedido * this.tasaImpuesto).toFixed(2)
            )
        },

        totalPedido() {
            return Number(
                (this.subtotalPedido + this.impuestos).toFixed(2)
            )
        },

        puedeConfirmar() {
            return (
                this.pedido.length > 0 &&
                this.clienteSeleccionado !== '' &&
                this.mesaSeleccionada !== ''
            )
        }
    },

    methods: {
        agregarAlPedido(producto) {
            const existente = this.pedido.find(
                item => item.id === producto.id
            )

            if (existente) {
                existente.cantidad++
            } else {
                this.pedido.push({
                    id: producto.id,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    cantidad: 1
                })
            }

            this.mensaje = `${producto.nombre} agregado al pedido.`
            this.mensajeTipo = 'success'
        },

        cambiarCantidad(id, cambio) {
            const item = this.pedido.find(producto => producto.id === id)

            if (!item) return

            const nuevaCantidad = item.cantidad + cambio

            if (nuevaCantidad >= 1) {
                item.cantidad = nuevaCantidad
            }
        },

        eliminarDelPedido(id) {
            this.pedido = this.pedido.filter(
                item => item.id !== id
            )

            this.mensaje = 'Producto eliminado del pedido.'
            this.mensajeTipo = 'success'
        },

        agregarCliente() {
            const nombre = window.prompt(
                'Ingresa el nombre del nuevo cliente:'
            )

            if (nombre === null || !nombre.trim()) {
                return
            }

            const nuevoCliente = {
                id: this.clientes.length
                    ? Math.max(...this.clientes.map(c => c.id)) + 1
                    : 1,
                nombre: nombre.trim()
            }

            this.clientes.push(nuevoCliente)
            this.clienteSeleccionado = nuevoCliente.id

            this.mensaje = 'Cliente agregado correctamente.'
            this.mensajeTipo = 'success'
        },

        limpiarFiltros() {
            this.categoriaActiva = 'Todas'
            this.busqueda = ''
        },

        confirmarPedido() {
            if (!this.puedeConfirmar) {
                this.mensaje =
                    'Selecciona un cliente, una mesa y al menos un producto.'

                this.mensajeTipo = 'error'
                return
            }

            const cliente = this.clientes.find(
                c => c.id === Number(this.clienteSeleccionado)
            )

            const pedidoConfirmado = {
                cliente: cliente ? cliente.nombre : '',
                mesa: this.mesaSeleccionada,
                productos: this.pedido.map(item => ({ ...item })),
                subtotal: this.subtotalPedido,
                impuestos: this.impuestos,
                total: this.totalPedido,
                fecha: new Date().toISOString()
            }

            // Evento para que el componente padre pueda recibir el pedido.
            // No guarda información permanentemente en una base de datos.
            this.$emit('pedido-confirmado', pedidoConfirmado)

            this.mensaje =
                `Pedido preparado para ${cliente.nombre}, mesa ${this.mesaSeleccionada}. Total: $${this.totalPedido.toFixed(2)}.`

            this.mensajeTipo = 'success'

            // Se limpia el formulario después de confirmar.
            this.pedido = []
            this.clienteSeleccionado = ''
            this.mesaSeleccionada = ''
        },

        cancelarPedido() {
            const confirmar = window.confirm(
                '¿Deseas cancelar el pedido y eliminar todos sus productos?'
            )

            if (!confirmar) return

            this.pedido = []
            this.clienteSeleccionado = ''
            this.mesaSeleccionada = ''
            this.mensaje = 'El pedido se ha cancelado.'
            this.mensajeTipo = 'success'
        },

        cerrarSesion() {
            const confirmar = window.confirm(
                '¿Deseas cerrar la sesión?'
            )

            if (confirmar) {
                this.$router.push('/login')
            }
        }
    }
}
</script>

<style scoped>
/* FoodOrder — CSS simplificado y aislado para la vista Nuevo Pedido */
.orders {
    --pine: #11312b;
    --pine-light: #1a473e;
    --gold: #e5ac31;
    --gold-hover: #d69a20;
    --ink: #26332f;
    --muted: #718079;
    --surface: #f5f7f6;
    --white: #fff;
    --line: #e2e8e4;
    --line-dark: #d2dbd5;
    --success-bg: #eaf6ed;
    --success: #25683a;
    --error-bg: #fbebe8;
    --error: #c8402a;

    display: flex;
    width: 100%;
    min-width: 0;
    min-height: 100vh;
    color: var(--ink);
    background: var(--surface);
    font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
    box-sizing: border-box;
}

.orders *,
.orders *::before,
.orders *::after {
    box-sizing: inherit;
}

.orders button,
.orders input,
.orders select {
    font: inherit;
}

.orders button {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
}

.orders button:disabled {
    opacity: .45;
    cursor: not-allowed;
}

.orders button:focus-visible,
.orders a:focus-visible,
.orders input:focus-visible,
.orders select:focus-visible {
    outline: 3px solid #e5ac318c;
    outline-offset: 2px;
}

/* Sidebar: siempre ocupa su propio espacio, no se superpone */
.orders .sidebar {
    display: flex;
    flex: 0 0 255px;
    flex-direction: column;
    justify-content: space-between;
    width: 255px;
    min-width: 255px;
    background: var(--pine);
    color: var(--white);
}

.orders .sidebar__brand {
    padding: 28px 22px 22px;
    border-bottom: 1px solid #ffffff17;
}

.orders .sidebar__title {
    margin: 0;
    font-size: 25px;
    font-weight: 800;
    letter-spacing: -.7px;
}

.orders .sidebar__subtitle {
    margin: 7px 0 0;
    color: #b7c8c1;
    font-size: 11px;
}

.orders .sidebar__nav {
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 22px 14px;
}

.orders .sidebar__link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 9px;
    color: #d3e0da;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    transition: background .2s, color .2s;
}

.orders .sidebar__link:hover {
    background: var(--pine-light);
    color: var(--white);
}

.orders .sidebar__link--active {
    background: var(--gold);
    color: var(--pine);
    font-weight: 800;
}

.orders .sidebar__link--active:hover {
    background: var(--gold-hover);
    color: var(--pine);
}

.orders .sidebar__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    font-size: 18px;
}

.orders .sidebar__footer {
    padding: 18px 16px;
    border-top: 1px solid #ffffff1f;
}

.orders .sidebar__user {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
}

.orders .sidebar__avatar,
.orders .topbar__profile-avatar {
    display: grid;
    place-items: center;
    flex: 0 0 38px;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 800;
}

.orders .sidebar__avatar {
    background: var(--gold);
    color: var(--pine);
}

.orders .sidebar__user-info,
.orders .topbar__profile-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.orders .sidebar__user-info strong {
    font-size: 12px;
}

.orders .sidebar__user-info span {
    color: #b7c8c1;
    font-size: 10px;
}

.orders .sidebar__logout {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    padding: 10px 12px;
    color: #e1e9e5;
    background: transparent;
    border: 1px solid #ffffff33;
    border-radius: 8px;
    font-size: 12px;
    text-align: left;
}

.orders .sidebar__logout:hover {
    background: var(--pine-light);
}

/* Área de contenido */
.orders .orders__main {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-width: 0;
}

.orders .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    min-height: 76px;
    padding: 15px 30px;
    background: var(--white);
    border-bottom: 1px solid var(--line);
}

.orders .topbar__breadcrumb {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    color: var(--muted);
    font-size: 12px;
}

.orders .topbar__separator {
    color: #c4cec8;
}

.orders .topbar__breadcrumb strong,
.orders .topbar__profile-info strong {
    color: var(--pine);
}

.orders .topbar__profile {
    display: flex;
    align-items: center;
    gap: 10px;
}

.orders .topbar__profile-avatar {
    background: var(--pine);
    color: var(--white);
}

.orders .topbar__profile-info strong {
    font-size: 12px;
}

.orders .topbar__profile-info span {
    color: var(--muted);
    font-size: 10px;
}

.orders .orders__content {
    width: 100%;
    max-width: 1700px;
    margin: 0 auto;
    padding: 28px 30px 38px;
}

/* Encabezados y avisos */
.orders .page-heading,
.orders .section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}
</style>