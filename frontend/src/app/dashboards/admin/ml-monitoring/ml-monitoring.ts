import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import {
  MlService,
  ModelStatus,
  GlobalComparisonResult,
  FamilleAccuracyRow,
  FamilyModelConfig,
  PipelineStatus
} from '../../../core/services/ml.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-ml-monitoring',
  standalone: true,
  imports: [CommonModule, TagModule],
  templateUrl: './ml-monitoring.html',
  styleUrl: './ml-monitoring.css'
})
export class MlMonitoring implements OnInit {
  Math = Math;

  modelStatus: ModelStatus | null = null;
  globalResults: GlobalComparisonResult[] = [];
  perFamilleResults: FamilleAccuracyRow[] = [];
  activeConfig: FamilyModelConfig = {};
  pipelineStatus: PipelineStatus | null = null;

  isLoading = true;
  error = false;

  modelNames = ['XGBoost', 'LightGBM', 'CatBoost', 'RandomForest', 'LinearRegression'];

  constructor(private mlService: MlService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    forkJoin({
      status:      this.mlService.getStatus().pipe(catchError(() => of(null))),
      global:      this.mlService.getGlobalComparison().pipe(catchError(() => of([]))),
      perFamille:  this.mlService.getPerFamilleResults().pipe(catchError(() => of([]))),
      config:      this.mlService.getActiveConfig().pipe(catchError(() => of({}))),
      pipeline:    this.mlService.getPipelineStatus().pipe(catchError(() => of(null))),
    }).subscribe(({ status, global, perFamille, config, pipeline }) => {
      this.modelStatus      = status as ModelStatus | null;
      this.globalResults    = global as GlobalComparisonResult[];
      this.perFamilleResults = perFamille as FamilleAccuracyRow[];
      this.activeConfig     = config as FamilyModelConfig;
      this.pipelineStatus   = pipeline as PipelineStatus | null;
      this.isLoading        = false;
      this.error            = !this.modelStatus;
      this.cdr.detectChanges();
    });
  }

  getStatusSeverity(): 'success' | 'danger' {
    return this.modelStatus?.status === 'healthy' ? 'success' : 'danger';
  }

  getWmapeSeverity(wmape: number): 'success' | 'warn' | 'danger' {
    if (wmape < 50) return 'success';
    if (wmape < 75) return 'warn';
    return 'danger';
  }

  getAccuracySeverity(acc: number): 'success' | 'warn' | 'danger' {
    if (acc >= 80) return 'success';
    if (acc >= 60) return 'warn';
    return 'danger';
  }

  getPipelineBadge(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    if (status === 'done') return 'success';
    if (status === 'running') return 'warn';
    if (status === 'error') return 'danger';
    return 'secondary';
  }

  getFamilleValue(row: FamilleAccuracyRow, model: string): number {
    return (row as any)[model] ?? 0;
  }

  formatDate(val: string | null): string {
    if (!val) return '—';
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  }

  getBestModelForFamille(famille: string): string {
    return this.activeConfig[famille] ?? '—';
  }
}
