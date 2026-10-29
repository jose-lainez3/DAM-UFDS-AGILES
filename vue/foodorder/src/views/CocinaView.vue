<template>
    <AppLayout :crumbs="['Cocina']">
        <div class="fo-toolbar">
            <div class="fo-heading">
                <h1 class="fo-title">Cocina</h1>
                <p class="fo-subtitle">
                    Pedidos activos · se actualiza solo cada 10 s
                    <span v-if="actualizado">(última vez: {{ actualizado }})</span>
                </p>
            </div>
            <button type="button" class="fo-btn" :disabled="loading" @click="cargar()">
                {{ loading ? 'Actualizando…' : 'Actualizar ahora' }}
            </button>
        </div>

        <p v-if="error" class="fo-alert fo-alert--error" role="alert">
            <span>{{ error }}</span>
            <button type="button" aria-label="Cerrar" @click="error = ''">×</button>
        </p>

        <div class="cocina__board">
            <section v-for="col in columnas" :key="col.estado" class="cocina__col">
                <h2 class="cocina__col-title">
                    {{ col.titulo }}
                    <span class="fo-badge" :class="'fo-badge--' + col.estado">{{ pedidosDe(col.estado).length }}</span>
                </h2>

                <p v-if="!pedidosDe(col.estado).length" class="fo-card cocina__vacio">
                    {{ loading && !cargado ? 'Cargando…' : col.vacio }}
                </p>

                <article v-for="p in pedidosDe(col.estado)" :key="p.id" class="fo-card cocina__ticket"
                    :class="{ 'cocina__ticket--urgente': minutos(p) >= 20 }">
                    <header class="cocina__ticket-head">
                        <strong>#{{ p.id }} · {{ p.mesa ? 'Mesa ' + p.mesa.numero_mesa : 'Para llevar' }}</strong>
                        <span class="cocina__tiempo" :title="'Hace ' + minutos(p) + ' minutos'">⏱ {{ minutos(p) }} min</span>
                    </header>

                    <ul class="cocina__items">
                        <li v-for="d in p.detalles" :key="d.id">
                            <strong>{{ d.cantidad }}×</strong>
                            {{ d.producto ? d.producto.nombre : 'Producto eliminado' }}
                        </li>
                    </ul>

                    <footer class="cocina__ticket-foot">
                        <small>{{ p.usuario ? 'Mesero: ' + p.usuario.username : '' }}</small>
                        <button type="button" class="fo-btn fo-btn--primary fo-btn--small"
                            :disabled="actualizandoId === p.id" @click="avanzar(p, col.siguiente)">
                            {{ col.accion }}
                        </button>
                    </footer>
                </article>
            </section>
        </div>
    </AppLayout>
</template>

<script>
import api from '@/services/api'
import AppLayout from '@/components/AppLayout.vue'
import { errorMessage } from '@/services/utils'

export default {
    name: 'CocinaView',

    components: { AppLayout },

    data() {
        return {
            pedidos: [],
            loading: false,
            cargado: false,
            error: '',
            actualizado: '',
            actualizandoId: null,
            ahora: Date.now(),
            timer: null,

            columnas: [
                {
                    estado: 'pendiente',
                    titulo: 'Pendientes',
                    accion: 'Empezar a preparar',
                    siguiente: 'preparacion',
                    vacio: 'No hay pedidos pendientes. 🎉'
                },
                {
                    estado: 'preparacion',
                    titulo: 'En preparación',
                    accion: 'Listo para entregar',
                    siguiente: 'entregado',
                    vacio: 'Nada en preparación ahora mismo.'
                }
            ]
        }
    },

    created() {
        this.cargar()
        this.timer = setInterval(() => this.cargar(true), 10000)
    },

    beforeUnmount() {
        clearInterval(this.timer)
    },

    methods: {
        // Los más antiguos primero: son los que llevan más tiempo esperando
        pedidosDe(estado) {
            return this.pedidos
                .filter((p) => p.estado === estado)
                .sort((a, b) => a.id - b.id)
        },

        minutos(pedido) {
            const desde = new Date(pedido.fecha_pedido || pedido.created_at).getTime()
            return Math.max(0, Math.floor((this.ahora - desde) / 60000))
        },

        async cargar(silencioso = false) {
            if (!silencioso) this.loading = true
            try {
                const { data } = await api.get('/pedidos', { params: { estado: 'pendiente,preparacion' } })
                this.pedidos = data
                this.ahora = Date.now()
                this.actualizado = new Date().toLocaleTimeString('es')
                this.cargado = true
                this.error = ''
            } catch (e) {
                this.error = errorMessage(e, 'No se pudieron cargar los pedidos de cocina.')
            } finally {
                this.loading = false
            }
        },

        async avanzar(pedido, estado) {
            this.actualizandoId = pedido.id
            try {
                await api.put(`/pedidos/${pedido.id}`, { estado })
                await this.cargar(true)
            } catch (e) {
                this.error = errorMessage(e, 'No se pudo actualizar el pedido.')
            } finally {
                this.actualizandoId = null
            }
        }
    }
}
</script>

<style scoped>
.cocina__board {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
    align-items: start;
}

.cocina__col {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
}

.cocina__col-title {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
}

.cocina__vacio {
    margin: 0;
    text-align: center;
    color: var(--ink-soft);
}

.cocina__ticket {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    border-left: 5px solid var(--saffron);
}

.cocina__ticket--urgente {
    border-left-color: var(--chili);
}

.cocina__ticket-head,
.cocina__ticket-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
}

.cocina__tiempo {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--ink-soft);
}

.cocina__ticket--urgente .cocina__tiempo {
    color: var(--chili);
}

.cocina__items {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

@media (max-width: 900px) {
    .cocina__board {
        grid-template-columns: 1fr;
    }
}
</style>
