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

<style>
/* =========================================
   FOODORDER - SISTEMA DE PEDIDOS
   Paleta: verde pino, dorado y fondo claro
========================================= */

.orders {
    --pine-900: #11312B;
    --pine-700: #1a473e;
    --pine-600: #24574b;

    --gold: #E5AC31;
    --gold-hover: #d69a20;

    --ink: #26332f;
    --ink-soft: #718079;

    --surface: #f5f7f6;
    --white: #ffffff;

    --line: #e2e8e4;
    --line-dark: #d2dbd5;

    --success-bg: #eaf6ed;
    --success-text: #25683a;

    --error-bg: #fbebe8;
    --error-text: #c8402a;

    display: flex;
    min-height: 100vh;
    background: var(--surface);
    color: var(--ink);

    font-family:
        'Inter',
        system-ui,
        -apple-system,
        'Segoe UI',
        sans-serif;
}

.orders *,
.orders *::before,
.orders *::after {
    box-sizing: border-box;
}

.orders button,
.orders input,
.orders select {
    font: inherit;
}

.orders button {
    -webkit-tap-highlight-color: transparent;
}

.orders button:focus-visible,
.orders a:focus-visible,
.orders input:focus-visible,
.orders select:focus-visible {
    outline: 3px solid rgba(229, 172, 49, 0.55);
    outline-offset: 3px;
}

.orders button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

/* =========================================
   MENÚ LATERAL
========================================= */

.sidebar {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    width: 255px;
    min-width: 255px;

    background: var(--pine-900);
    color: var(--white);
}

.sidebar__brand {
    padding: 30px 24px 25px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.09);
}

.sidebar__title {
    margin: 0;
    font-size: 25px;
    font-weight: 800;
    letter-spacing: -0.7px;
}

.sidebar__subtitle {
    margin: 7px 0 0;
    color: #b7c8c1;
    font-size: 11px;
}

.sidebar__nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 24px 14px;
}

.sidebar__link {
    display: flex;
    align-items: center;
    gap: 13px;

    padding: 13px 15px;
    border-radius: 9px;

    color: #d3e0da;
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;

    transition:
        background 0.2s,
        color 0.2s;
}

.sidebar__link:hover {
    background: var(--pine-700);
    color: var(--white);
}

.sidebar__link--active {
    background: var(--gold);
    color: var(--pine-900);
    font-weight: 800;
}

.sidebar__link--active:hover {
    background: var(--gold-hover);
    color: var(--pine-900);
}

.sidebar__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    font-size: 18px;
}

.sidebar__footer {
    padding: 20px 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.sidebar__user {
    display: flex;
    align-items: center;
    gap: 11px;
    margin-bottom: 18px;
}

.sidebar__avatar {
    display: grid;
    place-items: center;

    width: 38px;
    height: 38px;

    border-radius: 50%;
    background: var(--gold);
    color: var(--pine-900);

    font-size: 12px;
    font-weight: 800;
}

.sidebar__user-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.sidebar__user-info strong {
    font-size: 12px;
}

.sidebar__user-info span {
    color: #b7c8c1;
    font-size: 10px;
}

.sidebar__logout {
    display: flex;
    align-items: center;
    gap: 10px;

    width: 100%;
    padding: 11px 12px;

    color: #e1e9e5;
    background: transparent;

    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;

    font-size: 12px;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s;
}

.sidebar__logout:hover {
    background: var(--pine-700);
}

/* =========================================
   CONTENIDO PRINCIPAL
========================================= */

.orders__main {
    display: flex;
    flex: 1;
    flex-direction: column;

    min-width: 0;
}

.topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    min-height: 76px;
    padding: 15px 35px;

    background: var(--white);
    border-bottom: 1px solid var(--line);
}

.topbar__breadcrumb {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;

    color: var(--ink-soft);
    font-size: 12px;
}

.topbar__separator {
    color: #c4cec8;
}

.topbar__breadcrumb strong {
    color: var(--pine-900);
}

.topbar__profile {
    display: flex;
    align-items: center;
    gap: 10px;
}

.topbar__profile-avatar {
    display: grid;
    place-items: center;

    width: 38px;
    height: 38px;

    border-radius: 50%;
    background: var(--pine-900);
    color: var(--white);

    font-size: 11px;
    font-weight: 800;
}

.topbar__profile-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.topbar__profile-info strong {
    color: var(--pine-900);
    font-size: 12px;
}

