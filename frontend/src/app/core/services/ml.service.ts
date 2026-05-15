import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ─── INTERFACES ───────────────────────────────────────────────────────────────

export interface PredictRequest {
  famille:      string;
  code_mag:     string;
  year:         number;
  week_of_year: number;
  is_soldes?:   number;
}

export interface PredictResponse {
  famille:            string;
  code_mag:           string;
  year:               number;
  week_of_year:       number;
  predicted_quantity: number;
  model_used:         string;
  accuracy:           number;
  warning_level:      'none' | 'yellow' | 'red';
  warning_message:    string;
}

export interface ModelStatus {
  status:             string;
  best_model:         string;
  accuracy:           number;
  wmape:              number;
  r2:                 number;
  last_trained:       string;
  families_supported: string[];
}

export interface GlobalComparisonResult {
  model:        string;
  accuracy:     number;
  wmape:        number;
  r2:           number;
  rmse:         number;
  train_time_s: number;
}

export interface FamilleAccuracyRow {
  famille:           string;
  XGBoost?:          number;
  LightGBM?:         number;
  CatBoost?:         number;
  RandomForest?:     number;
  LinearRegression?: number;
}

export interface FamilyModelConfig {
  [famille: string]: string;
}

// Stores now include both code and display name
export interface StoreItem {
  code: string;
  name: string;
}

export interface StoresResponse {
  stores: StoreItem[];
}

// ─── Pipeline interfaces ──────────────────────────────────────────────────────

export interface CleanState {
  status:       'idle' | 'running' | 'done' | 'error';
  last_run:     string | null;
  rows_cleaned: number | null;
  message:      string;
}

export interface TrainState {
  status:       'idle' | 'running' | 'done' | 'error';
  last_run:     string | null;
  progress_pct: number;
  message:      string;
}

export interface DeployState {
  last_deployed: string | null;
  families:      number;
}

export interface PipelineStatus {
  clean:  CleanState;
  train:  TrainState;
  deploy: DeployState;
}

export interface TrainStatusResponse {
  status:       'idle' | 'running' | 'done' | 'error';
  progress_pct: number;
  message:      string;
  last_run:     string | null;
}

// ─── SERVICE ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class MlService {
  private mlApi = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  // ─── Core prediction & metadata ────────────────────────────────────────────

  getStatus(): Observable<ModelStatus> {
    return this.http.get<ModelStatus>(`${this.mlApi}/model/status`);
  }

  predict(request: PredictRequest): Observable<PredictResponse> {
    return this.http.post<PredictResponse>(`${this.mlApi}/predict`, request);
  }

  getFamilies(): Observable<{ families: string[] }> {
    return this.http.get<{ families: string[] }>(`${this.mlApi}/families`);
  }

  getStores(): Observable<StoresResponse> {
    return this.http.get<StoresResponse>(`${this.mlApi}/stores`);
  }

  // ─── Model comparison / deploy config ─────────────────────────────────────

  getGlobalComparison(): Observable<GlobalComparisonResult[]> {
    return this.http.get<GlobalComparisonResult[]>(`${this.mlApi}/train/results/global`);
  }

  getPerFamilleResults(): Observable<FamilleAccuracyRow[]> {
    return this.http.get<FamilleAccuracyRow[]>(`${this.mlApi}/train/results/per-famille`);
  }

  getActiveConfig(): Observable<FamilyModelConfig> {
    return this.http.get<FamilyModelConfig>(`${this.mlApi}/models/config`);
  }

  deployConfig(config: FamilyModelConfig): Observable<any> {
    const payload = {
      config: Object.entries(config).map(([famille, model_name]) => ({ famille, model_name }))
    };
    return this.http.post(`${this.mlApi}/models/deploy`, payload);
  }

  // ─── Pipeline control/status ───────────────────────────────────────────────

  /** GET /pipeline/status — full clean + train + deploy state */
  getPipelineStatus(): Observable<PipelineStatus> {
    return this.http.get<PipelineStatus>(`${this.mlApi}/pipeline/status`);
  }

  /** POST /data/clean — trigger feature engineering */
  runClean(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.mlApi}/data/clean`, {});
  }

  /** POST /train — trigger model_comparison.py (all models) */
  runTrain(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.mlApi}/train`, {});
  }

  /** GET /train/status — poll during training for progress + message */
  getTrainStatus(): Observable<TrainStatusResponse> {
    return this.http.get<TrainStatusResponse>(`${this.mlApi}/train/status`);
  }
}
