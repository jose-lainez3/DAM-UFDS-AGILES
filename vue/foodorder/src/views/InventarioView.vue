<template>
    <AppLayout :crumbs="['Inventario']">
        <div class="fo-toolbar">
            <div class="fo-heading">
                <h1 class="fo-title">Inventario</h1>
                <p class="fo-subtitle">Controla las existencias de cada producto</p>
            </div>

            <input v-model="search" type="search" class="fo-input" placeholder="Buscar producto"
                aria-label="Buscar producto" />

            <select v-model="filtro" class="fo-select" aria-label="Filtrar por nivel de stock">
                <option value="todos">Stock: Todos</option>
                <option value="bajo">Stock bajo</option>
                <option value="agotado">Agotados</option>
            </select>

            <button type="button" class="fo-btn fo-btn--primary" :disabled="!productosSinInventario.length"
                :title="productosSinInventario.length ? '' : 'Todos los productos ya tienen inventario'"
                @click="abrirModal()">
                + Nuevo registro
            </button>
        </div>

        <p v-if="mensaje" class="fo-alert" :class="'fo-alert--' + mensajeTipo" role="status">
            <span>{{ mensaje }}</span>
            <button type="button" aria-label="Cerrar" @click="mensaje = ''">×</button>
        </p>

        <section class="fo-stats" aria-label="Resumen">
            <article class="fo-stat">
                <strong class="fo-stat__value">{{ inventarios.length }}</strong>
                <span class="fo-stat__label">Productos controlados</span>
            </article>
            <article class="fo-stat">
                <strong class="fo-stat__value">{{ bajos }}</strong>
                <span class="fo-stat__label">Stock bajo (≤ {{ umbralBajo }})</span>
            </article>
            <article class="fo-stat">
                <strong class="fo-stat__value">{{ agotados }}</strong>
                <span class="fo-stat__label">Agotados</span>
            </article>
            <article class="fo-stat">
                <strong class="fo-stat__value">{{ productosSinInventario.length }}</strong>
                <span class="fo-stat__label">Sin registro</span>
            </article>
        </section>

        <section>
            <div class="fo-table-wrap">
                <table class="fo-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Nivel</th>
                            <th>Existencias</th>
                            <th>Unidad</th>
                            <th>Actualizado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="6" class="fo-empty">Cargando inventario…</td>
                        </tr>
                        <tr v-else-if="!paginados.length">
                            <td colspan="6" class="fo-empty">No hay registros que coincidan.</td>
                        </tr>
                        <tr v-for="i in paginados" :key="i.id">
                            <td><strong>{{ i.producto ? i.producto.nombre : 'Producto eliminado' }}</strong></td>
                            <td>
                                <span class="fo-badge" :class="'fo-badge--' + nivel(i)">{{ etiquetaNivel(i) }}</span>
                            </td>
                            <td>
                                <div class="inv__stock">
                                    <button type="button" class="fo-pager__btn" :disabled="i.cantidad_stock <= 0"
                                        aria-label="Restar una unidad" @click="ajustar(i, -1)">−</button>
                                    <strong>{{ i.cantidad_stock }}</strong>
                                    <button type="button" class="fo-pager__btn" aria-label="Sumar una unidad"
                                        @click="ajustar(i, 1)">+</button>
                                </div>
                            </td>
                            <td>{{ i.unidad_medida }}</td>
                            <td>{{ formatDateTime(i.updated_at) }}</td>
                            <td>
                                <div class="fo-actions">
                                    <button type="button" class="fo-link-btn" @click="abrirModal(i)">Editar</button>
                                    <button type="button" class="fo-link-btn fo-link-btn--danger"
                                        @click="eliminar(i)">Eliminar</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="!loading && totalPaginas > 1" class="fo-pager">
                <span class="fo-pager__info">{{ textoPagina }}</span>
                <button type="button" class="fo-pager__btn" :disabled="pagina === 1" aria-label="Página anterior"
                    @click="pagina--">&lt;</button>
                <button v-for="n in totalPaginas" :key="n" type="button" class="fo-pager__btn"
                    :class="{ 'fo-pager__btn--active': n === pagina }" @click="pagina = n">{{ n }}</button>
                <button type="button" class="fo-pager__btn" :disabled="pagina === totalPaginas"
                    aria-label="Página siguiente" @click="pagina++">&gt;</button>
            </div>
        </section>

        <!-- Modal crear / editar -->
        <div v-if="modal" class="fo-modal-backdrop" @click.self="modal = false">
            <div class="fo-modal">
                <header class="fo-modal__header">
                    <h3 class="fo-modal__title">{{ form.id ? 'Editar inventario' : 'Nuevo registro de inventario' }}</h3>
                    <button type="button" class="fo-modal__close" aria-label="Cerrar"
                        @click="modal = false">&times;</button>
                </header>

                <form class="fo-modal__form" @submit.prevent="guardar">
                    <p v-if="errorModal" class="fo-alert fo-alert--error" role="alert">{{ errorModal }}</p>

                    <div class="fo-form-group">
                        <label for="inv-prod">Producto</label>
                        <select id="inv-prod" v-model="form.producto_id" required :disabled="Boolean(form.id)">
                            <option value="" disabled>Selecciona un producto</option>
                            <option v-for="p in opcionesProducto" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                        </select>
                    </div>

                    <div class="fo-form-row">
                        <div class="fo-form-group">
                            <label for="inv-cant">Existencias</label>
                            <input id="inv-cant" v-model="form.cantidad_stock" type="number" min="0" step="1" required />
                        </div>
                        <div class="fo-form-group">
                            <label for="inv-unidad">Unidad de medida</label>
                            <input id="inv-unidad" v-model="form.unidad_medida" type="text" list="inv-unidades" required
                                placeholder="unidades" />
                            <datalist id="inv-unidades">
                                <option value="unidades" />
                                <option value="libras" />
                                <option value="kg" />
                                <option value="gramos" />
                                <option value="litros" />
                                <option value="ml" />
                            </datalist>
                        </div>
                    </div>

                    <footer class="fo-modal__actions">
                        <button type="button" class="fo-btn" @click="modal = false">Cancelar</button>
                        <button type="submit" class="fo-btn fo-btn--primary" :disabled="guardando">
                            {{ guardando ? 'Guardando…' : 'Guardar' }}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    </AppLayout>
