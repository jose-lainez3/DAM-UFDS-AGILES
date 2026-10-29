<template>
    <AppLayout :crumbs="['Administración', 'Configuración']">
        <div class="fo-toolbar">
            <div class="fo-heading">
                <h1 class="fo-title">Configuración del local</h1>
                <p class="fo-subtitle">Mesas y parámetros generales</p>
            </div>
            <button type="button" class="fo-btn fo-btn--primary" @click="abrirModal()">+ Nueva mesa</button>
        </div>

        <p v-if="mensaje" class="fo-alert" :class="'fo-alert--' + mensajeTipo" role="status">
            <span>{{ mensaje }}</span>
            <button type="button" aria-label="Cerrar" @click="mensaje = ''">×</button>
        </p>

        <section class="fo-stats" aria-label="Parámetros">
            <article class="fo-stat">
                <strong class="fo-stat__value">{{ mesas.length }}</strong>
                <span class="fo-stat__label">Mesas</span>
            </article>
            <article class="fo-stat">
                <strong class="fo-stat__value">{{ capacidadTotal }}</strong>
                <span class="fo-stat__label">Capacidad total</span>
            </article>
            <article class="fo-stat">
                <strong class="fo-stat__value">{{ tasaTexto }}</strong>
                <span class="fo-stat__label">Impuesto (TASA_IMPUESTO)</span>
            </article>
            <article class="fo-stat">
                <strong class="fo-stat__value conf__api">{{ apiUrl }}</strong>
                <span class="fo-stat__label">API conectada</span>
            </article>
        </section>

        <section>
            <h2 class="fo-section-title">Mesas del local</h2>
            <div class="fo-table-wrap">
                <table class="fo-table">
                    <thead>
                        <tr>
                            <th>Mesa</th>
                            <th class="fo-table__num">Capacidad</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="4" class="fo-empty">Cargando mesas…</td>
                        </tr>
                        <tr v-else-if="!mesas.length">
                            <td colspan="4" class="fo-empty">Aún no hay mesas. Crea la primera.</td>
                        </tr>
                        <tr v-for="m in mesas" :key="m.id">
                            <td><strong>Mesa {{ m.numero_mesa }}</strong></td>
                            <td class="fo-table__num">{{ m.capacidad }} personas</td>
                            <td>
                                <select class="fo-select conf__estado" :value="m.estado"
                                    :aria-label="'Estado de la mesa ' + m.numero_mesa"
                                    @change="cambiarEstado(m, $event.target.value)">
                                    <option v-for="e in estados" :key="e.value" :value="e.value">{{ e.label }}</option>
                                </select>
                            </td>
                            <td>
                                <div class="fo-actions">
                                    <button type="button" class="fo-link-btn" @click="abrirModal(m)">Editar</button>
                                    <button type="button" class="fo-link-btn fo-link-btn--danger"
                                        @click="eliminar(m)">Eliminar</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p class="fo-subtitle conf__nota">
                El impuesto se define en el archivo <code>.env</code> de Laravel (<code>TASA_IMPUESTO</code>).
                Las mesas pasan solas a «Ocupada» al crear un pedido y vuelven a «Disponible» al cobrarlo o cancelarlo.
            </p>
        </section>

        <!-- Modal mesa -->
        <div v-if="modal" class="fo-modal-backdrop" @click.self="modal = false">
            <div class="fo-modal">
                <header class="fo-modal__header">
                    <h3 class="fo-modal__title">{{ form.id ? 'Editar mesa' : 'Nueva mesa' }}</h3>
                    <button type="button" class="fo-modal__close" aria-label="Cerrar"
                        @click="modal = false">&times;</button>
                </header>

                <form class="fo-modal__form" @submit.prevent="guardar">
                    <p v-if="errorModal" class="fo-alert fo-alert--error" role="alert">{{ errorModal }}</p>

                    <div class="fo-form-row">
                        <div class="fo-form-group">
                            <label for="mesa-num">Número de mesa</label>
                            <input id="mesa-num" v-model="form.numero_mesa" type="number" min="1" step="1" required />
                        </div>
                        <div class="fo-form-group">
                            <label for="mesa-cap">Capacidad</label>
                            <input id="mesa-cap" v-model="form.capacidad" type="number" min="1" step="1" required />
                        </div>
                    </div>

                    <div class="fo-form-group">
                        <label for="mesa-estado">Estado</label>
                        <select id="mesa-estado" v-model="form.estado">
                            <option v-for="e in estados" :key="e.value" :value="e.value">{{ e.label }}</option>
                        </select>
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
import api, { API_URL } from '@/services/api'
import AppLayout from '@/components/AppLayout.vue'
import { errorMessage } from '@/services/utils'

