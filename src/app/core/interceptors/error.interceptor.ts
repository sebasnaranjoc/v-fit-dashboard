import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

/**
 * Traduce los errores HTTP (incluidos los 422 de validación de FastAPI)
 * a mensajes legibles y los muestra en un snackbar.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifier = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      notifier.error(buildMessage(error));
      return throwError(() => error);
    })
  );
};

function buildMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. ¿Está el backend en línea?';
  }

  const detail = error.error?.detail;

  // 422: FastAPI devuelve un arreglo de errores de validación.
  if (Array.isArray(detail)) {
    return detail
      .map((d) => {
        const campo = Array.isArray(d.loc) ? d.loc.slice(1).join('.') : '';
        return campo ? `${campo}: ${d.msg}` : d.msg;
      })
      .join(' · ');
  }

  if (typeof detail === 'string') {
    return detail;
  }

  return `Error ${error.status}: ${error.statusText || 'inesperado'}`;
}
