import { Routes } from '@angular/router';
import { authGuard } from '../core/auth.guard';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'menu',
        loadComponent: () => import('../pages/menu/menu.page').then((m) => m.MenuPage),
      },
      {
        path: 'carrito',
        loadComponent: () => import('../pages/carrito/carrito.page').then((m) => m.CarritoPage),
      },
      {
        // Solo "Mis pedidos" exige sesión
        path: 'pedidos',
        canActivate: [authGuard],
        loadComponent: () => import('../pages/pedidos/pedidos.page').then((m) => m.PedidosPage),
      },
      {
        path: 'pedido/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('../pages/pedido-detalle/pedido-detalle.page').then((m) => m.PedidoDetallePage),
      },
      {
        path: 'perfil',
        loadComponent: () => import('../pages/perfil/perfil.page').then((m) => m.PerfilPage),
      },
      { path: '', redirectTo: '/tabs/menu', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: '/tabs/menu', pathMatch: 'full' },
];
