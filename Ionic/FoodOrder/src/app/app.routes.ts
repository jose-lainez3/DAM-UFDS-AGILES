import { Routes } from '@angular/router';
import { guestGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'registro',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/registro/registro.page').then((m) => m.RegistroPage),
  },
  // La app abre directo en el menú: no se pide login para explorar
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  { path: '**', redirectTo: '' },
];
