<template>
    <AppLayout :crumbs="['Administración', 'Reportes']">
        <div class="fo-toolbar">
            <div class="fo-heading">
                <h1 class="fo-title">Reportes y métricas</h1>
                <p class="fo-subtitle">Resumen de ventas calculado a partir de los pedidos (sin contar cancelados)</p>
            </div>

            <select v-model="periodo" class="fo-select" aria-label="Periodo">
                <option value="hoy">Hoy</option>
                <option value="7">Últimos 7 días</option>
                <option value="30">Últimos 30 días</option>
                <option value="todo">Todo el historial</option>
            </select>
            <button type="button" class="fo-btn" :disabled="loading" @click="cargar">
                {{ loading ? 'Actualizando…' : 'Actualizar' }}
            </button>
        </div>

        <p v-if="error" class="fo-alert fo-alert--error" role="alert">
            <span>{{ error }}</span>
            <button type="button" aria-label="Cerrar" @click="error = ''">×</button>
        </p>

        <section class="fo-stats" aria-label="Resumen">
            <article class="fo-stat">
                <strong class="fo-stat__value">{{ formatMoney(ventas) }}</strong>
                <span class="fo-stat__label">Ventas</span>
            </article>
            <article class="fo-stat">
                <strong class="fo-stat__value">{{ validos.length }}</strong>
                <span class="fo-stat__label">Pedidos</span>
            </article>
            <article class="fo-stat">
                <strong class="fo-stat__value">{{ formatMoney(ticketPromedio) }}</strong>
                <span class="fo-stat__label">Ticket promedio</span>
            </article>
            <article class="fo-stat">
                <strong class="fo-stat__value">{{ cancelados }}</strong>
                <span class="fo-stat__label">Cancelados</span>
            </article>
        </section>

        <div class="rep__grid">
            <!-- Ventas por día -->
            <section class="fo-card">
                <h2 class="fo-section-title">Ventas de los últimos 7 días</h2>
                <div class="rep__chart" role="img" aria-label="Gráfica de ventas por día">
                    <div v-for="d in ultimosDias" :key="d.key" class="rep__bar-col">
                        <span class="rep__bar-value">{{ d.total ? formatMoney(d.total) : '' }}</span>
                        <div class="rep__bar" :style="{ height: altura(d.total) + '%' }"></div>
                        <span class="rep__bar-label">{{ d.label }}</span>
                    </div>
                </div>
            </section>

            <!-- Pedidos por estado -->
            <section class="fo-card">
                <h2 class="fo-section-title">Pedidos por estado</h2>
                <ul class="rep__list">
                    <li v-for="e in porEstado" :key="e.estado">
                        <span class="fo-badge" :class="'fo-badge--' + e.estado">{{ e.label }}</span>
                        <div class="rep__track"><div class="rep__fill" :style="{ width: e.pct + '%' }"></div></div>
                        <strong>{{ e.cantidad }}</strong>
                    </li>
                </ul>
            </section>
        </div>

        <div class="rep__grid">
            <!-- Top productos -->
            <section>
                <h2 class="fo-section-title">Productos más vendidos</h2>
                <div class="fo-table-wrap">
                    <table class="fo-table">
                        <thead>
                            <tr><th>Producto</th><th class="fo-table__num">Unidades</th><th class="fo-table__num">Ingresos</th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="p in topProductos" :key="p.nombre">
                                <td>{{ p.nombre }}</td>
                                <td class="fo-table__num">{{ p.unidades }}</td>
                                <td class="fo-table__num">{{ formatMoney(p.ingresos) }}</td>
                            </tr>
                            <tr v-if="!topProductos.length">
                                <td colspan="3" class="fo-empty">{{ loading ? 'Cargando…' : 'Sin ventas en este periodo.' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Ventas por mesero -->
            <section>
                <h2 class="fo-section-title">Ventas por empleado</h2>
                <div class="fo-table-wrap">
                    <table class="fo-table">
                        <thead>
                            <tr><th>Empleado</th><th class="fo-table__num">Pedidos</th><th class="fo-table__num">Ventas</th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="u in porEmpleado" :key="u.nombre">
                                <td>{{ u.nombre }}</td>
                                <td class="fo-table__num">{{ u.pedidos }}</td>
                                <td class="fo-table__num">{{ formatMoney(u.ventas) }}</td>
                            </tr>
                            <tr v-if="!porEmpleado.length">
                                <td colspan="3" class="fo-empty">{{ loading ? 'Cargando…' : 'Sin ventas en este periodo.' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </AppLayout>
</template>

<script>
import api from '@/services/api'
import AppLayout from '@/components/AppLayout.vue'
import { errorMessage, formatMoney, isSameDay, ESTADOS_PEDIDO } from '@/services/utils'

const DIA_MS = 24 * 60 * 60 * 1000

export default {
    name: 'ReportesView',

    components: { AppLayout },

    data() {
        return {
            pedidos: [],
            periodo: '7',
            loading: true,
            error: ''
        }
    },

    computed: {
        fechaDe() {
            return (p) => new Date(p.fecha_pedido || p.created_at)
        },

        // Pedidos dentro del periodo elegido
        enPeriodo() {
            const ahora = new Date()
            return this.pedidos.filter((p) => {
                const f = this.fechaDe(p)
                if (this.periodo === 'todo') return true
                if (this.periodo === 'hoy') return isSameDay(f, ahora)
                return ahora - f <= Number(this.periodo) * DIA_MS
            })
        },

        validos() {
            return this.enPeriodo.filter((p) => p.estado !== 'cancelado')
        },

        cancelados() {
            return this.enPeriodo.length - this.validos.length
        },

        ventas() {
            return this.validos.reduce((sum, p) => sum + Number(p.precio_total), 0)
        },

        ticketPromedio() {
            return this.validos.length ? this.ventas / this.validos.length : 0
        },

        // Gráfica: siempre los últimos 7 días, de más antiguo a hoy
        ultimosDias() {
            const dias = []
            for (let i = 6; i >= 0; i--) {
                const d = new Date()
                d.setHours(0, 0, 0, 0)
                d.setDate(d.getDate() - i)
                const total = this.pedidos
                    .filter((p) => p.estado !== 'cancelado' && isSameDay(this.fechaDe(p), d))
                    .reduce((sum, p) => sum + Number(p.precio_total), 0)
                dias.push({
                    key: d.toISOString(),
                    label: d.toLocaleDateString('es', { weekday: 'short', day: 'numeric' }),
                    total
                })
            }
            return dias
        },

        maxDia() {
            return Math.max(...this.ultimosDias.map((d) => d.total), 0)
        },

        porEstado() {
            const max = Math.max(...Object.keys(ESTADOS_PEDIDO).map((e) => this.contar(e)), 1)
            return Object.entries(ESTADOS_PEDIDO).map(([estado, label]) => {
                const cantidad = this.contar(estado)
                return { estado, label, cantidad, pct: (cantidad / max) * 100 }
            })
        },

        topProductos() {
            const acc = {}
            this.validos.forEach((p) => {
                ;(p.detalles || []).forEach((d) => {
                    const nombre = d.producto ? d.producto.nombre : 'Producto eliminado'
                    acc[nombre] = acc[nombre] || { nombre, unidades: 0, ingresos: 0 }
                    acc[nombre].unidades += d.cantidad
                    acc[nombre].ingresos += Number(d.subtotal)
                })
            })
            return Object.values(acc).sort((a, b) => b.unidades - a.unidades).slice(0, 5)
        },

        porEmpleado() {
            const acc = {}
            this.validos.forEach((p) => {
                const nombre = p.usuario ? p.usuario.username : 'Desconocido'
                acc[nombre] = acc[nombre] || { nombre, pedidos: 0, ventas: 0 }
                acc[nombre].pedidos += 1
                acc[nombre].ventas += Number(p.precio_total)
            })
            return Object.values(acc).sort((a, b) => b.ventas - a.ventas)
        }
    },

    created() {
        this.cargar()
    },

    methods: {
        formatMoney,

        contar(estado) {
            return this.enPeriodo.filter((p) => p.estado === estado).length
        },

        altura(total) {
            return this.maxDia ? Math.max(3, (total / this.maxDia) * 100) : 3
        },

        async cargar() {
            this.loading = true
            try {
                const { data } = await api.get('/pedidos')
                this.pedidos = data
                this.error = ''
            } catch (e) {
                this.error = errorMessage(e, 'No se pudieron cargar los datos del reporte.')
            } finally {
                this.loading = false
            }
        }
    }
}
</script>

<style scoped>
.rep__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
}

.rep__chart {
    display: flex;
    align-items: flex-end;
    gap: 0.6rem;
    height: 220px;
}

.rep__bar-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 0.3rem;
    height: 100%;
    min-width: 0;
}

.rep__bar {
    width: 100%;
    max-height: calc(100% - 2.6rem);
    background: var(--pine-700);
    border-radius: 6px 6px 0 0;
    transition: height 0.3s;
}

.rep__bar-value {
    font-size: 0.72rem;
    color: var(--ink-soft);
    white-space: nowrap;
}

.rep__bar-label {
    font-size: 0.78rem;
    color: var(--ink-soft);
    text-transform: capitalize;
}

.rep__list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin: 0;
    padding: 0;
    list-style: none;
}

.rep__list li {
    display: grid;
    grid-template-columns: 120px 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
}

.rep__list strong {
    text-align: right;
}

.rep__track {
    height: 10px;
    background: var(--surface);
    border-radius: 999px;
    overflow: hidden;
}

.rep__fill {
    height: 100%;
    background: var(--saffron);
    border-radius: 999px;
    transition: width 0.3s;
}

@media (max-width: 1000px) {
    .rep__grid {
        grid-template-columns: 1fr;
    }
}
</style>
