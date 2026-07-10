import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';

import { Categoria, Producto } from '../../core/models';
import { CategoriaService } from '../../core/services/categoria.service';
import { ProductoService } from '../../core/services/producto.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/confirm-dialog/confirm-dialog.component';
import { ProductoFormComponent } from './producto-form.component';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [
    CurrencyPipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  templateUrl: './producto-list.component.html',
  styleUrls: ['../shared-list.scss', './producto-list.component.scss'],
})
export class ProductoListComponent implements OnInit {
  private readonly service = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly dialog = inject(MatDialog);
  private readonly notifier = inject(NotificationService);

  readonly productos = signal<Producto[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly loading = signal(false);
  readonly columns = [
    'nombre',
    'categoria',
    'compra',
    'venta',
    'ganancia',
    'stock',
    'activo',
    'acciones',
  ];

  ganancia(p: Producto): number {
    return Number(p.precio_venta) - Number(p.precio_compra);
  }

  private readonly categoriaMap = computed(() => {
    const map = new Map<number, string>();
    this.categorias().forEach((c) => map.set(c.id, c.nombre));
    return map;
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    forkJoin({
      productos: this.service.listar(0, 500),
      categorias: this.categoriaService.listar(),
    }).subscribe({
      next: ({ productos, categorias }) => {
        this.productos.set(productos);
        this.categorias.set(categorias);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  nombreCategoria(id: number): string {
    return this.categoriaMap().get(id) ?? `#${id}`;
  }

  nuevo(): void {
    this.abrirForm(null);
  }

  editar(producto: Producto): void {
    this.abrirForm(producto);
  }

  private abrirForm(producto: Producto | null): void {
    if (this.categorias().length === 0) {
      this.notifier.error('Primero crea al menos una categoría.');
      return;
    }
    this.dialog
      .open(ProductoFormComponent, {
        data: { producto, categorias: this.categorias() },
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;
        const req = producto
          ? this.service.actualizar(producto.id, result)
          : this.service.crear(result);
        req.subscribe(() => {
          this.notifier.success(producto ? 'Producto actualizado' : 'Producto creado');
          this.cargar();
        });
      });
  }

  eliminar(producto: Producto): void {
    const data: ConfirmDialogData = {
      title: 'Eliminar producto',
      message: `¿Eliminar "${producto.nombre}"?`,
      danger: true,
      confirmText: 'Eliminar',
    };
    this.dialog
      .open(ConfirmDialogComponent, { data })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.service.eliminar(producto.id).subscribe(() => {
          this.notifier.success('Producto eliminado');
          this.cargar();
        });
      });
  }
}
