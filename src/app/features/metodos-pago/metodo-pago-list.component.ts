import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MetodoPago } from '../../core/models';
import { MetodoPagoService } from '../../core/services/metodo-pago.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/confirm-dialog/confirm-dialog.component';
import { MetodoPagoFormComponent } from './metodo-pago-form.component';

@Component({
  selector: 'app-metodo-pago-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  templateUrl: './metodo-pago-list.component.html',
  styleUrls: ['../shared-list.scss', './metodo-pago-list.component.scss'],
})
export class MetodoPagoListComponent implements OnInit {
  private readonly service = inject(MetodoPagoService);
  private readonly dialog = inject(MatDialog);
  private readonly notifier = inject(NotificationService);

  readonly metodos = signal<MetodoPago[]>([]);
  readonly loading = signal(false);
  readonly columns = ['id', 'nombre', 'activo', 'acciones'];

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.service.listar().subscribe({
      next: (data) => {
        this.metodos.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  nuevo(): void {
    this.dialog
      .open(MetodoPagoFormComponent, { data: null })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;
        this.service.crear(result).subscribe(() => {
          this.notifier.success('Método de pago creado');
          this.cargar();
        });
      });
  }

  editar(metodo: MetodoPago): void {
    this.dialog
      .open(MetodoPagoFormComponent, { data: metodo })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;
        this.service.actualizar(metodo.id, result).subscribe(() => {
          this.notifier.success('Método de pago actualizado');
          this.cargar();
        });
      });
  }

  eliminar(metodo: MetodoPago): void {
    const data: ConfirmDialogData = {
      title: 'Eliminar método de pago',
      message: `¿Eliminar "${metodo.nombre}"? No podrás eliminarlo si ya tiene compras asociadas.`,
      danger: true,
      confirmText: 'Eliminar',
    };
    this.dialog
      .open(ConfirmDialogComponent, { data })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.service.eliminar(metodo.id).subscribe(() => {
          this.notifier.success('Método de pago eliminado');
          this.cargar();
        });
      });
  }
}