.topbar__profile-info span {
    color: var(--ink-soft);
    font-size: 10px;
}

.orders__content {
    width: 100%;
    max-width: 1700px;
    margin: 0 auto;
    padding: 30px 35px 40px;
}

/* =========================================
   ENCABEZADO
========================================= */

.page-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    margin-bottom: 25px;
}

.page-heading__eyebrow,
.summary__eyebrow {
    display: block;
    margin-bottom: 8px;

    color: var(--ink-soft);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.5px;
}

.page-heading__title {
    margin: 0;

    color: var(--pine-900);
    font-size: clamp(25px, 3vw, 32px);
    font-weight: 800;
    letter-spacing: -1px;
}

.page-heading__description {
    margin: 8px 0 0;
    color: var(--ink-soft);
    font-size: 12px;
    line-height: 1.6;
}

.page-heading__status {
    display: inline-flex;
    align-items: center;
    gap: 8px;

    padding: 10px 13px;

    background: var(--white);
    border: 1px solid var(--line);
    border-radius: 8px;

    color: var(--pine-900);
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--gold);
}

/* =========================================
   MENSAJES
========================================= */

.notice {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;

    margin-bottom: 20px;
    padding: 13px 16px;

    border-radius: 8px;
    font-size: 12px;
    line-height: 1.5;
}

.notice--success {
    background: var(--success-bg);
    color: var(--success-text);
    border: 1px solid #cce8d2;
}

.notice--error {
    background: var(--error-bg);
    color: var(--error-text);
    border: 1px solid #f2d0c9;
}

.notice__close {
    padding: 0 4px;
    background: transparent;
    border: none;
    font-size: 21px;
    cursor: pointer;
}

/* =========================================
   INFORMACIÓN DEL PEDIDO
========================================= */

.order-details {
    margin-bottom: 28px;
    padding: 22px;

    background: var(--white);
    border: 1px solid var(--line);
    border-radius: 12px;

    box-shadow: 0 3px 12px rgba(17, 49, 43, 0.025);
}

.section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;

    margin-bottom: 20px;
}

.section-heading h3 {
    margin: 0;
    color: var(--pine-900);
    font-size: 15px;
    font-weight: 800;
}

.section-heading p {
    margin: 6px 0 0;
    color: var(--ink-soft);
    font-size: 11px;
    line-height: 1.6;
}

.section-heading__number {
    display: grid;
    place-items: center;

    width: 33px;
    height: 33px;

    border-radius: 9px;
    background: #f8f2e3;
    color: var(--pine-900);

    font-size: 12px;
    font-weight: 800;
}

.order-details__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: end;
    gap: 15px;
}

.field {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 8px;
}

.field label {
    color: var(--ink);
    font-size: 11px;
    font-weight: 700;
}

.field__control {
    width: 100%;
    min-height: 43px;
    padding: 10px 12px;

    color: var(--ink);
    background: var(--white);

    border: 1px solid var(--line-dark);
    border-radius: 7px;

    font-size: 12px;
}

.field__control:focus {
    border-color: var(--pine-700);
    outline: none;
    box-shadow: 0 0 0 3px rgba(26, 71, 62, 0.1);
}

.button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;

    min-height: 42px;
    padding: 10px 15px;

    border-radius: 8px;
    font-size: 11px;
    font-weight: 800;

    cursor: pointer;
    transition:
        background 0.2s,
        border-color 0.2s,
        transform 0.1s;
}

.button:active:not(:disabled) {
    transform: translateY(1px);
}

.button--outline {
    color: var(--pine-900);
    background: var(--white);
    border: 1px solid var(--gold);
    white-space: nowrap;
}

.button--outline:hover:not(:disabled) {
    background: #fff8e8;
}

/* =========================================
   CATÁLOGO Y RESUMEN
========================================= */

.orders__layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 345px;
    align-items: start;
    gap: 25px;
}

.catalog {
    min-width: 0;
}

.catalog>.section-heading {
    margin-bottom: 18px;
}

.catalog__count {
    padding: 7px 10px;
    border-radius: 7px;

    color: var(--pine-900);
    background: #e9efeb;

    font-size: 10px;
    font-weight: 800;
    white-space: nowrap;
}

/* =========================================
   BÚSQUEDA
========================================= */

.catalog__search {
    display: flex;
    align-items: center;
    gap: 10px;

    margin-bottom: 17px;
    padding: 0 14px;

    background: var(--white);
    border: 1px solid var(--line);
    border-radius: 8px;

    transition: border-color 0.2s;
}

