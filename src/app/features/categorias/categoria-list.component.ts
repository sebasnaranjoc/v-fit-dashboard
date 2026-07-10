import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Categoria } from '../../core/models';
import { CategoriaService } from '../../core/services/categoria.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/confirm-dialog/confirm-dialog.component';
import { CategoriaFormComponent } from './categoria-form.component';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  templateUrl: './categoria-list.component.html',
  styleUrls: ['../shared-list.scss'],
})
export class CategoriaListComponent implements OnInit {
  private readonly service = inject(CategoriaService);
  private readonly dialog = inject(MatDialog);
  private readonly notifier = inject(NotificationService);

  readonly categorias = signal<Categoria[]>([]);
  readonly loading = signal(false);
  readonly columns = ['id', 'nombre', 'acciones'];

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.service.listar().subscribe({
      next: (data) => {
        this.categorias.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  nueva(): void {
    const ref = this.dialog.open(CategoriaFormComponent, { data: null });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.service.crear(result).subscribe(() => {
        this.notifier.success('Categoría creada');
        this.cargar();
      });
    });
  }

  editar(categoria: Categoria): void {
    const ref = this.dialog.open(CategoriaFormComponent, { data: categoria });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.service.actualizar(categoria.id, result).subscribe(() => {
        this.notifier.success('Categoría actualizada');
        this.cargar();
      });
    });
  }

  eliminar(categoria: Categoria): void {
    const data: ConfirmDialogData = {
      title: 'Eliminar categoría',
      message: `¿Eliminar "${categoria.nombre}"? Esta acción no se puede deshacer.`,
      danger: true,
      confirmText: 'Eliminar',
    };
    this.dialog
      .open(ConfirmDialogComponent, { data })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.service.eliminar(categoria.id).subscribe(() => {
          this.notifier.success('Categoría eliminada');
          this.cargar();
        });
      });
  }
}
