import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Compra, CompraCreate } from '../models';

@Injectable({ providedIn: 'root' })
export class CompraService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/compras`;

  listar(): Observable<Compra[]> {
    return this.http.get<Compra[]>(this.baseUrl);
  }

  obtener(id: number): Observable<Compra> {
    return this.http.get<Compra>(`${this.baseUrl}/${id}`);
  }

  crear(data: CompraCreate): Observable<Compra> {
    return this.http.post<Compra>(this.baseUrl, data);
  }
}
