<template>
    <AppLayout :crumbs="['Pedidos', '#' + id]">
        <div class="fo-toolbar">
            <div class="fo-heading">
                <h1 class="fo-title">Pedido #{{ id }}</h1>
                <p v-if="pedido" class="fo-subtitle">Registrado el {{ formatDateTime(pedido.fecha_pedido || pedido.created_at) }}</p>
            </div>
            <span v-if="pedido" class="fo-badge" :class="'fo-badge--' + pedido.estado">
                {{ estados[pedido.estado] || pedido.estado }}
            </span>
            <router-link to="/pedidos" class="fo-btn">← Volver a pedidos</router-link>
        </div>

        <p v-if="error" class="fo-alert fo-alert--error" role="alert">
            <span>{{ error }}</span>
            <button type="button" aria-label="Cerrar" @click="error = ''">×</button>
        </p>

        <p v-if="loading" class="fo-card">Cargando pedido…</p>

        <template v-else-if="pedido">
            <!-- Datos generales -->
            <section class="fo-stats detalle__info">
                <article class="fo-stat">
                    <strong class="fo-stat__value detalle__value">{{ clienteNombre }}</strong>
                    <span class="fo-stat__label">Cliente</span>
                </article>
                <article class="fo-stat">
                    <strong class="fo-stat__value detalle__value">{{ pedido.mesa ? 'Mesa ' + pedido.mesa.numero_mesa : 'Para llevar' }}</strong>
                    <span class="fo-stat__label">Ubicación</span>
                </article>
                <article class="fo-stat">
                    <strong class="fo-stat__value detalle__value">{{ pedido.usuario ? pedido.usuario.username : '—' }}</strong>
                    <span class="fo-stat__label">Atendido por</span>
                </article>
                <article class="fo-stat">
                    <strong class="fo-stat__value detalle__value">{{ formatMoney(pedido.precio_total) }}</strong>
                    <span class="fo-stat__label">Total</span>
                </article>
            </section>

            <section class="fo-card" aria-live="polite">
                <strong>Pago: </strong>
                <span v-if="pedido.pago?.estado === 'pagado'">Pagado mediante Wompi</span>
                <span v-else-if="pedido.pago?.estado === 'revision'">Cobro en revisión</span>
                <span v-else-if="pedido.pago">Pendiente de confirmación Wompi</span>
                <span v-else>Sin cobro electrónico registrado (pago en local)</span>
            </section>

            <!-- Productos -->
            <section>
                <h2 class="fo-section-title">Productos del pedido</h2>

                <div class="fo-table-wrap">
                    <table class="fo-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th class="fo-table__num">Cantidad</th>
                                <th class="fo-table__num">Precio unit.</th>
                                <th class="fo-table__num">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="d in pedido.detalles" :key="d.id">
                                <td>{{ d.producto ? d.producto.nombre : 'Producto eliminado' }}</td>
                                <td class="fo-table__num">{{ d.cantidad }}</td>
                                <td class="fo-table__num">{{ formatMoney(d.precio_unitario) }}</td>
                                <td class="fo-table__num">{{ formatMoney(d.subtotal) }}</td>
                            </tr>
                            <tr v-if="!pedido.detalles || !pedido.detalles.length">
                                <td colspan="4" class="fo-empty">Este pedido no tiene productos registrados.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="detalle__totales">
                    <div><span>Subtotal</span><span>{{ formatMoney(subtotal) }}</span></div>
                    <div><span>Impuestos</span><span>{{ formatMoney(impuestos) }}</span></div>
                    <div class="detalle__total"><span>Total</span><span>{{ formatMoney(pedido.precio_total) }}</span></div>
                </div>
            </section>

            <!-- Acciones según el estado -->
            <section class="fo-actions detalle__acciones">
                <button v-if="siguiente" type="button" class="fo-btn fo-btn--primary" :disabled="actualizando"
                    @click="cambiarEstado(siguiente.estado)">
                    {{ actualizando ? 'Actualizando…' : siguiente.label }}
                </button>

                <button v-if="puedeCancelar" type="button" class="fo-btn fo-btn--danger" :disabled="actualizando"
                    @click="cancelar">
                    Cancelar pedido
                </button>

                <span v-if="!siguiente && !puedeCancelar" class="fo-subtitle">
                    Este pedido está {{ pedido.estado }} y ya no admite cambios.
                </span>
            </section>
        </template>
    </AppLayout>
