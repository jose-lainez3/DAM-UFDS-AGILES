<template>
    <AppLayout :crumbs="['Productos']">
        <div class="fo-toolbar">
            <div class="fo-heading">
                <h1 class="fo-title">Productos</h1>
                <p class="fo-subtitle">Gestiona el menú del restaurante</p>
            </div>

            <input v-model="search" type="search" class="fo-input" placeholder="Buscar producto"
                aria-label="Buscar producto" />

            <select v-model="categoriaFiltro" class="fo-select" aria-label="Filtrar por categoría">
                <option value="todas">Categoría: Todas</option>
                <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
            </select>

            <button type="button" class="fo-btn" @click="abrirCategoria">+ Categoría</button>
            <button type="button" class="fo-btn fo-btn--primary" @click="abrirProducto()">+ Nuevo producto</button>
        </div>

        <p v-if="mensaje" class="fo-alert" :class="'fo-alert--' + mensajeTipo" role="status">
            <span>{{ mensaje }}</span>
            <button type="button" aria-label="Cerrar" @click="mensaje = ''">×</button>
        </p>

        <section class="fo-stats" aria-label="Resumen">
            <article class="fo-stat">
                <strong class="fo-stat__value">{{ productos.length }}</strong>
                <span class="fo-stat__label">Productos</span>
            </article>
            <article class="fo-stat">
                <strong class="fo-stat__value">{{ disponibles }}</strong>
                <span class="fo-stat__label">Disponibles</span>
            </article>
            <article class="fo-stat">
                <strong class="fo-stat__value">{{ productos.length - disponibles }}</strong>
                <span class="fo-stat__label">No disponibles</span>
            </article>
            <article class="fo-stat">
                <strong class="fo-stat__value">{{ categorias.length }}</strong>
                <span class="fo-stat__label">Categorías</span>
            </article>
        </section>

        <section>
            <div class="fo-table-wrap">
                <table class="fo-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th class="fo-table__num">Precio</th>
                            <th>Disponibilidad</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="5" class="fo-empty">Cargando productos…</td>
                        </tr>
                        <tr v-else-if="!paginados.length">
                            <td colspan="5" class="fo-empty">No hay productos que coincidan.</td>
                        </tr>
                        <tr v-for="p in paginados" :key="p.id">
                            <td>
                                <strong>{{ p.nombre }}</strong>
                                <div v-if="p.descripcion" class="productos__desc">{{ p.descripcion }}</div>
                            </td>
                            <td>{{ p.categoria ? p.categoria.nombre : '—' }}</td>
                            <td class="fo-table__num">{{ formatMoney(p.precio) }}</td>
                            <td>
                                <button type="button" class="fo-badge productos__toggle"
                                    :class="p.disponible ? 'fo-badge--disponible' : 'fo-badge--agotado'"
                                    :title="p.disponible ? 'Pulsa para marcar como no disponible' : 'Pulsa para marcar como disponible'"
                                    @click="alternarDisponible(p)">
                                    {{ p.disponible ? 'Disponible' : 'No disponible' }}
                                </button>
                            </td>
                            <td>
                                <div class="fo-actions">
                                    <button type="button" class="fo-link-btn" @click="abrirProducto(p)">Editar</button>
                                    <button type="button" class="fo-link-btn fo-link-btn--danger"
                                        @click="eliminar(p)">Eliminar</button>
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

        <!-- Modal producto -->
        <div v-if="modalProducto" class="fo-modal-backdrop" @click.self="modalProducto = false">
            <div class="fo-modal">
                <header class="fo-modal__header">
                    <h3 class="fo-modal__title">{{ form.id ? 'Editar producto' : 'Nuevo producto' }}</h3>
                    <button type="button" class="fo-modal__close" aria-label="Cerrar"
                        @click="modalProducto = false">&times;</button>
                </header>

                <form class="fo-modal__form" @submit.prevent="guardarProducto">
                    <p v-if="errorModal" class="fo-alert fo-alert--error" role="alert">{{ errorModal }}</p>

                    <div class="fo-form-group">
                        <label for="prod-nombre">Nombre</label>
                        <input id="prod-nombre" v-model="form.nombre" type="text" required placeholder="Ej. Hamburguesa" />
                    </div>

                    <div class="fo-form-group">
                        <label for="prod-desc">Descripción</label>
                        <textarea id="prod-desc" v-model="form.descripcion" placeholder="Opcional"></textarea>
                    </div>

                    <div class="fo-form-row">
                        <div class="fo-form-group">
                            <label for="prod-cat">Categoría</label>
                            <select id="prod-cat" v-model="form.categoria_id" required>
                                <option value="" disabled>Selecciona una categoría</option>
                                <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
                            </select>
                        </div>
                        <div class="fo-form-group">
                            <label for="prod-precio">Precio ($)</label>
                            <input id="prod-precio" v-model="form.precio" type="number" min="0" step="0.01" required />
                        </div>
                    </div>

                    <label class="fo-check">
                        <input v-model="form.disponible" type="checkbox" />
                        Disponible para la venta
                    </label>

                    <footer class="fo-modal__actions">
                        <button type="button" class="fo-btn" @click="modalProducto = false">Cancelar</button>
                        <button type="submit" class="fo-btn fo-btn--primary" :disabled="guardando">
                            {{ guardando ? 'Guardando…' : 'Guardar' }}
                        </button>
                    </footer>
                </form>
            </div>
        </div>

        <!-- Modal categoría -->
        <div v-if="modalCategoria" class="fo-modal-backdrop" @click.self="modalCategoria = false">
            <div class="fo-modal">
                <header class="fo-modal__header">
                    <h3 class="fo-modal__title">Nueva categoría</h3>
                    <button type="button" class="fo-modal__close" aria-label="Cerrar"
                        @click="modalCategoria = false">&times;</button>
                </header>

                <form class="fo-modal__form" @submit.prevent="guardarCategoria">
                    <p v-if="errorModal" class="fo-alert fo-alert--error" role="alert">{{ errorModal }}</p>

                    <div class="fo-form-group">
                        <label for="cat-nombre">Nombre</label>
                        <input id="cat-nombre" v-model="formCategoria.nombre" type="text" required
                            placeholder="Ej. Ensaladas" />
                    </div>

                    <div class="fo-form-group">
                        <label for="cat-desc">Descripción</label>
                        <textarea id="cat-desc" v-model="formCategoria.descripcion" placeholder="Opcional"></textarea>
                    </div>

                    <footer class="fo-modal__actions">
                        <button type="button" class="fo-btn" @click="modalCategoria = false">Cancelar</button>
                        <button type="submit" class="fo-btn fo-btn--primary" :disabled="guardando">
                            {{ guardando ? 'Guardando…' : 'Crear categoría' }}
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
import { errorMessage, formatMoney } from '@/services/utils'

