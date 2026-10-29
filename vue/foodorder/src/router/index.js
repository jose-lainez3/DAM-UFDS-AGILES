import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '@/views/loginView.vue'
import PedidosView from '@/views/pedidosView.vue'
import NuevopedidoView from '@/views/nuevopedidoView.vue'
import GestionPersonalView from '@/views/GestionPersonalView.vue'
import { isAuthenticated, hasRole } from '@/services/auth'

const ADMIN = ['Administrador']

const routes = [
  // ---------- Públicas ----------
  {
    path: '/',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'RegisterView',
    component: () => import('@/views/RegisterView.vue'),
    meta: { guestOnly: true }
  },
  // Alias por si algún enlace antiguo apunta a /login
  { path: '/login', redirect: '/' },

  // ---------- Operación diaria (cualquier usuario autenticado) ----------
  {
    path: '/pedidos',
    name: 'pedidosView',
    component: PedidosView,
    meta: { requiresAuth: true }
  },
  // Enlace antiguo: /pedidos/nuevo → /nuevopedido (debe ir antes de /pedidos/:id)
  { path: '/pedidos/nuevo', redirect: '/nuevopedido' },
  {
    path: '/pedidos/:id(\\d+)',
    name: 'PedidoDetalleView',
    component: () => import('@/views/PedidoDetalleView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/nuevopedido',
    name: 'NuevoPedidoView',
    component: NuevopedidoView,
    meta: { requiresAuth: true }
  },
  {
    path: '/cocina',
    name: 'CocinaView',
    component: () => import('@/views/CocinaView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/productos',
    name: 'ProductosView',
    component: () => import('@/views/ProductosView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/inventario',
    name: 'InventarioView',
    component: () => import('@/views/InventarioView.vue'),
    meta: { requiresAuth: true }
  },

  // ---------- Administración (solo rol Administrador) ----------
  {
    path: '/admin/usuarios',
    name: 'GestionPersonalView',
    component: GestionPersonalView,
    meta: { requiresAuth: true, roles: ADMIN }
  },
  {
    path: '/admin/reportes',
    name: 'ReportesView',
    component: () => import('@/views/ReportesView.vue'),
    meta: { requiresAuth: true, roles: ADMIN }
  },
  {
    path: '/admin/configuracion',
    name: 'ConfiguracionView',
    component: () => import('@/views/ConfiguracionView.vue'),
    meta: { requiresAuth: true, roles: ADMIN }
  },

  // Cualquier otra URL → inicio
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  const logged = isAuthenticated()

  if (to.meta.requiresAuth && !logged) return { name: 'login' }
  if (to.meta.guestOnly && logged) return { name: 'pedidosView' }
  if (to.meta.roles && !hasRole(...to.meta.roles)) return { name: 'pedidosView' }
})

export default router
