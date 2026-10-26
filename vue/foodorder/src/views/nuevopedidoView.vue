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

.orders .page-heading {
    margin-bottom: 24px;
}

.orders .page-heading__eyebrow,
.orders .summary__eyebrow {
    display: block;
    margin-bottom: 7px;
    color: var(--muted);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.3px;
}

.orders .page-heading__title {
    margin: 0;
    color: var(--pine);
    font-size: clamp(25px, 3vw, 32px);
    font-weight: 800;
    letter-spacing: -.7px;
}

.orders .page-heading__description {
    margin: 8px 0 0;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.6;
}

.orders .page-heading__status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: var(--white);
    border: 1px solid var(--line);
    border-radius: 8px;
    color: var(--pine);
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
}

.orders .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--gold);
}

.orders .notice {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
    padding: 12px 15px;
    border-radius: 8px;
    font-size: 12px;
    line-height: 1.5;
}

.orders .notice--success {
    background: var(--success-bg);
    color: var(--success);
    border: 1px solid #cce8d2;
}

.orders .notice--error {
    background: var(--error-bg);
    color: var(--error);
    border: 1px solid #f2d0c9;
}

.orders .notice__close {
    padding: 0 4px;
    background: transparent;
    border: 0;
    font-size: 21px;
}

/* Formulario del pedido */
.orders .order-details,
.orders .summary {
    min-width: 0;
    padding: 21px;
    background: var(--white);
    border: 1px solid var(--line);
    border-radius: 12px;
    box-shadow: 0 3px 12px #11312b08;
}

.orders .order-details {
    margin-bottom: 26px;
}

.orders .section-heading {
    margin-bottom: 18px;
}

.orders .section-heading h3,
.orders .summary__header h3 {
    margin: 0;
    color: var(--pine);
    font-size: 15px;
    font-weight: 800;
}

.orders .section-heading p {
    margin: 6px 0 0;
    color: var(--muted);
    font-size: 11px;
    line-height: 1.6;
}

.orders .section-heading__number,
.orders .summary__icon {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: #f8f2e3;
    color: var(--pine);
    font-weight: 800;
}

.orders .order-details__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: end;
    gap: 14px;
}

.orders .field {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 8px;
}

.orders .field label {
    color: var(--ink);
    font-size: 11px;
    font-weight: 700;
}

.orders .field__control {
    width: 100%;
    min-height: 43px;
    padding: 10px 12px;
    color: var(--ink);
    background: var(--white);
    border: 1px solid var(--line-dark);
    border-radius: 7px;
    font-size: 12px;
}

.orders .field__control:focus {
    border-color: var(--pine-light);
    outline: none;
    box-shadow: 0 0 0 3px #1a473e1a;
}

.orders .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 42px;
    padding: 10px 15px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 800;
    transition: background .2s, transform .1s;
}

.orders .button:active:not(:disabled) {
    transform: translateY(1px);
}

.orders .button--outline {
    color: var(--pine);
    background: var(--white);
    border: 1px solid var(--gold);
    white-space: nowrap;
}

.orders .button--outline:hover:not(:disabled) {
    background: #fff8e8;
}

/* Catálogo y productos */
.orders .orders__layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 345px;
    align-items: start;
    gap: 22px;
}

.orders .catalog {
    min-width: 0;
}

.orders .catalog>.section-heading {
    margin-bottom: 16px;
}

.orders .catalog__count {
    padding: 7px 10px;
    border-radius: 7px;
    color: var(--pine);
    background: #e9efeb;
    font-size: 10px;
    font-weight: 800;
    white-space: nowrap;
}

.orders .catalog__search {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    padding: 0 13px;
    background: var(--white);
    border: 1px solid var(--line);
    border-radius: 8px;
}

.orders .catalog__search:focus-within {
    border-color: var(--pine-light);
}

.orders .catalog__search-icon {
    color: var(--muted);
    font-size: 22px;
}