const FORM_VACIO = { id: null, numero_mesa: '', capacidad: 4, estado: 'disponible' }

export default {
    name: 'ConfiguracionView',

    components: { AppLayout },

    data() {
        return {
            mesas: [],
            tasa: null,
            apiUrl: API_URL,
            loading: true,
            guardando: false,

            mensaje: '',
            mensajeTipo: 'success',

            modal: false,
            errorModal: '',
            form: { ...FORM_VACIO },

            estados: [
                { value: 'disponible', label: 'Disponible' },
                { value: 'ocupada', label: 'Ocupada' },
                { value: 'reservada', label: 'Reservada' }
            ]
        }
    },

    computed: {
        capacidadTotal() {
            return this.mesas.reduce((sum, m) => sum + Number(m.capacidad), 0)
        },

        tasaTexto() {
            return this.tasa === null ? '—' : `${(this.tasa * 100).toFixed(0)} %`
        }
    },

    created() {
        this.cargar()
    },

    methods: {
        avisar(texto, tipo = 'success') {
            this.mensaje = texto
            this.mensajeTipo = tipo
        },

        async cargar() {
            this.loading = true
            try {
                const [mesas, config] = await Promise.all([
                    api.get('/mesas'),
                    api.get('/configuracion').catch(() => null)
                ])
                this.mesas = mesas.data
                this.tasa = config && config.data ? Number(config.data.tasa_impuesto) : null
            } catch (e) {
                this.avisar(errorMessage(e, 'No se pudo cargar la configuración.'), 'error')
            } finally {
                this.loading = false
            }
        },

        abrirModal(mesa = null) {
            this.errorModal = ''
            this.form = mesa
                ? { id: mesa.id, numero_mesa: mesa.numero_mesa, capacidad: mesa.capacidad, estado: mesa.estado }
                : {
                    ...FORM_VACIO,
                    numero_mesa: this.mesas.length ? Math.max(...this.mesas.map((m) => m.numero_mesa)) + 1 : 1
                }
            this.modal = true
        },

        async guardar() {
            this.guardando = true
            this.errorModal = ''
            try {
                const payload = {
                    numero_mesa: Number(this.form.numero_mesa),
                    capacidad: Number(this.form.capacidad),
                    estado: this.form.estado
                }
                const editando = Boolean(this.form.id)

                if (editando) {
                    await api.put(`/mesas/${this.form.id}`, payload)
                } else {
                    await api.post('/mesas', payload)
                }

                this.modal = false
                this.avisar(editando ? 'Mesa actualizada.' : 'Mesa creada.')
                await this.cargar()
            } catch (e) {
                this.errorModal = errorMessage(e, 'No se pudo guardar la mesa.')
            } finally {
                this.guardando = false
            }
        },

        async cambiarEstado(mesa, estado) {
            const anterior = mesa.estado
            mesa.estado = estado
            try {
                await api.put(`/mesas/${mesa.id}`, { estado })
            } catch (e) {
                mesa.estado = anterior
                this.avisar(errorMessage(e, 'No se pudo cambiar el estado.'), 'error')
                await this.cargar()
            }
        },

        async eliminar(mesa) {
            if (!window.confirm(`¿Eliminar la mesa ${mesa.numero_mesa}?`)) return
            try {
                await api.delete(`/mesas/${mesa.id}`)
                this.mesas = this.mesas.filter((m) => m.id !== mesa.id)
                this.avisar('Mesa eliminada.')
            } catch (e) {
                this.avisar(errorMessage(e, 'No se pudo eliminar la mesa.'), 'error')
            }
        }
    }
}
</script>

<style scoped>
.conf__api {
    font-size: 0.85rem;
    word-break: break-all;
    text-align: center;
}

.conf__estado {
    min-width: 0;
    padding: 0.4rem 0.7rem;
}

.conf__nota {
    margin-top: 0.75rem;
}
</style>
