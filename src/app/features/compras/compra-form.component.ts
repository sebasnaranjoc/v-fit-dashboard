import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Cliente, CompraCreate, MetodoPago, Producto } from '../../core/models';

export interface CompraFormData {
  clientes: Cliente[];
  productos: Producto[];
  metodosPago: MetodoPago[];
}

@Component({
  selector: 'app-compra-form',
  standalone: true,
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './compra-form.component.html',
  styleUrl: './compra-form.component.scss',
})
export class CompraFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CompraFormComponent>);
  readonly data = inject<CompraFormData>(MAT_DIALOG_DATA);

  /** Solo productos activos con stock son seleccionables. */
  readonly productosDisponibles = this.data.productos.filter(
    (p) => p.activo && p.stock > 0
  );

  /** Solo métodos de pago activos. */
  readonly metodosDisponibles = this.data.metodosPago.filter((m) => m.activo);

  private readonly precioMap = new Map(
    this.data.productos.map((p) => [p.id, Number(p.precio_venta)])
  );

  readonly form = this.fb.nonNullable.group({
    cliente_id: [null as number | null, [Validators.required]],
    metodo_pago_id: [null as number | null, [Validators.required]],
    detalles: this.fb.array([this.crearLinea()]),
  });

  /** Señal que refleja los cambios del form para recalcular el total. */
  private readonly formValue = signal(this.form.getRawValue());

  readonly total = computed(() =>
    this.formValue().detalles.reduce((acc, d) => {
      const precio = d.producto_id ? this.precioMap.get(d.producto_id) ?? 0 : 0;
      return acc + precio * (d.cantidad ?? 0);
    }, 0)
  );

  constructor() {
    this.form.valueChanges.subscribe(() =>
      this.formValue.set(this.form.getRawValue())
    );
  }

  get detalles(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  private crearLinea() {
    return this.fb.nonNullable.group({
      producto_id: [null as number | null, [Validators.required]],
      cantidad: [1, [Validators.required, Validators.min(1)]],
    });
  }

  agregarLinea(): void {
    this.detalles.push(this.crearLinea());
  }

  quitarLinea(index: number): void {
    if (this.detalles.length > 1) {
      this.detalles.removeAt(index);
    }
  }

  precioProducto(id: number | null): number {
    return id ? this.precioMap.get(id) ?? 0 : 0;
  }

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const payload: CompraCreate = {
      cliente_id: v.cliente_id as number,
      metodo_pago_id: v.metodo_pago_id as number,
      detalles: v.detalles.map((d) => ({
        producto_id: d.producto_id as number,
        cantidad: d.cantidad,
      })),
    };
    this.dialogRef.close(payload);
  }
}
