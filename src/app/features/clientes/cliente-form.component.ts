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
import { Cliente } from '../../core/models';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar cliente' : 'Nuevo cliente' }}</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-dialog-content class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" maxlength="150" />
          @if (form.controls.nombre.hasError('required')) {
            <mat-error>El nombre es obligatorio</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" />
          @if (form.controls.email.hasError('required')) {
            <mat-error>El email es obligatorio</mat-error>
          }
          @if (form.controls.email.hasError('email')) {
            <mat-error>Email no válido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Teléfono (opcional)</mat-label>
          <input matInput formControlName="telefono" maxlength="30" />
        </mat-form-field>
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
        display: flex;
        flex-direction: column;
        min-width: 360px;
      }
      mat-form-field {
        width: 100%;
      }
    `,
  ],
})
export class ClienteFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ClienteFormComponent>);
  readonly data = inject<Cliente | null>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    nombre: [this.data?.nombre ?? '', [Validators.required, Validators.maxLength(150)]],
    email: [this.data?.email ?? '', [Validators.required, Validators.email]],
    telefono: [this.data?.telefono ?? ''],
  });

  submit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.dialogRef.close({
      ...value,
      telefono: value.telefono?.trim() ? value.telefono : null,
    });
  }
}
