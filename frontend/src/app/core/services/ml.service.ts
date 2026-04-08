import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface PredictRequest {
  famille: string;
  year: number;
  week_of_year: number;
  lag1: number;
  lag2: number;
  lag4: number;
  lag52: number;
  rollingMean4: number;
  rollingMean12: number;
}

export interface PredictResponse {
  famille: string;
  year: number;
  week_of_year: number;
  predicted_quantity: number;
}

export interface ModelStatus {
  status: string;
  model_name: string;
  wmape: number;
  r2: number;
  last_trained: string;
  families_supported: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MlService {

  private apiUrl = 'http://localhost:8080/api/ml';

  constructor(private http: HttpClient) {}

  predict(request: PredictRequest): Observable<PredictResponse> {
    return this.http.post<PredictResponse>(`${this.apiUrl}/predict`, request);
  }

  getStatus(): Observable<ModelStatus> {
    return this.http.get<ModelStatus>(`${this.apiUrl}/status`);
  }
}
