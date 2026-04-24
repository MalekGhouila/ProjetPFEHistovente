import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Famille {
  idArFamille: number;
  code: string;
  famille: string;
  etat: boolean;
  type?: number;
  codeDouane?: string;
  saisonObligatoire?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class FamilleService {
  private apiUrl = 'http://localhost:8080/api/familles';

  constructor(private http: HttpClient) {}

  // For dropdowns / other pages that still use the full list
  getAll(): Observable<Famille[]> {
    return this.http.get<Famille[]>(`${this.apiUrl}/all`);
  }

  // Paginated + searchable (used by manager table)
  getPaginated(
    search: string = '',
    page: number = 0,
    size: number = 10,
    sort: string = 'idArFamille',
    direction: string = 'asc'
  ): Observable<PageResponse<Famille>> {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort)
      .set('direction', direction);
    return this.http.get<PageResponse<Famille>>(this.apiUrl, { params });
  }

  create(famille: Partial<Famille>): Observable<Famille> {
    return this.http.post<Famille>(this.apiUrl, famille);
  }

  update(id: number, famille: Partial<Famille>): Observable<Famille> {
    return this.http.put<Famille>(`${this.apiUrl}/${id}`, famille);
  }

  toggleEtat(id: number): Observable<Famille> {
    return this.http.patch<Famille>(`${this.apiUrl}/${id}/toggle-etat`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