</template>

<script>
import api from '@/services/api'
import AppLayout from '@/components/AppLayout.vue'
import { errorMessage, formatDateTime } from '@/services/utils'

const UMBRAL_BAJO = 10
const FORM_VACIO = { id: null, producto_id: '', cantidad_stock: 0, unidad_medida: 'unidades' }

export default {
    name: 'InventarioView',

    components: { AppLayout },

    data() {
        return {
            inventarios: [],
            productos: [],
            loading: true,
            guardando: false,

            search: '',
            filtro: 'todos',
            pagina: 1,
            porPagina: 8,
            umbralBajo: UMBRAL_BAJO,

            mensaje: '',
            mensajeTipo: 'success',

            modal: false,
            errorModal: '',
            form: { ...FORM_VACIO }
        }
    },

    computed: {
        agotados() {
            return this.inventarios.filter((i) => i.cantidad_stock <= 0).length
        },

        bajos() {
            return this.inventarios.filter((i) => i.cantidad_stock > 0 && i.cantidad_stock <= UMBRAL_BAJO).length
        },

        productosSinInventario() {
            const conRegistro = new Set(this.inventarios.map((i) => i.producto_id))
            return this.productos.filter((p) => !conRegistro.has(p.id))
        },

        // Al crear: solo productos sin registro. Al editar: el propio producto.
        opcionesProducto() {
            return this.form.id ? this.productos : this.productosSinInventario
        },

        filtrados() {
            const term = this.search.trim().toLowerCase()
            return this.inventarios.filter((i) => {
                const nombre = i.producto ? i.producto.nombre.toLowerCase() : ''
                const okTexto = !term || nombre.includes(term)
                const nivel = this.nivel(i)
                const okNivel = this.filtro === 'todos' ||
                    (this.filtro === 'bajo' && nivel === 'bajo') ||
                    (this.filtro === 'agotado' && nivel === 'agotado')
                return okTexto && okNivel
            })
        },

        totalPaginas() {
            return Math.max(1, Math.ceil(this.filtrados.length / this.porPagina))
        },

        paginados() {
            const inicio = (this.pagina - 1) * this.porPagina
            return this.filtrados.slice(inicio, inicio + this.porPagina)
        },

        textoPagina() {
            const total = this.filtrados.length
            const inicio = (this.pagina - 1) * this.porPagina + 1
            const fin = Math.min(this.pagina * this.porPagina, total)
            return `Mostrando ${inicio}–${fin} de ${total}`
        }
    },

    watch: {
        search() { this.pagina = 1 },
        filtro() { this.pagina = 1 }
    },

    created() {
        this.cargar()
    },

    methods: {
        formatDateTime,

        avisar(texto, tipo = 'success') {
            this.mensaje = texto
            this.mensajeTipo = tipo
        },

        nivel(i) {
            if (i.cantidad_stock <= 0) return 'agotado'
            if (i.cantidad_stock <= UMBRAL_BAJO) return 'bajo'
            return 'ok'
        },

        etiquetaNivel(i) {
            return { agotado: 'Agotado', bajo: 'Stock bajo', ok: 'Normal' }[this.nivel(i)]
        },

        async cargar() {
            this.loading = true
            try {
                const [inventarios, productos] = await Promise.all([api.get('/inventarios'), api.get('/productos')])
                this.inventarios = inventarios.data
                this.productos = productos.data
            } catch (e) {
                this.avisar(errorMessage(e, 'No se pudo cargar el inventario.'), 'error')
            } finally {
                this.loading = false
            }
        },

        abrirModal(registro = null) {
            this.errorModal = ''
            this.form = registro
                ? {
                    id: registro.id,
                    producto_id: registro.producto_id,
                    cantidad_stock: registro.cantidad_stock,
                    unidad_medida: registro.unidad_medida
                }
                : { ...FORM_VACIO }
            this.modal = true
        },

        async guardar() {
            this.guardando = true
            this.errorModal = ''
            try {
                const cantidad = Number(this.form.cantidad_stock)
                if (this.form.id) {
                    await api.put(`/inventarios/${this.form.id}`, {
                        cantidad_stock: cantidad,
                        unidad_medida: this.form.unidad_medida.trim()
                    })
                } else {
                    await api.post('/inventarios', {
                        producto_id: this.form.producto_id,
                        cantidad_stock: cantidad,
                        unidad_medida: this.form.unidad_medida.trim()
                    })
                }

                const editando = Boolean(this.form.id)
                this.modal = false
                this.avisar(editando ? 'Inventario actualizado.' : 'Registro de inventario creado.')
                await this.cargar()
            } catch (e) {
                this.errorModal = errorMessage(e, 'No se pudo guardar el inventario.')
            } finally {
                this.guardando = false
            }
        },

        async ajustar(registro, delta) {
            const anterior = registro.cantidad_stock
            const nuevo = Math.max(0, anterior + delta)
            if (nuevo === anterior) return

            registro.cantidad_stock = nuevo
            try {
                await api.put(`/inventarios/${registro.id}`, { cantidad_stock: nuevo })
            } catch (e) {
                registro.cantidad_stock = anterior
                this.avisar(errorMessage(e, 'No se pudo ajustar el stock.'), 'error')
            }
        },

        async eliminar(registro) {
            const nombre = registro.producto ? registro.producto.nombre : 'este registro'
            if (!window.confirm(`¿Eliminar el inventario de "${nombre}"?`)) return
            try {
                await api.delete(`/inventarios/${registro.id}`)
                this.inventarios = this.inventarios.filter((i) => i.id !== registro.id)
                this.avisar('Registro eliminado.')
            } catch (e) {
                this.avisar(errorMessage(e, 'No se pudo eliminar el registro.'), 'error')
            }
        }
    }
}
</script>

<style scoped>
.inv__stock {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
}

.inv__stock strong {
    min-width: 2.2ch;
    text-align: center;
}
</style>
