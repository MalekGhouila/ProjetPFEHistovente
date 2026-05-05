import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataQualityService {

  private apiUrl = 'http://localhost:8080/api/data-quality';

  constructor(private http: HttpClient) {}

  getRawStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/raw-stats`);
  }

  refresh(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/refresh`, {});
  }

  getStatus(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/status`);
  }
}
