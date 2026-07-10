import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard · V-Fit',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'categorias',
        title: 'Categorías · V-Fit',
        loadComponent: () =>
          import('./features/categorias/categoria-list.component').then(
            (m) => m.CategoriaListComponent
          ),
      },
      {
        path: 'clientes',
        title: 'Clientes · V-Fit',
        loadComponent: () =>
          import('./features/clientes/cliente-list.component').then(
            (m) => m.ClienteListComponent
          ),
      },
      {
        path: 'productos',
        title: 'Productos · V-Fit',
        loadComponent: () =>
          import('./features/productos/producto-list.component').then(
            (m) => m.ProductoListComponent
          ),
      },
      {
        path: 'reportes',
        title: 'Reportes · V-Fit',
        loadComponent: () =>
          import('./features/reportes/reportes.component').then(
            (m) => m.ReportesComponent
          ),
      },
      {
        path: 'compras',
        title: 'Compras · V-Fit',
        loadComponent: () =>
          import('./features/compras/compra-list.component').then(
            (m) => m.CompraListComponent
          ),
      },
      {
        path: 'compras/:id',
        title: 'Detalle de compra · V-Fit',
        loadComponent: () =>
          import('./features/compras/compra-detail.component').then(
            (m) => m.CompraDetailComponent
          ),
      },
      {
        path: 'metodos-pago',
        title: 'Métodos de pago · V-Fit',
        loadComponent: () =>
          import('./features/metodos-pago/metodo-pago-list.component').then(
            (m) => m.MetodoPagoListComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
