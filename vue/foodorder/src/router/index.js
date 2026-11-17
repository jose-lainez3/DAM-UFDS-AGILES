import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

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
  // GitHub Pages no reescribe rutas SPA: usar # solo en su build PWA.
  // El panel web original conserva history normal y su diseño.
  history: process.env.VUE_APP_DESKTOP_PWA === 'true'
    ? createWebHashHistory(process.env.BASE_URL)
    : createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  const logged = isAuthenticated()
  const esCliente = logged && hasRole('Cliente')

  // 1. REGLA NUEVA: Si es un Cliente, bloquearle el acceso a todo el panel y dejarlo en el login
  if (esCliente && to.name !== 'login') {
    return { name: 'login' }
  }

  // 2. Si requiere autenticación y no está logueado
  if (to.meta.requiresAuth && !logged) return { name: 'login' }
  
  // 3. Si va al login pero ya está logueado (y NO es cliente), mandarlo a Pedidos
  if (to.meta.guestOnly && logged && !esCliente) return { name: 'pedidosView' }
  
  // 4. Si la ruta exige un rol específico (Admin) y no lo tiene, mandarlo a Pedidos
  if (to.meta.roles && !hasRole(...to.meta.roles)) return { name: 'pedidosView' }
})

export default router