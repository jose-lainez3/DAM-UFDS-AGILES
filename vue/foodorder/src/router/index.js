import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '@/views/loginView.vue'

const routes = [
  {
    path: '/',
    name: 'loginView',
    component: LoginView
  },

]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
