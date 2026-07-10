import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';

import { Cliente, Compra, Producto } from '../../core/models';
import { ClienteService } from '../../core/services/cliente.service';
import { CompraService } from '../../core/services/compra.service';
import { ProductoService } from '../../core/services/producto.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly compraService = inject(CompraService);
  private readonly clienteService = inject(ClienteService);
  private readonly productoService = inject(ProductoService);

  readonly loading = signal(false);
  readonly compras = signal<Compra[]>([]);
  readonly clientes = signal<Cliente[]>([]);
  readonly productos = signal<Producto[]>([]);

  readonly UMBRAL_STOCK = 5;

  /** Ingresos = suma de los totales de todas las compras. */
  readonly ingresos = computed(() =>
    this.compras().reduce((acc, c) => acc + Number(c.total), 0)
  );

  /** Ganancia estimada = suma de (venta - costo) * cantidad por línea. */
  readonly ganancia = computed(() =>
    this.compras().reduce((acc, c) => {
      const g = c.detalles.reduce(
        (s, d) =>
          s + (Number(d.precio_unitario) - Number(d.costo_unitario)) * d.cantidad,
        0
      );
      return acc + g;
    }, 0)
  );

  readonly stockBajo = computed(() =>
    this.productos().filter((p) => p.activo && p.stock <= this.UMBRAL_STOCK)
  );

  private readonly clienteMap = computed(() => {
    const map = new Map<number, string>();
    this.clientes().forEach((c) => map.set(c.id, c.nombre));
    return map;
  });

  readonly ultimasCompras = computed(() =>
    [...this.compras()]
      .sort((a, b) => b.id - a.id)
      .slice(0, 5)
      .map((c) => ({
        ...c,
        clienteNombre: this.clienteMap().get(c.cliente_id) ?? `#${c.cliente_id}`,
      }))
  );

  ngOnInit(): void {
    this.loading.set(true);
    forkJoin({
      compras: this.compraService.listar(),
      clientes: this.clienteService.listar(),
      productos: this.productoService.listar(0, 500),
    }).subscribe({
      next: ({ compras, clientes, productos }) => {
        this.compras.set(compras);
        this.clientes.set(clientes);
        this.productos.set(productos);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
