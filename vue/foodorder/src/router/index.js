import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '@/views/loginView.vue'
import PedidosView from '@/views/pedidosView.vue'
import nuevopedidoView from '@/views/nuevopedidoView.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView
  },
  {
    path: '/pedidos',
    name: 'pedidosView',
    component: PedidosView
  },
  {
    path: '/NuevoPedido',
    name: 'NuevoPedido',
    component: nuevopedidoView
  },
{ path: '/pedidos',
  component: PedidosView, 
  meta: { requiresAuth: true } }

]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})
import { isAuthenticated } from '@/services/auth'
import NuevopedidoView from '@/views/nuevopedidoView.vue'
import NuevopedidoView from '@/views/nuevopedidoView.vue'
import NuevopedidoView from '@/views/nuevopedidoView.vue'

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !isAuthenticated()) return next('/login')
    if (to.path === '/' && isAuthenticated()) return next('/pedidos')
    next()
})
export default router