</template>

<script>
import api from '@/services/api'
import AppLayout from '@/components/AppLayout.vue'
import { errorMessage, formatDateTime, formatMoney, fullName, ESTADOS_PEDIDO } from '@/services/utils'

// Siguiente paso del flujo: pendiente → preparación → entregado → pagado
const SIGUIENTE = {
    pendiente: { estado: 'preparacion', label: 'Enviar a preparación' },
    preparacion: { estado: 'entregado', label: 'Marcar como entregado' },
    entregado: { estado: 'pagado', label: 'Cobrar y cerrar pedido' }
}

export default {
    name: 'PedidoDetalleView',

    components: { AppLayout },

    data() {
        return {
            pedido: null,
            loading: true,
            actualizando: false,
            error: '',
            estados: ESTADOS_PEDIDO
        }
    },

    computed: {
        id() {
            return this.$route.params.id
        },

        clienteNombre() {
            return fullName(this.pedido && this.pedido.cliente)
        },

        siguiente() {
            if (!this.pedido) return null
            if (this.pedido.estado === 'entregado' && this.pedido.pago && this.pedido.pago.estado !== 'pagado') {
                return null
            }
            return SIGUIENTE[this.pedido.estado] || null
        },

        puedeCancelar() {
            return this.pedido && !this.pedido.pago && ['pendiente', 'preparacion'].includes(this.pedido.estado)
        },

        subtotal() {
            return (this.pedido.detalles || []).reduce((sum, d) => sum + Number(d.subtotal), 0)
        },

        impuestos() {
            return Math.max(0, Number(this.pedido.precio_total) - this.subtotal)
        }
    },

    watch: {
        id() {
            this.cargar()
        }
    },

    created() {
        this.cargar()
    },

    methods: {
        formatMoney,
        formatDateTime,

        async cargar() {
            this.loading = true
            this.error = ''
            try {
                const { data } = await api.get(`/pedidos/${this.id}`)
                this.pedido = data
            } catch (e) {
                this.pedido = null
                this.error = e.response && e.response.status === 404
                    ? `El pedido #${this.id} no existe.`
                    : errorMessage(e, 'No se pudo cargar el pedido.')
            } finally {
                this.loading = false
            }
        },

        async cambiarEstado(estado) {
            this.actualizando = true
            this.error = ''
            try {
                const { data } = await api.put(`/pedidos/${this.id}`, { estado })
                this.pedido = data.data
            } catch (e) {
                this.error = errorMessage(e, 'No se pudo actualizar el estado del pedido.')
            } finally {
                this.actualizando = false
            }
        },

        cancelar() {
            if (window.confirm('¿Seguro que deseas cancelar este pedido? Se liberará la mesa.')) {
                this.cambiarEstado('cancelado')
            }
        }
    }
}
</script>

<style scoped>
.detalle__info {
    grid-template-columns: repeat(4, 1fr);
}

.detalle__value {
    font-size: 1.25rem;
    text-align: center;
    overflow-wrap: anywhere;
}

.detalle__totales {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    max-width: 320px;
    margin: 1rem 0 0 auto;
    font-size: 0.95rem;
    color: var(--ink-soft);
}

.detalle__totales > div {
    display: flex;
    justify-content: space-between;
}

.detalle__total {
    padding-top: 0.5rem;
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--pine-900);
    border-top: 1px solid var(--line);
}

.detalle__acciones {
    flex-wrap: wrap;
}

@media (max-width: 1000px) {
    .detalle__info {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