.catalog__search:focus-within {
    border-color: var(--pine-700);
}

.catalog__search-icon {
    color: var(--ink-soft);
    font-size: 23px;
}

.catalog__search input {
    width: 100%;
    min-width: 0;
    min-height: 43px;

    background: transparent;
    border: none;
    outline: none;

    color: var(--ink);
    font-size: 12px;
}

.catalog__search input::placeholder {
    color: #9ba7a0;
}

/* =========================================
   CATEGORÍAS
========================================= */

.categories {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    margin-bottom: 20px;
}

.categories__button {
    padding: 9px 14px;

    background: var(--white);
    color: var(--ink-soft);

    border: 1px solid var(--line);
    border-radius: 20px;

    font-size: 10px;
    font-weight: 700;

    cursor: pointer;
    transition:
        background 0.2s,
        color 0.2s,
        border-color 0.2s;
}

.categories__button:hover:not(.categories__button--active) {
    border-color: var(--pine-700);
    color: var(--pine-900);
}

.categories__button--active {
    background: var(--pine-900);
    border-color: var(--pine-900);
    color: var(--white);
}

/* =========================================
   TARJETAS DE PRODUCTOS
========================================= */

.product-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 17px;
}

.product-card {
    overflow: hidden;
    min-width: 0;

    background: var(--white);
    border: 1px solid var(--line);
    border-radius: 11px;

    transition:
        transform 0.2s,
        box-shadow 0.2s;
}

.product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(17, 49, 43, 0.07);
}

.product-card__image {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 12px;

    min-height: 135px;
    padding: 15px;
}

.product-card__image--green {
    background: #e9f0e9;
}

.product-card__image--gold {
    background: #fbf1d9;
}

.product-card__image--orange {
    background: #f9e9da;
}

.product-card__image--red {
    background: #f5e6e1;
}

.product-card__emoji {
    font-size: 43px;
    line-height: 1.2;
}

.product-card__category {
    padding: 5px 9px;

    border-radius: 15px;
    background: rgba(255, 255, 255, 0.8);

    color: var(--pine-900);
    font-size: 9px;
    font-weight: 800;
}

.product-card__body {
    padding: 15px;
}

.product-card__info h4 {
    margin: 0;

    color: var(--pine-900);
    font-size: 12px;
    font-weight: 800;
    line-height: 1.5;
}

.product-card__info p {
    min-height: 32px;
    margin: 6px 0 0;

    color: var(--ink-soft);
    font-size: 10px;
    line-height: 1.6;
}

.product-card__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    margin-top: 15px;
    padding-top: 13px;

    border-top: 1px solid #edf0ed;
}

.product-card__price {
    color: var(--pine-900);
    font-size: 16px;
    font-weight: 800;
}

.product-card__add {
    display: grid;
    place-items: center;

    width: 35px;
    height: 35px;

    border: none;
    border-radius: 8px;

    background: var(--gold);
    color: var(--pine-900);

    font-size: 22px;
    font-weight: 600;

    cursor: pointer;
    transition: background 0.2s;
}

.product-card__add:hover {
    background: var(--gold-hover);
}

/* =========================================
   ESTADOS VACÍOS
========================================= */

.empty-state {
    display: flex;
    align-items: center;
    flex-direction: column;

    padding: 40px 20px;

    text-align: center;
    background: var(--white);
    border: 1px dashed var(--line-dark);
    border-radius: 10px;
}

.empty-state__icon {
    color: var(--gold-hover);
    font-size: 36px;
}

.empty-state h4 {
    margin: 12px 0 5px;
    color: var(--pine-900);
    font-size: 14px;
}

.empty-state p {
    max-width: 290px;
    margin: 0 0 17px;

    color: var(--ink-soft);
    font-size: 11px;
    line-height: 1.7;
}

/* =========================================
   RESUMEN DEL PEDIDO
========================================= */

.summary {
    min-width: 0;
    padding: 22px;

    background: var(--white);
    border: 1px solid var(--line);
    border-radius: 12px;

    box-shadow: 0 4px 15px rgba(17, 49, 43, 0.035);
}

.summary__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    padding-bottom: 18px;
    border-bottom: 1px solid var(--line);
}

.summary__eyebrow {
    margin-bottom: 7px;
    font-size: 9px;
}