const FORM_VACIO = { id: null, nombre: '', descripcion: '', categoria_id: '', precio: '', disponible: true }

export default {
    name: 'ProductosView',

    components: { AppLayout },

    data() {
        return {
            productos: [],
            categorias: [],
            loading: true,
            guardando: false,

            search: '',
            categoriaFiltro: 'todas',
            pagina: 1,
            porPagina: 8,

            mensaje: '',
            mensajeTipo: 'success',

            modalProducto: false,
            modalCategoria: false,
            errorModal: '',
            form: { ...FORM_VACIO },
            formCategoria: { nombre: '', descripcion: '' }
        }
    },

    computed: {
        disponibles() {
            return this.productos.filter((p) => p.disponible).length
        },

        filtrados() {
            const term = this.search.trim().toLowerCase()
            return this.productos.filter((p) => {
                const okCategoria = this.categoriaFiltro === 'todas' || p.categoria_id === this.categoriaFiltro
                const okTexto = !term || p.nombre.toLowerCase().includes(term) ||
                    (p.descripcion || '').toLowerCase().includes(term)
                return okCategoria && okTexto
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
        categoriaFiltro() { this.pagina = 1 }
    },

    created() {
        this.cargar()
    },

    methods: {
        formatMoney,

        avisar(texto, tipo = 'success') {
            this.mensaje = texto
            this.mensajeTipo = tipo
        },

        async cargar() {
            this.loading = true
            try {
                const [productos, categorias] = await Promise.all([api.get('/productos'), api.get('/categorias')])
                this.productos = productos.data
                this.categorias = categorias.data
            } catch (e) {
                this.avisar(errorMessage(e, 'No se pudieron cargar los productos.'), 'error')
            } finally {
                this.loading = false
            }
        },

        // ---------- Productos ----------
        abrirProducto(producto = null) {
            this.errorModal = ''
            this.form = producto
                ? {
                    id: producto.id,
                    nombre: producto.nombre,
                    descripcion: producto.descripcion || '',
                    categoria_id: producto.categoria_id,
                    precio: producto.precio,
                    disponible: Boolean(producto.disponible)
                }
                : { ...FORM_VACIO }
            this.modalProducto = true
        },

        async guardarProducto() {
            this.guardando = true
            this.errorModal = ''
            try {
                const payload = {
                    nombre: this.form.nombre.trim(),
                    descripcion: this.form.descripcion.trim() || null,
                    categoria_id: this.form.categoria_id,
                    precio: Number(this.form.precio),
                    disponible: this.form.disponible
                }

                if (this.form.id) {
                    await api.put(`/productos/${this.form.id}`, payload)
                } else {
                    await api.post('/productos', payload)
                }

                this.modalProducto = false
                this.avisar(this.form.id ? 'Producto actualizado.' : 'Producto creado.')
                await this.cargar()
            } catch (e) {
                this.errorModal = errorMessage(e, 'No se pudo guardar el producto.')
            } finally {
                this.guardando = false
            }
        },

        async alternarDisponible(producto) {
            const anterior = producto.disponible
            producto.disponible = !anterior
            try {
                await api.put(`/productos/${producto.id}`, { disponible: producto.disponible })
            } catch (e) {
                producto.disponible = anterior
                this.avisar(errorMessage(e, 'No se pudo cambiar la disponibilidad.'), 'error')
            }
        },

        async eliminar(producto) {
            if (!window.confirm(`¿Eliminar "${producto.nombre}"?`)) return
            try {
                await api.delete(`/productos/${producto.id}`)
                this.productos = this.productos.filter((p) => p.id !== producto.id)
                this.avisar('Producto eliminado.')
            } catch (e) {
                this.avisar(errorMessage(e, 'No se pudo eliminar el producto.'), 'error')
            }
        },

        // ---------- Categorías ----------
        abrirCategoria() {
            this.errorModal = ''
            this.formCategoria = { nombre: '', descripcion: '' }
            this.modalCategoria = true
        },

        async guardarCategoria() {
            this.guardando = true
            this.errorModal = ''
            try {
                await api.post('/categorias', {
                    nombre: this.formCategoria.nombre.trim(),
                    descripcion: this.formCategoria.descripcion.trim() || null
                })
                this.modalCategoria = false
                this.avisar('Categoría creada.')
                await this.cargar()
            } catch (e) {
                this.errorModal = errorMessage(e, 'No se pudo crear la categoría.')
            } finally {
                this.guardando = false
            }
        }
    }
}
</script>

<style scoped>
.productos__desc {
    margin-top: 0.15rem;
    font-size: 0.85rem;
    color: var(--ink-soft);
}

.productos__toggle {
    font: inherit;
    font-size: 0.82rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
}
</style>