.orders .catalog__search input {
    width: 100%;
    min-width: 0;
    min-height: 43px;
    background: transparent;
    border: 0;
    outline: 0;
    color: var(--ink);
    font-size: 12px;
}

.orders .catalog__search input::placeholder {
    color: #9ba7a0;
}

.orders .categories {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 18px;
}

.orders .categories__button {
    padding: 9px 13px;
    background: var(--white);
    color: var(--muted);
    border: 1px solid var(--line);
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
}

.orders .categories__button:hover:not(.categories__button--active) {
    border-color: var(--pine-light);
    color: var(--pine);
}

.orders .categories__button--active {
    background: var(--pine);
    border-color: var(--pine);
    color: var(--white);
}

.orders .product-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 15px;
}

.orders .product-card {
    overflow: hidden;
    min-width: 0;
    background: var(--white);
    border: 1px solid var(--line);
    border-radius: 11px;
    transition: transform .2s, box-shadow .2s;
}

.orders .product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px #11312b12;
}

.orders .product-card__image {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 10px;
    min-height: 130px;
    padding: 14px;
}

.orders .product-card__image--green {
    background: #e9f0e9;
}

.orders .product-card__image--gold {
    background: #fbf1d9;
}

.orders .product-card__image--orange {
    background: #f9e9da;
}

.orders .product-card__image--red {
    background: #f5e6e1;
}

.orders .product-card__emoji {
    font-size: 40px;
    line-height: 1.2;
}

.orders .product-card__category {
    padding: 5px 9px;
    border-radius: 15px;
    background: #ffffffcc;
    color: var(--pine);
    font-size: 9px;
    font-weight: 800;
}

.orders .product-card__body {
    padding: 14px;
}

.orders .product-card__info h4 {
    margin: 0;
    color: var(--pine);
    font-size: 12px;
    font-weight: 800;
    line-height: 1.5;
}

.orders .product-card__info p {
    min-height: 32px;
    margin: 6px 0 0;
    color: var(--muted);
    font-size: 10px;
    line-height: 1.6;
}

.orders .product-card__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid #edf0ed;
}

.orders .product-card__price {
    color: var(--pine);
    font-size: 16px;
    font-weight: 800;
}

.orders .product-card__add {
    display: grid;
    place-items: center;
    width: 35px;
    height: 35px;
    border: 0;
    border-radius: 8px;
    background: var(--gold);
    color: var(--pine);
    font-size: 22px;
}

.orders .product-card__add:hover {
    background: var(--gold-hover);
}

/* Estados vacíos */
.orders .empty-state {
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 35px 18px;
    text-align: center;
    background: var(--white);
    border: 1px dashed var(--line-dark);
    border-radius: 10px;
}

.orders .empty-state__icon {
    color: var(--gold-hover);
    font-size: 34px;
}

.orders .empty-state h4 {
    margin: 12px 0 5px;
    color: var(--pine);
    font-size: 14px;
}

.orders .empty-state p {
    max-width: 290px;
    margin: 0 0 15px;
    color: var(--muted);
    font-size: 11px;
    line-height: 1.7;
}

/* Resumen del pedido */
.orders .summary {
    box-shadow: 0 4px 15px #11312b09;
}

.orders .summary__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding-bottom: 17px;
    border-bottom: 1px solid var(--line);
}

.orders .summary__eyebrow {
    margin-bottom: 6px;
    font-size: 9px;
}

.orders .summary__header h3 {
    font-size: 16px;
}

.orders .summary__icon {
    width: 38px;
    height: 38px;
    font-size: 19px;
}

.orders .summary__count {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin: 16px 0;
    padding: 11px 12px;
    background: var(--surface);
    border-radius: 7px;
    color: var(--muted);
    font-size: 10px;
}

.orders .summary__count strong {
    color: var(--pine);
    font-size: 13px;
}

.orders .summary__items {
    display: flex;
    flex-direction: column;
}

