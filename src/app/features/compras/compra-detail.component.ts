import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { forkJoin } from 'rxjs';

import { Cliente, Compra, MetodoPago, Producto } from '../../core/models';
import { ClienteService } from '../../core/services/cliente.service';
import { CompraService } from '../../core/services/compra.service';
import { MetodoPagoService } from '../../core/services/metodo-pago.service';
import { ProductoService } from '../../core/services/producto.service';

@Component({
  selector: 'app-compra-detail',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './compra-detail.component.html',
  styleUrl: './compra-detail.component.scss',
})
export class CompraDetailComponent implements OnInit {
  /** Enlazado desde la ruta gracias a withComponentInputBinding(). */
  @Input() id!: string;

  private readonly service = inject(CompraService);
  private readonly clienteService = inject(ClienteService);
  private readonly productoService = inject(ProductoService);
  private readonly metodoService = inject(MetodoPagoService);
  private readonly router = inject(Router);

  readonly compra = signal<Compra | null>(null);
  readonly cliente = signal<Cliente | null>(null);
  readonly metodoNombre = signal<string>('—');
  readonly loading = signal(false);
  readonly columns = ['producto', 'cantidad', 'precio_unitario', 'subtotal'];

  private readonly productoMap = signal(new Map<number, Producto>());

  readonly totalItems = computed(
    () => this.compra()?.detalles.reduce((a, d) => a + d.cantidad, 0) ?? 0
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const compraId = Number(this.id);
    this.loading.set(true);
    forkJoin({
      compra: this.service.obtener(compraId),
      productos: this.productoService.listar(0, 500),
      metodos: this.metodoService.listar(),
    }).subscribe({
      next: ({ compra, productos, metodos }) => {
        this.compra.set(compra);
        this.productoMap.set(new Map(productos.map((p) => [p.id, p])));
        const metodo = metodos.find((m: MetodoPago) => m.id === compra.metodo_pago_id);
        this.metodoNombre.set(metodo?.nombre ?? '—');
        this.loading.set(false);
        this.clienteService.obtener(compra.cliente_id).subscribe({
          next: (c) => this.cliente.set(c),
          error: () => {},
        });
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/compras']);
      },
    });
  }

  nombreProducto(id: number): string {
    return this.productoMap().get(id)?.nombre ?? `Producto #${id}`;
  }

  subtotal(precioUnitario: string, cantidad: number): number {
    return Number(precioUnitario) * cantidad;
  }
}