.summary__header h3 {
    margin: 0;

    color: var(--pine-900);
    font-size: 16px;
    font-weight: 800;
}

.summary__icon {
    display: grid;
    place-items: center;

    width: 38px;
    height: 38px;

    border-radius: 9px;
    background: #f8f2e3;

    color: var(--pine-900);
    font-size: 19px;
}

.summary__count {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    margin: 17px 0;
    padding: 11px 12px;

    background: var(--surface);
    border-radius: 7px;

    color: var(--ink-soft);
    font-size: 10px;
}

.summary__count strong {
    color: var(--pine-900);
    font-size: 13px;
}

/* =========================================
   PRODUCTOS AGREGADOS
========================================= */

.summary__items {
    display: flex;
    flex-direction: column;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    gap: 10px;

    padding: 16px 0;
    border-bottom: 1px solid #edf0ed;
}

.summary-item__info {
    flex: 1;
    min-width: 0;
}

.summary-item__info h4 {
    margin: 0;

    color: var(--pine-900);
    font-size: 11px;
    font-weight: 800;
    line-height: 1.6;
    overflow-wrap: anywhere;
}

.summary-item__info>span {
    display: block;
    margin-top: 4px;

    color: var(--ink-soft);
    font-size: 10px;
}

.summary-item__right {
    display: flex;
    align-items: flex-end;
    flex-direction: column;
    justify-content: space-between;
    gap: 12px;
}

.summary-item__right strong {
    color: var(--pine-900);
    font-size: 12px;
    white-space: nowrap;
}

.summary-item__remove {
    display: grid;
    place-items: center;

    width: 25px;
    height: 25px;

    background: transparent;
    border: 1px solid var(--line);
    border-radius: 6px;

    color: var(--ink-soft);
    font-size: 18px;
    cursor: pointer;
}

.summary-item__remove:hover {
    color: var(--error-text);
    background: var(--error-bg);
    border-color: #f2d0c9;
}

/* =========================================
   CONTROL DE CANTIDADES
========================================= */

.quantity {
    display: inline-flex;
    align-items: center;
    gap: 12px;

    margin-top: 11px;
    padding: 4px;

    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 7px;
}

.quantity button {
    display: grid;
    place-items: center;

    width: 23px;
    height: 23px;

    border: none;
    border-radius: 5px;

    background: var(--white);
    color: var(--pine-900);

    font-size: 16px;
    cursor: pointer;
}

.quantity button:hover:not(:disabled) {
    background: #f8f0dc;
}

.quantity span {
    min-width: 10px;
    color: var(--pine-900);
    font-size: 11px;
    font-weight: 800;
    text-align: center;
}

/* =========================================
   RESUMEN VACÍO
========================================= */

.summary__empty {
    padding: 25px 5px;
    text-align: center;
}

.summary__empty>span {
    color: #c7d1cb;
    font-size: 33px;
}

.summary__empty h4 {
    margin: 10px 0 6px;
    color: var(--pine-900);
    font-size: 12px;
}

.summary__empty p {
    margin: 0;
    color: var(--ink-soft);
    font-size: 10px;
    line-height: 1.7;
}

/* =========================================
   TOTALES
========================================= */

.summary__totals {
    margin-top: 20px;
    padding-top: 15px;

    border-top: 1px solid var(--line);
}

.summary__total-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    margin-bottom: 12px;

    color: var(--ink-soft);
    font-size: 11px;
}

.summary__total-row span:last-child {
    color: var(--ink);
    font-weight: 700;
}

.summary__grand-total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    margin-top: 18px;
    padding-top: 17px;

    border-top: 1px dashed var(--line-dark);
}

.summary__grand-total>span {
    color: var(--pine-900);
    font-size: 13px;
    font-weight: 800;
}

.summary__grand-total strong {
    color: var(--pine-900);
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.7px;
}

/* =========================================
   BOTONES DE ACCIÓN
========================================= */

.summary__actions {
    display: flex;
    flex-direction: column;
    gap: 10px;

    margin-top: 23px;
}

.button--primary {
    justify-content: space-between;

    width: 100%;
    min-height: 48px;
    padding: 12px 15px;

    background: var(--gold);
    border: 1px solid var(--gold);
    color: var(--pine-900);

    font-size: 12px;
}

.button--primary:hover:not(:disabled) {
    background: var(--gold-hover);
    border-color: var(--gold-hover);
}

.button--primary span {
    font-size: 17px;
}

