import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MetodoPago } from '../../core/models';

@Component({
  selector: 'app-metodo-pago-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data ? 'Editar método de pago' : 'Nuevo método de pago' }}
    </h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-dialog-content class="form-col">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" maxlength="50" autofocus />
          @if (form.controls.nombre.hasError('required')) {
            <mat-error>El nombre es obligatorio</mat-error>
          }
        </mat-form-field>
        <mat-slide-toggle formControlName="activo">Activo</mat-slide-toggle>
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
      .form-col {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 320px;
      }
      .full {
        width: 100%;
      }
    `,
  ],
})
export class MetodoPagoFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<MetodoPagoFormComponent>);
  readonly data = inject<MetodoPago | null>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    nombre: [
      this.data?.nombre ?? '',
      [Validators.required, Validators.maxLength(50)],
    ],
    activo: [this.data?.activo ?? true],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue());
  }
}
