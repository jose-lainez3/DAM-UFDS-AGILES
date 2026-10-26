import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '@/views/loginView.vue'
import PedidosView from '@/views/pedidosView.vue'

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
{ path: '/pedidos',
  component: PedidosView, 
  meta: { requiresAuth: true } }

]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})
import { isAuthenticated } from '@/services/auth'

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !isAuthenticated()) return next('/login')
    if (to.path === '/' && isAuthenticated()) return next('/pedidos')
    next()
})
export default router