.button--cancel {
    width: 100%;
    min-height: 43px;

    background: var(--white);
    border: 1px solid var(--line-dark);
    color: var(--ink-soft);
}

.button--cancel:hover:not(:disabled) {
    background: var(--surface);
    color: var(--pine-900);
}

.summary__footnote {
    margin: 15px 0 0;

    color: #87948d;
    font-size: 9px;
    line-height: 1.7;
    text-align: center;
}

/* =========================================
   TABLETAS
========================================= */

@media (max-width: 1150px) {
    .sidebar {
        width: 220px;
        min-width: 220px;
    }

    .orders__content {
        padding: 25px 22px 35px;
    }

    .topbar {
        padding-right: 22px;
        padding-left: 22px;
    }

    .orders__layout {
        grid-template-columns: minmax(0, 1fr) 310px;
        gap: 18px;
    }

    .product-grid {
        gap: 12px;
    }

    .product-card__body {
        padding: 12px;
    }

    .summary {
        padding: 17px;
    }
}

/* =========================================
   TABLETAS PEQUEÑAS
========================================= */

@media (max-width: 900px) {
    .orders {
        flex-direction: column;
    }

    .sidebar {
        width: 100%;
        min-width: 0;
    }

    .sidebar__brand {
        padding: 18px 22px;
    }

    .sidebar__title {
        font-size: 23px;
    }

    .sidebar__subtitle {
        margin-top: 4px;
    }

    .sidebar__nav {
        flex-direction: row;
        flex-wrap: wrap;
        gap: 6px;

        padding: 12px 16px;
    }

    .sidebar__link {
        padding: 10px 12px;
        font-size: 11px;
    }

    .sidebar__icon {
        width: auto;
    }

    .sidebar__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;

        padding: 12px 20px;
    }

    .sidebar__user {
        margin: 0;
    }

    .sidebar__logout {
        width: auto;
    }

    .orders__layout {
        grid-template-columns: minmax(0, 1fr);
    }

    .summary {
        width: 100%;
    }

    .summary__items {
        max-height: 350px;
        overflow-y: auto;
    }

    .product-card__image {
        min-height: 125px;
    }
}

/* =========================================
   MÓVILES
========================================= */

@media (max-width: 560px) {
    .sidebar__brand {
        padding: 16px;
    }

    .sidebar__nav {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        padding: 10px 12px;
    }

    .sidebar__link {
        justify-content: flex-start;
        padding: 11px 9px;
        font-size: 10px;
    }

    .sidebar__footer {
        padding: 12px;
    }

    .sidebar__user-info span {
        display: none;
    }

    .sidebar__logout {
        padding: 10px;
        font-size: 10px;
    }

    .topbar {
        min-height: 65px;
        padding: 12px 16px;
    }

    .topbar__breadcrumb {
        gap: 6px;
        font-size: 10px;
    }

    .topbar__profile {
        gap: 7px;
    }

    .topbar__profile-avatar {
        width: 32px;
        height: 32px;
    }

    .topbar__profile-info {
        display: none;
    }

    .orders__content {
        padding: 22px 14px 30px;
    }

    .page-heading {
        align-items: flex-start;
        flex-direction: column;
        gap: 12px;
    }

    .page-heading__title {
        font-size: 27px;
    }

    .page-heading__description {
        max-width: 320px;
    }

    .order-details {
        padding: 16px;
    }

    .order-details__grid {
        grid-template-columns: minmax(0, 1fr);
        gap: 14px;
    }

    .field--button .button {
        width: 100%;
    }

    .field--button label {
        display: none;
    }

    .product-grid {
        grid-template-columns: minmax(0, 1fr);
    }

    .product-card {
        display: grid;
        grid-template-columns: 105px minmax(0, 1fr);
    }

    .product-card__image {
        min-height: 100%;
        padding: 10px;
        gap: 8px;
    }

    .product-card__emoji {
        font-size: 35px;
    }

    .product-card__category {
        font-size: 8px;
        text-align: center;
    }

    .product-card__body {
        padding: 13px;
    }

    .product-card__info p {
        min-height: auto;
    }

    .product-card__footer {
        margin-top: 12px;
        padding-top: 10px;
    }

    .product-card__price {
        font-size: 14px;
    }

    .product-card__add {
        width: 32px;
        height: 32px;
    }

    .summary {
        padding: 17px;
    }

    .summary__grand-total strong {
        font-size: 22px;
    }
}
</style>