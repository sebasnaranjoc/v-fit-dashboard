import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Producto, ProductoCreate, ProductoUpdate } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/productos`;

  listar(skip = 0, limit = 100): Observable<Producto[]> {
    const params = new HttpParams()
      .set('skip', skip)
      .set('limit', limit);
    return this.http.get<Producto[]>(this.baseUrl, { params });
  }

  obtener(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/${id}`);
  }

  crear(data: ProductoCreate): Observable<Producto> {
    return this.http.post<Producto>(this.baseUrl, data);
  }

  actualizar(id: number, data: ProductoUpdate): Observable<Producto> {
    return this.http.put<Producto>(`${this.baseUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
