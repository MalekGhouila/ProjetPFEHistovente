import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StagingRow {
  idStaging: number;
  stagingImportedAt: string;
  stagingStatus: 'PENDING' | 'CLEANED' | 'REJECTED';
  stagingRejectReason: string | null;
  codeMag: string;
  dateVente: string;
  famille: string;
  designation: string;
  couleur: string;
  libTaille: string;
  quantite: number;
  prixVente: number;
  total: number;
  typeVente: string;
  saison: string;
  pays: string;
  ville: string;
  region: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface StatusCounts {
  PENDING: number;
  CLEANED: number;
  REJECTED: number;
}

@Injectable({ providedIn: 'root' })
export class StagingService {
  private baseUrl = 'http://localhost:8080/api/analyst/staging';

  constructor(private http: HttpClient) {}

  getStaging(
    status: string = '',
    codeMag: string = '',
    famille: string = '',
    page: number = 0,
    size: number = 50
  ): Observable<PageResponse<StagingRow>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'idStaging')
      .set('direction', 'desc');
    if (status)  params = params.set('status', status);
    if (codeMag) params = params.set('codeMag', codeMag);
    if (famille) params = params.set('famille', famille);
    return this.http.get<PageResponse<StagingRow>>(this.baseUrl, { params });
  }

  getCounts(): Observable<StatusCounts> {
    return this.http.get<StatusCounts>(`${this.baseUrl}/counts`);
  }
}
