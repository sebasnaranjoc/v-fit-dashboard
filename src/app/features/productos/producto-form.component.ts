import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Categoria, Producto, ProductoCreate } from '../../core/models';

export interface ProductoFormData {
  producto: Producto | null;
  categorias: Categoria[];
}

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.producto ? 'Editar producto' : 'Nuevo producto' }}
    </h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-dialog-content class="form-grid">
        <mat-form-field appearance="outline" class="col-2">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" maxlength="150" />
          @if (form.controls.nombre.hasError('required')) {
            <mat-error>El nombre es obligatorio</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="col-2">
          <mat-label>Descripción (opcional)</mat-label>
          <textarea matInput formControlName="descripcion" rows="2"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Precio de compra (costo)</mat-label>
          <span matTextPrefix>$&nbsp;</span>
          <input matInput type="number" min="0" step="1" formControlName="precio_compra" />
          @if (form.controls.precio_compra.hasError('min')) {
            <mat-error>Debe ser mayor o igual a 0</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Precio de venta</mat-label>
          <span matTextPrefix>$&nbsp;</span>
          <input matInput type="number" min="0" step="1" formControlName="precio_venta" />
          @if (form.controls.precio_venta.hasError('required')) {
            <mat-error>El precio de venta es obligatorio</mat-error>
          }
          @if (form.controls.precio_venta.hasError('min')) {
            <mat-error>Debe ser mayor o igual a 0</mat-error>
          }
        </mat-form-field>

        <!-- Ganancia unitaria estimada -->
        <div class="ganancia col-2" [class.negativa]="ganancia() < 0">
          <span>Ganancia unitaria</span>
          <strong>
            {{ ganancia() | currency: 'COP' : 'symbol-narrow' : '1.0-2' }}
            @if (margen() !== null) {
              <span class="margen">({{ margen() }}%)</span>
            }
          </strong>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Stock</mat-label>
          <input matInput type="number" min="0" step="1" formControlName="stock" />
          @if (form.controls.stock.hasError('min')) {
            <mat-error>No puede ser negativo</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Categoría</mat-label>
          <mat-select formControlName="categoria_id">
            @for (cat of data.categorias; track cat.id) {
              <mat-option [value]="cat.id">{{ cat.nombre }}</mat-option>
            }
          </mat-select>
          @if (form.controls.categoria_id.hasError('required')) {
            <mat-error>Selecciona una categoría</mat-error>
          }
        </mat-form-field>

        <mat-slide-toggle formControlName="activo" class="col-2">
          Producto activo
        </mat-slide-toggle>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
          Guardar
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px 16px;
        min-width: 480px;
      }
      .col-2 {
        grid-column: 1 / -1;
      }
      mat-form-field {
        width: 100%;
      }
      mat-slide-toggle {
        margin: 8px 0 4px;
      }
      .ganancia {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 14px;
        margin: 0 0 8px;
        border-radius: 12px;
        background: #f2ffb8;
        color: #16181d;
        font-size: 0.9rem;

        strong {
          font-size: 1rem;
        }
        .margen {
          font-weight: 500;
          opacity: 0.75;
          margin-left: 4px;
        }
      }
      .ganancia.negativa {
        background: #fdecea;
        color: #c62828;
      }
      @media (max-width: 560px) {
        .form-grid {
          grid-template-columns: 1fr;
          min-width: 260px;
        }
      }
    `,
  ],
})
export class ProductoFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ProductoFormComponent>);
  readonly data = inject<ProductoFormData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    nombre: [
      this.data.producto?.nombre ?? '',
      [Validators.required, Validators.maxLength(150)],
    ],
    descripcion: [this.data.producto?.descripcion ?? ''],
    precio_compra: [
      this.data.producto ? Number(this.data.producto.precio_compra) : 0,
      [Validators.required, Validators.min(0)],
    ],
    precio_venta: [
      this.data.producto ? Number(this.data.producto.precio_venta) : 0,
      [Validators.required, Validators.min(0)],
    ],
    stock: [this.data.producto?.stock ?? 0, [Validators.min(0)]],
    activo: [this.data.producto?.activo ?? true],
    categoria_id: [
      this.data.producto?.categoria_id ?? (null as number | null),
      [Validators.required],
    ],
  });

  private readonly formValue = signal(this.form.getRawValue());

  readonly ganancia = computed(
    () => this.formValue().precio_venta - this.formValue().precio_compra
  );

  readonly margen = computed(() => {
    const { precio_venta, precio_compra } = this.formValue();
    if (!precio_venta) return null;
    return Math.round(((precio_venta - precio_compra) / precio_venta) * 100);
  });

  constructor() {
    this.form.valueChanges.subscribe(() =>
      this.formValue.set(this.form.getRawValue())
    );
  }

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const payload: ProductoCreate = {
      nombre: v.nombre,
      descripcion: v.descripcion?.trim() ? v.descripcion : null,
      precio_compra: v.precio_compra,
      precio_venta: v.precio_venta,
      stock: v.stock,
      activo: v.activo,
      categoria_id: v.categoria_id as number,
    };
    this.dialogRef.close(payload);
  }
}
