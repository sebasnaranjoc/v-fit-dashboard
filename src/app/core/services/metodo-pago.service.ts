import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MetodoPago, MetodoPagoCreate, MetodoPagoUpdate } from '../models';

@Injectable({ providedIn: 'root' })
export class MetodoPagoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/metodos-pago`;

  listar(): Observable<MetodoPago[]> {
    return this.http.get<MetodoPago[]>(this.baseUrl);
  }

  obtener(id: number): Observable<MetodoPago> {
    return this.http.get<MetodoPago>(`${this.baseUrl}/${id}`);
  }

  crear(data: MetodoPagoCreate): Observable<MetodoPago> {
    return this.http.post<MetodoPago>(this.baseUrl, data);
  }

  actualizar(id: number, data: MetodoPagoUpdate): Observable<MetodoPago> {
    return this.http.put<MetodoPago>(`${this.baseUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
