import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'pedidos',
        loadComponent: () => import('../pages/pedidos/pedidos.page').then((m) => m.PedidosPage),
      },
      {
        // Detalle dentro de la pestaña de pedidos (la barra de tabs se mantiene)
        path: 'pedido/:id',
        loadComponent: () =>
          import('../pages/pedido-detalle/pedido-detalle.page').then((m) => m.PedidoDetallePage),
      },
      {
        path: 'nuevo',
        loadComponent: () => import('../pages/nuevo-pedido/nuevo-pedido.page').then((m) => m.NuevoPedidoPage),
      },
      {
        path: 'cocina',
        loadComponent: () => import('../pages/cocina/cocina.page').then((m) => m.CocinaPage),
      },
      {
        path: 'perfil',
        loadComponent: () => import('../pages/perfil/perfil.page').then((m) => m.PerfilPage),
      },
      {
        path: '',
        redirectTo: '/tabs/pedidos',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/pedidos',
    pathMatch: 'full',
  },
];