.orders .summary-item {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    padding: 14px 0;
    border-bottom: 1px solid #edf0ed;
}

.orders .summary-item__info {
    flex: 1;
    min-width: 0;
}

.orders .summary-item__info h4 {
    margin: 0;
    color: var(--pine);
    font-size: 11px;
    font-weight: 800;
    line-height: 1.6;
    overflow-wrap: anywhere;
}

.orders .summary-item__info>span {
    display: block;
    margin-top: 4px;
    color: var(--muted);
    font-size: 10px;
}

.orders .summary-item__right {
    display: flex;
    align-items: flex-end;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
}

.orders .summary-item__right strong {
    color: var(--pine);
    font-size: 12px;
    white-space: nowrap;
}

.orders .summary-item__remove {
    display: grid;
    place-items: center;
    width: 25px;
    height: 25px;
    background: transparent;
    border: 1px solid var(--line);
    border-radius: 6px;
    color: var(--muted);
    font-size: 18px;
}

.orders .summary-item__remove:hover {
    color: var(--error);
    background: var(--error-bg);
    border-color: #f2d0c9;
}

.orders .quantity {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    margin-top: 10px;
    padding: 4px;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 7px;
}

.orders .quantity button {
    display: grid;
    place-items: center;
    width: 23px;
    height: 23px;
    border: 0;
    border-radius: 5px;
    background: var(--white);
    color: var(--pine);
    font-size: 16px;
}

.orders .quantity button:hover:not(:disabled) {
    background: #f8f0dc;
}

.orders .quantity span {
    min-width: 10px;
    color: var(--pine);
    font-size: 11px;
    font-weight: 800;
    text-align: center;
}

.orders .summary__empty {
    padding: 24px 5px;
    text-align: center;
}

.orders .summary__empty>span {
    color: #c7d1cb;
    font-size: 32px;
}

.orders .summary__empty h4 {
    margin: 10px 0 6px;
    color: var(--pine);
    font-size: 12px;
}

.orders .summary__empty p {
    margin: 0;
    color: var(--muted);
    font-size: 10px;
    line-height: 1.7;
}

.orders .summary__totals {
    margin-top: 19px;
    padding-top: 15px;
    border-top: 1px solid var(--line);
}

.orders .summary__total-row,
.orders .summary__grand-total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.orders .summary__total-row {
    margin-bottom: 11px;
    color: var(--muted);
    font-size: 11px;
}

.orders .summary__total-row span:last-child {
    color: var(--ink);
    font-weight: 700;
}

.orders .summary__grand-total {
    margin-top: 17px;
    padding-top: 16px;
    border-top: 1px dashed var(--line-dark);
}

.orders .summary__grand-total>span {
    color: var(--pine);
    font-size: 13px;
    font-weight: 800;
}

.orders .summary__grand-total strong {
    color: var(--pine);
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -.5px;
}

.orders .summary__actions {
    display: flex;
    flex-direction: column;
    gap: 9px;
    margin-top: 22px;
}

.orders .button--primary {
    justify-content: space-between;
    width: 100%;
    min-height: 47px;
    padding: 12px 15px;
    background: var(--gold);
    border: 1px solid var(--gold);
    color: var(--pine);
    font-size: 12px;
}

.orders .button--primary:hover:not(:disabled) {
    background: var(--gold-hover);
    border-color: var(--gold-hover);
}

.orders .button--primary span {
    font-size: 17px;
}

.orders .button--cancel {
    width: 100%;
    min-height: 42px;
    background: var(--white);
    border: 1px solid var(--line-dark);
    color: var(--muted);
}

.orders .button--cancel:hover:not(:disabled) {
    background: var(--surface);
    color: var(--pine);
}

.orders .summary__footnote {
    margin: 14px 0 0;
    color: #87948d;
    font-size: 9px;
    line-height: 1.7;
    text-align: center;
}

