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
                <span v-else-if="pedido.pago?.estado === 'prueba'">Pago simulado Wompi (sin dinero real)</span>
                <span v-else-if="pedido.pago">Pendiente de confirmación Wompi</span>
                <span v-else>Sin cobro electrónico registrado (pago en local)</span>
            </section>


            <section class="fo-card detalle__impresion">
                <div class="detalle__impresion-contenido">
                    <div>
                        <h2 class="fo-section-title">Ticket del pedido</h2>
                        <p class="fo-subtitle">Comprobante interno para impresora térmica o papel. No sustituye una factura electrónica.</p>
                    </div>
                    <button type="button" class="fo-btn fo-btn--primary" @click="imprimirTicket">
                        Imprimir ticket
                    </button>
                </div>
            </section>

            <section class="fo-card detalle__facturacion">
                <h2 class="fo-section-title">Facturación electrónica (DTE)</h2>
                <p v-if="pedido.documento_fiscal">
                    Estado:
                    <strong>{{ nombreEstadoFiscal(pedido.documento_fiscal) }}</strong>
                    <span v-if="pedido.documento_fiscal.ambiente === 'SANDBOX'">
                        — Ambiente de pruebas, sin validez fiscal
                    </span>
                </p>
                <p v-else class="fo-subtitle">No se ha emitido un DTE para este pedido.</p>
                <div v-if="pedido.documento_fiscal">
                    <p v-if="pedido.documento_fiscal.codigo_generacion">Código de generación:
                        <code>{{ pedido.documento_fiscal.codigo_generacion }}</code>
                    </p>
                    <p v-if="pedido.documento_fiscal.sello_recepcion">Sello de recepción:
                        <code>{{ pedido.documento_fiscal.sello_recepcion }}</code>
                    </p>
                    <p v-if="pedido.documento_fiscal.error_resumen" class="fo-alert fo-alert--error">
                        {{ pedido.documento_fiscal.error_resumen }}
                    </p>
                    <div v-if="['emitido', 'prueba', 'borrador'].includes(pedido.documento_fiscal.estado)">
                        <button type="button" class="fo-btn" :disabled="facturando" @click="prepararArchivos">
                            {{ facturando ? 'Consultando…' : 'Preparar PDF y JSON' }}
                        </button>
                        <a v-if="archivos.pdf" :href="archivos.pdf" class="fo-btn" target="_blank" rel="noopener noreferrer">
                            Ver / imprimir factura PDF
                        </a>
                        <a v-if="archivos.json" :href="archivos.json" class="fo-btn" target="_blank" rel="noopener noreferrer">Descargar JSON</a>
                    </div>
                </div>
                <template v-if="!pedido.documento_fiscal">
                    <p v-if="!facturacionDisponible" class="fo-subtitle">
                        El emisor fiscal todavía no está configurado en Laravel.
                    </p>
                    <template v-else-if="puedeFacturar">
                        <label for="forma-dte">Medio de pago confirmado</label>
                        <select id="forma-dte" v-model="medioPagoDte" class="detalle__select">
                            <option value="01">Efectivo</option>
                            <option value="02">Tarjeta de débito</option>
                            <option value="03">Tarjeta de crédito</option>
                            <option value="05">Transferencia / depósito</option>
                            <option value="08">Dinero electrónico</option>
                            <option value="99">Otros</option>
                        </select>
                        <button type="button" class="fo-btn fo-btn--primary" :disabled="facturando"
                            @click="emitirFactura">
                            {{ facturando ? 'Consultando emisor…' : 'Solicitar factura electrónica DTE-01' }}
                        </button>
                        <p class="fo-subtitle">Comprueba el pago y el medio seleccionado.
                            La emisión real solo existe cuando Hacienda acepta el DTE en producción.</p>
                    </template>
                    <p v-else class="fo-subtitle">El DTE se podrá emitir después de confirmar el cobro.</p>
                </template>
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
import { generarHtmlTicket } from '@/utils/ticket'

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
            facturando: false,
            facturacionDisponible: false,
            medioPagoDte: '01',
            archivos: {},
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
            return this.pedido && !this.pedido.pago && !this.pedido.documento_fiscal && ['pendiente', 'preparacion'].includes(this.pedido.estado)
        },

        puedeFacturar() {
            return this.pedido
                && this.pedido.estado !== 'cancelado'
                && (this.pedido.estado === 'pagado' || this.pedido.pago?.estado === 'pagado')
                && (!this.pedido.pago || this.pedido.pago.estado === 'pagado')
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
        api.get('/configuracion').then(({ data }) => {
            this.facturacionDisponible = Boolean(data.facturacion_electronica)
        }).catch(() => { this.facturacionDisponible = false })
    },

    methods: {
        formatMoney,
        formatDateTime,

        imprimirTicket() {
            if (!this.pedido) return
            // Abrir de forma síncrona desde el clic evita bloqueos de ventanas emergentes.
            const ventana = window.open('', '_blank', 'width=450,height=760')
            if (!ventana) {
                this.error = 'El navegador bloqueó la ventana de impresión. Habilita ventanas emergentes para FoodOrder.'
                return
            }
            try {
                ventana.opener = null
                ventana.addEventListener('load', () => {
                    try {
                        ventana.focus()
                        ventana.print()
                    } catch {
                        // La ventana tiene también un botón de impresión manual.
                    }
                }, { once: true })
                ventana.document.open()
                ventana.document.write(generarHtmlTicket(this.pedido))
                ventana.document.close()
            } catch (e) {
                ventana.close()
                this.error = 'No se pudo preparar el ticket: ' + (e.message || 'error desconocido')
            }
        },

        nombreEstadoFiscal(documento) {
            const nombres = {
                emitido: 'Emitido y aceptado en producción',
                prueba: 'Procesado en ambiente de pruebas',
                borrador: 'Borrador de pruebas (no emitido)',
                rechazado: 'Rechazado',
                revision: 'Requiere conciliación',
                preparando: 'Emisión en proceso'
            }
            return nombres[documento?.estado] || documento?.estado || 'Sin DTE'
        },

        async emitirFactura() {
            if (!this.puedeFacturar || this.facturando) return
            const ambiente = 'el entorno configurado en el servidor'
            if (!window.confirm('¿Confirmas el cobro y la emisión del DTE en ' + ambiente + '? No se debe emitir dos veces la misma venta.')) return
            this.facturando = true
            this.error = ''
            try {
                const { data } = await api.post(`/pedidos/${this.id}/factura`, { medio_pago: this.medioPagoDte })
                if (data.documento?.estado === 'revision') {
                    this.error = 'La transmisión requiere conciliación con el emisor; no emitas otro documento.'
                }
                await this.cargar()
            } catch (e) {
                this.error = errorMessage(e, 'No se pudo emitir el DTE. Verifica el estado antes de repetir.')
                await this.cargar()
            } finally {
                this.facturando = false
            }
        },

        async prepararArchivos() {
            if (this.facturando) return
            this.facturando = true
            this.archivos = {}
            this.error = ''
            try {
                const [pdf, json] = await Promise.all([
                    api.get(`/pedidos/${this.id}/factura/archivo?formato=pdf`),
                    api.get(`/pedidos/${this.id}/factura/archivo?formato=json`)
                ])
                this.archivos = { pdf: pdf.data.url, json: json.data.url }
            } catch (e) {
                this.error = errorMessage(e, 'No se pudieron preparar los archivos del DTE.')
            } finally {
                this.facturando = false
            }
        },

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
.detalle__impresion { padding: 19px 22px; }
.detalle__impresion-contenido { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
.detalle__impresion-contenido .fo-section-title { margin-bottom: 6px; }
.detalle__impresion-contenido .fo-btn { flex-shrink: 0; }
.detalle__facturacion { margin: 20px 0; padding: 22px; }
.detalle__facturacion p { margin: 12px 0; overflow-wrap: anywhere; }
.detalle__facturacion code { overflow-wrap: anywhere; font-size: 0.86rem; }
.detalle__facturacion .fo-btn { margin: 8px 10px 8px 0; }
.detalle__select { display: block; max-width: 330px; margin: 10px 0; padding: 10px; border: 1px solid #d2dcd5; border-radius: 8px; background: white; color: #10372f; }


@media (max-width: 1000px) {
    .detalle__info {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
