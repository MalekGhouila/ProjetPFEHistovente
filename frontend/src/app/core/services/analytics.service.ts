import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private apiUrl = 'http://localhost:8080/api/analytics';

  constructor(private http: HttpClient) {}

  // ===== GLOBAL KPIs =====
  getKpis(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/kpis`);
  }

  // ===== MONTHLY SALES =====
  getMonthlySales(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/monthly-sales`);
  }

  // ===== TOP STORES =====
  getTopStores(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/top-stores`);
  }

  // ===== SALES BY FAMILY =====
  getSalesByFamily(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sales-by-family`);
  }

  // ===== DATA QUALITY =====
  getDataQuality(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/data-quality`);
  }

  getMissingByColumn(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.apiUrl}/missing-by-column`);
  }

  // ===== RECORDS PER MONTH (optional year param) =====
  getRecordsPerMonth(year?: number): Observable<any[]> {
    const params = year != null
      ? new HttpParams().set('year', year.toString())
      : new HttpParams();
    return this.http.get<any[]>(`${this.apiUrl}/records-per-month`, { params });
  }

  // ===== AVAILABLE YEARS =====
  getAvailableYears(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/available-years`);
  }

  // ===== RECORDS PER YEAR =====
  getRecordsPerYear(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/records-per-year`);
  }

  // ===== FILTERED ANALYTICS =====
  getFilteredAnalytics(
    famille?: string,
    saison?: string,
    codeMag?: string
  ): Observable<any> {
    let params = new HttpParams();
    if (famille)  params = params.set('famille',  famille);
    if (saison)   params = params.set('saison',   saison);
    if (codeMag)  params = params.set('codeMag',  codeMag);
    return this.http.get<any>(`${this.apiUrl}/filtered`, { params });
  }

  // ===== STORE KPIs =====
  getStoreKpis(storeId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/store-kpis/${storeId}`);
  }

  // ===== REFRESH ANALYTICS =====
  refresh(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/refresh`, {});
  }

  getRefreshStatus(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/refresh-status`);
  }

  // ===== REFRESH QUALITY =====
  refreshQuality(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/refresh-quality`, {});
  }

  getQualityStatus(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/quality-status`);
  }
}
