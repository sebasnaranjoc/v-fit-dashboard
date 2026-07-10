import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';

import { Categoria, Cliente, Compra, MetodoPago, Producto } from '../../core/models';
import { CategoriaService } from '../../core/services/categoria.service';
import { ClienteService } from '../../core/services/cliente.service';
import { CompraService } from '../../core/services/compra.service';
import { MetodoPagoService } from '../../core/services/metodo-pago.service';
import { ProductoService } from '../../core/services/producto.service';

interface FilaMetodo {
  nombre: string;
  nCompras: number;
  ingresos: number;
  ganancia: number;
  pct: number;
}

interface FilaProducto {
  nombre: string;
  unidades: number;
  ingresos: number;
  ganancia: number;
}

interface FilaCategoria {
  nombre: string;
  ingresos: number;
  ganancia: number;
  pct: number;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CurrencyPipe,
    DecimalPipe,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
})
export class ReportesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly compraService = inject(CompraService);
  private readonly clienteService = inject(ClienteService);
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly metodoService = inject(MetodoPagoService);

  readonly loading = signal(false);
  readonly compras = signal<Compra[]>([]);
  readonly clientes = signal<Cliente[]>([]);
  readonly productos = signal<Producto[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly metodosPago = signal<MetodoPago[]>([]);

  readonly filtros = this.fb.nonNullable.group({
    desde: [''],
    hasta: [''],
    metodos: [[] as number[]],
    clienteId: [null as number | null],
  });

  private readonly filtrosValue = signal(this.filtros.getRawValue());

  constructor() {
    this.filtros.valueChanges.subscribe(() =>
      this.filtrosValue.set(this.filtros.getRawValue())
    );
  }

  // ---------- Mapas de apoyo ----------
  private readonly productoMap = computed(() => {
    const map = new Map<number, Producto>();
    this.productos().forEach((p) => map.set(p.id, p));
    return map;
  });

  private readonly categoriaMap = computed(() => {
    const map = new Map<number, string>();
    this.categorias().forEach((c) => map.set(c.id, c.nombre));
    return map;
  });

  private readonly metodoMap = computed(() => {
    const map = new Map<number, string>();
    this.metodosPago().forEach((m) => map.set(m.id, m.nombre));
    return map;
  });

  // ---------- Compras filtradas ----------
  readonly comprasFiltradas = computed(() => {
    const { desde, hasta, metodos, clienteId } = this.filtrosValue();
    return this.compras().filter((c) => {
      const dia = c.fecha.slice(0, 10); // 'yyyy-mm-dd'
      if (desde && dia < desde) return false;
      if (hasta && dia > hasta) return false;
      if (metodos.length && !metodos.includes(c.metodo_pago_id)) return false;
      if (clienteId != null && c.cliente_id !== clienteId) return false;
      return true;
    });
  });

  // ---------- KPIs ----------
  readonly ingresos = computed(() =>
    this.comprasFiltradas().reduce((a, c) => a + Number(c.total), 0)
  );

  readonly costos = computed(() =>
    this.comprasFiltradas().reduce(
      (a, c) =>
        a + c.detalles.reduce((s, d) => s + Number(d.costo_unitario) * d.cantidad, 0),
      0
    )
  );

  readonly ganancia = computed(() => this.ingresos() - this.costos());

  readonly margen = computed(() => {
    const ing = this.ingresos();
    return ing ? (this.ganancia() / ing) * 100 : 0;
  });

  readonly nCompras = computed(() => this.comprasFiltradas().length);

  readonly unidades = computed(() =>
    this.comprasFiltradas().reduce(
      (a, c) => a + c.detalles.reduce((s, d) => s + d.cantidad, 0),
      0
    )
  );

  readonly ticketPromedio = computed(() =>
    this.nCompras() ? this.ingresos() / this.nCompras() : 0
  );

  // ---------- Desglose por método de pago ----------
  readonly porMetodo = computed<FilaMetodo[]>(() => {
    const acc = new Map<number, { nCompras: number; ingresos: number; ganancia: number }>();
    for (const c of this.comprasFiltradas()) {
      const g = c.detalles.reduce(
        (s, d) =>
          s + (Number(d.precio_unitario) - Number(d.costo_unitario)) * d.cantidad,
        0
      );
      const cur = acc.get(c.metodo_pago_id) ?? { nCompras: 0, ingresos: 0, ganancia: 0 };
      cur.nCompras += 1;
      cur.ingresos += Number(c.total);
      cur.ganancia += g;
      acc.set(c.metodo_pago_id, cur);
    }
    const maxIng = Math.max(1, ...[...acc.values()].map((v) => v.ingresos));
    return [...acc.entries()]
      .map(([id, v]) => ({
        nombre: this.metodoMap().get(id) ?? `#${id}`,
        nCompras: v.nCompras,
        ingresos: v.ingresos,
        ganancia: v.ganancia,
        pct: Math.round((v.ingresos / maxIng) * 100),
      }))
      .sort((a, b) => b.ingresos - a.ingresos);
  });

  // ---------- Top productos ----------
  readonly topProductos = computed<FilaProducto[]>(() => {
    const acc = new Map<number, { unidades: number; ingresos: number; ganancia: number }>();
    for (const c of this.comprasFiltradas()) {
      for (const d of c.detalles) {
        const cur = acc.get(d.producto_id) ?? { unidades: 0, ingresos: 0, ganancia: 0 };
        cur.unidades += d.cantidad;
        cur.ingresos += Number(d.precio_unitario) * d.cantidad;
        cur.ganancia += (Number(d.precio_unitario) - Number(d.costo_unitario)) * d.cantidad;
        acc.set(d.producto_id, cur);
      }
    }
    return [...acc.entries()]
      .map(([id, v]) => ({
        nombre: this.productoMap().get(id)?.nombre ?? `Producto #${id}`,
        ...v,
      }))
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, 10);
  });

  // ---------- Por categoría ----------
  readonly porCategoria = computed<FilaCategoria[]>(() => {
    const acc = new Map<number, { ingresos: number; ganancia: number }>();
    for (const c of this.comprasFiltradas()) {
      for (const d of c.detalles) {
        const prod = this.productoMap().get(d.producto_id);
        const catId = prod?.categoria_id ?? -1;
        const cur = acc.get(catId) ?? { ingresos: 0, ganancia: 0 };
        cur.ingresos += Number(d.precio_unitario) * d.cantidad;
        cur.ganancia += (Number(d.precio_unitario) - Number(d.costo_unitario)) * d.cantidad;
        acc.set(catId, cur);
      }
    }
    const maxIng = Math.max(1, ...[...acc.values()].map((v) => v.ingresos));
    return [...acc.entries()]
      .map(([id, v]) => ({
        nombre: id === -1 ? 'Sin categoría' : this.categoriaMap().get(id) ?? `#${id}`,
        ingresos: v.ingresos,
        ganancia: v.ganancia,
        pct: Math.round((v.ingresos / maxIng) * 100),
      }))
      .sort((a, b) => b.ingresos - a.ingresos);
  });

  // ---------- Atajos de fecha ----------
  private toStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  }

  rango(tipo: 'hoy' | '7d' | 'mes' | 'anio' | 'todo'): void {
    const hoy = new Date();
    if (tipo === 'todo') {
      this.filtros.patchValue({ desde: '', hasta: '' });
      return;
    }
    let desde = new Date(hoy);
    if (tipo === '7d') desde.setDate(hoy.getDate() - 6);
    else if (tipo === 'mes') desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    else if (tipo === 'anio') desde = new Date(hoy.getFullYear(), 0, 1);
    this.filtros.patchValue({ desde: this.toStr(desde), hasta: this.toStr(hoy) });
  }

  limpiar(): void {
    this.filtros.reset({ desde: '', hasta: '', metodos: [], clienteId: null });
  }

  ngOnInit(): void {
    this.loading.set(true);
    forkJoin({
      compras: this.compraService.listar(),
      clientes: this.clienteService.listar(),
      productos: this.productoService.listar(0, 500),
      categorias: this.categoriaService.listar(),
      metodosPago: this.metodoService.listar(),
    }).subscribe({
      next: ({ compras, clientes, productos, categorias, metodosPago }) => {
        this.compras.set(compras);
        this.clientes.set(clientes);
        this.productos.set(productos);
        this.categorias.set(categorias);
        this.metodosPago.set(metodosPago);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
