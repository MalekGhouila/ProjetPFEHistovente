import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Magasin {
  idMagasin: number;
  magasin: string;
  code: string;
  etat: number;
  isBoutique: number;
  idPays: number;
  idCategorie: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class MagasinService {

  private apiUrl = 'http://localhost:8080/api/magasins';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getPaginated(
    search: string = '',
    page: number = 0,
    size: number = 10,
    sortField: string = 'idMagasin',
    sortDir: string = 'asc'
  ): Observable<PageResponse<Magasin>> {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sortField)
      .set('direction', sortDir);
    return this.http.get<PageResponse<Magasin>>(this.apiUrl, { params });
  }

  create(magasin: Partial<Magasin>): Observable<Magasin> {
    return this.http.post<Magasin>(this.apiUrl, magasin);
  }

  update(id: number, magasin: Partial<Magasin>): Observable<Magasin> {
    return this.http.put<Magasin>(`${this.apiUrl}/${id}`, magasin);
  }

  toggleEtat(id: number): Observable<Magasin> {
    return this.http.patch<Magasin>(`${this.apiUrl}/${id}/toggle-etat`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
