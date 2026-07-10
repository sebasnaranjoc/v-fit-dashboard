import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Cliente } from '../../core/models';
import { ClienteService } from '../../core/services/cliente.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/confirm-dialog/confirm-dialog.component';
import { ClienteFormComponent } from './cliente-form.component';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  templateUrl: './cliente-list.component.html',
  styleUrls: ['../shared-list.scss'],
})
export class ClienteListComponent implements OnInit {
  private readonly service = inject(ClienteService);
  private readonly dialog = inject(MatDialog);
  private readonly notifier = inject(NotificationService);

  readonly clientes = signal<Cliente[]>([]);
  readonly loading = signal(false);
  readonly columns = ['id', 'nombre', 'email', 'telefono', 'creado_en', 'acciones'];

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.service.listar().subscribe({
      next: (data) => {
        this.clientes.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  nuevo(): void {
    this.dialog
      .open(ClienteFormComponent, { data: null })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;
        this.service.crear(result).subscribe(() => {
          this.notifier.success('Cliente creado');
          this.cargar();
        });
      });
  }

  editar(cliente: Cliente): void {
    this.dialog
      .open(ClienteFormComponent, { data: cliente })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;
        this.service.actualizar(cliente.id, result).subscribe(() => {
          this.notifier.success('Cliente actualizado');
          this.cargar();
        });
      });
  }

  eliminar(cliente: Cliente): void {
    const data: ConfirmDialogData = {
      title: 'Eliminar cliente',
      message: `¿Eliminar a "${cliente.nombre}"?`,
      danger: true,
      confirmText: 'Eliminar',
    };
    this.dialog
      .open(ConfirmDialogComponent, { data })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.service.eliminar(cliente.id).subscribe(() => {
          this.notifier.success('Cliente eliminado');
          this.cargar();
        });
      });
  }
}
