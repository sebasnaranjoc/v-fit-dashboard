import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';

import { Cliente, Compra, MetodoPago, Producto } from '../../core/models';
import { ClienteService } from '../../core/services/cliente.service';
import { CompraService } from '../../core/services/compra.service';
import { MetodoPagoService } from '../../core/services/metodo-pago.service';
import { ProductoService } from '../../core/services/producto.service';
import { NotificationService } from '../../core/services/notification.service';
import { CompraFormComponent } from './compra-form.component';

@Component({
  selector: 'app-compra-list',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  templateUrl: './compra-list.component.html',
  styleUrls: ['../shared-list.scss'],
})
export class CompraListComponent implements OnInit {
  private readonly service = inject(CompraService);
  private readonly clienteService = inject(ClienteService);
  private readonly productoService = inject(ProductoService);
  private readonly metodoService = inject(MetodoPagoService);
  private readonly dialog = inject(MatDialog);
  private readonly notifier = inject(NotificationService);

  readonly compras = signal<Compra[]>([]);
  readonly clientes = signal<Cliente[]>([]);
  readonly productos = signal<Producto[]>([]);
  readonly metodosPago = signal<MetodoPago[]>([]);
  readonly loading = signal(false);
  readonly columns = ['id', 'fecha', 'cliente', 'metodo', 'items', 'total', 'acciones'];

  private readonly clienteMap = computed(() => {
    const map = new Map<number, string>();
    this.clientes().forEach((c) => map.set(c.id, c.nombre));
    return map;
  });

  private readonly metodoMap = computed(() => {
    const map = new Map<number, string>();
    this.metodosPago().forEach((m) => map.set(m.id, m.nombre));
    return map;
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    forkJoin({
      compras: this.service.listar(),
      clientes: this.clienteService.listar(),
      productos: this.productoService.listar(0, 500),
      metodosPago: this.metodoService.listar(),
    }).subscribe({
      next: ({ compras, clientes, productos, metodosPago }) => {
        this.compras.set(compras);
        this.clientes.set(clientes);
        this.productos.set(productos);
        this.metodosPago.set(metodosPago);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  nombreCliente(id: number): string {
    return this.clienteMap().get(id) ?? `Cliente #${id}`;
  }

  nombreMetodo(id: number): string {
    return this.metodoMap().get(id) ?? '—';
  }

  totalItems(compra: Compra): number {
    return compra.detalles.reduce((acc, d) => acc + d.cantidad, 0);
  }

  nueva(): void {
    if (this.clientes().length === 0) {
      this.notifier.error('Necesitas al menos un cliente para crear una compra.');
      return;
    }
    if (this.metodosPago().filter((m) => m.activo).length === 0) {
      this.notifier.error('Crea al menos un método de pago activo.');
      return;
    }
    this.dialog
      .open(CompraFormComponent, {
        data: {
          clientes: this.clientes(),
          productos: this.productos(),
          metodosPago: this.metodosPago(),
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;
        this.service.crear(result).subscribe(() => {
          this.notifier.success('Compra creada');
          this.cargar();
        });
      });
  }
}