/* Adaptación a pantallas medianas y móviles */
@media (max-width: 1150px) {
    .orders .sidebar {
        flex-basis: 220px;
        width: 220px;
        min-width: 220px;
    }

    .orders .orders__content {
        padding: 24px 20px 32px;
    }

    .orders .topbar {
        padding-inline: 20px;
    }

    .orders .orders__layout {
        grid-template-columns: minmax(0, 1fr) 310px;
        gap: 16px;
    }

    .orders .product-grid {
        gap: 11px;
    }

    .orders .product-card__body {
        padding: 11px;
    }

    .orders .summary {
        padding: 16px;
    }
}

@media (max-width: 900px) {
    .orders {
        flex-direction: column;
    }

    .orders .sidebar {
        flex: 0 0 auto;
        width: 100%;
        min-width: 0;
    }

    .orders .sidebar__brand {
        padding: 17px 20px;
    }

    .orders .sidebar__nav {
        flex-direction: row;
        flex-wrap: wrap;
        gap: 6px;
        padding: 11px 14px;
    }

    .orders .sidebar__link {
        padding: 10px 12px;
        font-size: 11px;
    }

    .orders .sidebar__icon {
        width: auto;
    }

    .orders .sidebar__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 11px 18px;
    }

    .orders .sidebar__user {
        margin: 0;
    }

    .orders .sidebar__logout {
        width: auto;
    }

    .orders .orders__layout {
        grid-template-columns: minmax(0, 1fr);
    }

    .orders .summary {
        width: 100%;
    }

    .orders .summary__items {
        max-height: 350px;
        overflow-y: auto;
    }
}

@media (max-width: 560px) {
    .orders .sidebar__nav {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        padding: 10px 12px;
    }

    .orders .sidebar__link {
        padding: 10px 9px;
        font-size: 10px;
    }

    .orders .sidebar__footer {
        padding: 11px;
    }

    .orders .sidebar__user-info span,
    .orders .topbar__profile-info {
        display: none;
    }

    .orders .sidebar__logout {
        padding: 9px;
        font-size: 10px;
    }

    .orders .topbar {
        min-height: 62px;
        padding: 11px 14px;
    }

    .orders .topbar__breadcrumb {
        gap: 6px;
        font-size: 10px;
    }

    .orders .topbar__profile {
        gap: 7px;
    }

    .orders .topbar__profile-avatar {
        width: 32px;
        height: 32px;
        flex-basis: 32px;
    }

    .orders .orders__content {
        padding: 20px 12px 28px;
    }

    .orders .page-heading {
        align-items: flex-start;
        flex-direction: column;
        gap: 11px;
    }

    .orders .page-heading__title {
        font-size: 26px;
    }

    .orders .order-details {
        padding: 15px;
    }

    .orders .order-details__grid {
        grid-template-columns: minmax(0, 1fr);
        gap: 13px;
    }

    .orders .field--button .button {
        width: 100%;
    }

    .orders .field--button label {
        display: none;
    }

    .orders .product-grid {
        grid-template-columns: minmax(0, 1fr);
    }

    .orders .product-card {
        display: grid;
        grid-template-columns: 100px minmax(0, 1fr);
    }

    .orders .product-card__image {
        min-height: 100%;
        padding: 9px;
        gap: 7px;
    }

    .orders .product-card__emoji {
        font-size: 33px;
    }

    .orders .product-card__category {
        font-size: 8px;
        text-align: center;
    }

    .orders .product-card__body {
        padding: 12px;
    }

    .orders .product-card__info p {
        min-height: auto;
    }

    .orders .product-card__footer {
        margin-top: 10px;
        padding-top: 9px;
    }

    .orders .product-card__price {
        font-size: 14px;
    }

    .orders .product-card__add {
        width: 31px;
        height: 31px;
    }

    .orders .summary {
        padding: 15px;
    }

    .orders .summary__grand-total strong {
        font-size: 21px;
    }
}
</style>
