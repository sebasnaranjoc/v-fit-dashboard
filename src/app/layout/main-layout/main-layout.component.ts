import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  readonly opened = signal(true);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Reportes', icon: 'query_stats', route: '/reportes' },
    { label: 'Compras', icon: 'shopping_cart', route: '/compras' },
    { label: 'Productos', icon: 'inventory_2', route: '/productos' },
    { label: 'Categorías', icon: 'category', route: '/categorias' },
    { label: 'Clientes', icon: 'group', route: '/clientes' },
    { label: 'Métodos de pago', icon: 'payments', route: '/metodos-pago' },
  ];

  toggle(): void {
    this.opened.update((v) => !v);
  }
}
