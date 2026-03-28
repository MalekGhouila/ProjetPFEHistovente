import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreAnalyticsService {

  private apiUrl = 'http://localhost:8080/api/store-analytics';

  constructor(private http: HttpClient) {}

  getKpis(storeId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${storeId}/kpis`);
  }

  getMonthlySales(storeId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${storeId}/monthly-sales`);
  }

  getSalesByFamily(storeId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${storeId}/sales-by-family`);
  }

  getStatus(storeId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${storeId}/status`);
  }

  calculate(storeId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${storeId}/calculate`, {});
  }
}
