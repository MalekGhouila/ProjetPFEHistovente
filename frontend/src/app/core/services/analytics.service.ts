import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private apiUrl = 'http://localhost:8080/api/analytics';

  constructor(private http: HttpClient) {}

  getKpis(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/kpis`);
  }

  getMonthlySales(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/monthly-sales`);
  }

  getTopStores(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/top-stores`);
  }

  getSalesByFamily(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sales-by-family`);
  }

  refresh(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/refresh`, {});
  }

  getRefreshStatus(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/refresh-status`);
  }
}
