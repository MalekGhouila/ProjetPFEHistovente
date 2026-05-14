import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import {
  MlService,
  ModelStatus,
  GlobalComparisonResult,
  FamilleAccuracyRow,
  FamilyModelConfig,
  PipelineStatus,
  TrainStatusResponse
} from '../../../core/services/ml.service';
import { interval, Subscription } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-ml-evolution',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ChartModule, TableModule, TagModule,
    ButtonModule, SelectModule, ToastModule,
    ProgressBarModule
  ],
  providers: [MessageService],
  templateUrl: './ml-evolution.html',
  styleUrl: './ml-evolution.css'
})
export class MlEvolution implements OnInit, OnDestroy {

  // ── Tab state ──────────────────────────────────────────────────────────────
  activeTab: 'pipeline' | 'comparison' | 'config' = 'pipeline';

  // ── Model status KPIs ──────────────────────────────────────────────────────
  modelStatus: ModelStatus | null = null;
  isLoadingStatus = true;

  // ── Global comparison ──────────────────────────────────────────────────────
  globalResults: GlobalComparisonResult[] = [];
  comparisonChartData: any;
  comparisonChartOptions: any;
  isLoadingGlobal = true;

  // ── Per-famille table ──────────────────────────────────────────────────────
  familleResults: FamilleAccuracyRow[] = [];
  isLoadingFamille = true;

  // ── Deploy config ──────────────────────────────────────────────────────────
  activeConfig: FamilyModelConfig = {};
  editableConfig: { famille: string; model: string }[] = [];
  isLoadingConfig = true;
  isSaving = false;
  deploySuccessMessage = '';

  readonly modelOptions = [
    { label: 'XGBoost',           value: 'xgboost' },
    { label: 'LightGBM',          value: 'lightgbm' },
    { label: 'CatBoost',          value: 'catboost' },
    { label: 'Random Forest',     value: 'randomforest' },
    { label: 'Linear Regression', value: 'linearregression' },
  ];

  // ── Pipeline state ─────────────────────────────────────────────────────────
  pipelineStatus: PipelineStatus | null = null;
  isLoadingPipeline = true;

  isCleanRunning  = false;
  isTrainRunning  = false;
  trainProgress   = 0;
  trainMessage    = '';

  private trainPollSub: Subscription | null = null;

  constructor(
    private mlService: MlService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadStatus();
    this.loadGlobalComparison();
    this.loadFamilleResults();
    this.loadConfig();
    this.loadPipelineStatus();
  }

  ngOnDestroy() {
    this.stopTrainPolling();
  }

  // ── Loaders ────────────────────────────────────────────────────────────────

  loadStatus() {
    this.mlService.getStatus().subscribe({
      next: (s) => { this.modelStatus = s; this.isLoadingStatus = false; this.cdr.detectChanges(); },
      error: ()  => { this.isLoadingStatus = false; this.cdr.detectChanges(); }
    });
  }

  loadGlobalComparison() {
    this.mlService.getGlobalComparison().subscribe({
      next: (data) => {
        this.globalResults = data;
        this.buildComparisonChart(data);
        this.isLoadingGlobal = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoadingGlobal = false; this.cdr.detectChanges(); }
    });
  }

  loadFamilleResults() {
    this.mlService.getPerFamilleResults().subscribe({
      next: (data) => {
        this.familleResults = data;
        this.isLoadingFamille = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoadingFamille = false; this.cdr.detectChanges(); }
    });
  }

  loadConfig() {
    this.mlService.getActiveConfig().subscribe({
      next: (config) => {
        this.activeConfig = config;
        this.editableConfig = Object.entries(config).map(([famille, model]) => ({ famille, model }));
        this.isLoadingConfig = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoadingConfig = false; this.cdr.detectChanges(); }
    });
  }

  loadPipelineStatus() {
    this.isLoadingPipeline = true;
    this.mlService.getPipelineStatus().subscribe({
      next: (status) => {
        this.pipelineStatus = status;
        this.isLoadingPipeline = false;

        // If server restarted mid-train, resume polling
        if (status.train.status === 'running') {
          this.isTrainRunning = true;
          this.trainProgress  = status.train.progress_pct;
          this.trainMessage   = status.train.message;
          this.startTrainPolling();
        }

        // If server restarted mid-clean, reflect state
        if (status.clean.status === 'running') {
          this.isCleanRunning = true;
        }

        this.cdr.detectChanges();
      },
      error: () => { this.isLoadingPipeline = false; this.cdr.detectChanges(); }
    });
  }

  // ── Pipeline actions ───────────────────────────────────────────────────────

  runClean() {
    this.isCleanRunning = true;
    this.mlService.runClean().subscribe({
      next: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cleaning Started',
          detail: 'feature_engineering_v3.py is running...'
        });

        const cleanPoll = interval(3000).pipe(
          switchMap(() => this.mlService.getPipelineStatus()),
          takeWhile(s => s.clean.status === 'running', true)
        ).subscribe({
          next: (s) => {
            this.pipelineStatus = s;
            if (s.clean.status !== 'running') {
              this.isCleanRunning = false;
              if (s.clean.status === 'done') {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Cleaning Done',
                  detail: s.clean.rows_cleaned
                    ? `${s.clean.rows_cleaned.toLocaleString()} rows processed.`
                    : 'Feature engineering completed.'
                });
              } else if (s.clean.status === 'error') {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Cleaning Failed',
                  detail: s.clean.message || 'Unknown error'
                });
              }
              cleanPoll.unsubscribe();
            }
            this.cdr.detectChanges();
          },
          error: () => { this.isCleanRunning = false; this.cdr.detectChanges(); }
        });
      },
      error: () => {
        this.isCleanRunning = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Clean Failed',
          detail: 'Could not start cleaning. Is the ML API running?'
        });
        this.cdr.detectChanges();
      }
    });
  }

  runTrain() {
    this.isTrainRunning = true;
    this.trainProgress  = 5;
    this.trainMessage   = 'Starting training...';

    this.mlService.runTrain().subscribe({
      next: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Training Started',
          detail: 'model_comparison.py is running. This may take several minutes.'
        });
        this.startTrainPolling();
      },
      error: () => {
        this.isTrainRunning = false;
        this.trainProgress  = 0;
        this.trainMessage   = '';
        this.messageService.add({
          severity: 'error',
          summary: 'Train Failed',
          detail: 'Could not start training. Is the ML API running?'
        });
        this.cdr.detectChanges();
      }
    });
  }

  // ── Train polling ──────────────────────────────────────────────────────────

  private startTrainPolling() {
    this.stopTrainPolling();

    this.trainPollSub = interval(2000).pipe(
      switchMap(() => this.mlService.getTrainStatus()),
      takeWhile((s: TrainStatusResponse) => s.status === 'running', true)
    ).subscribe({
      next: (s: TrainStatusResponse) => {
        this.trainProgress = s.progress_pct;
        this.trainMessage  = s.message;

        if (s.status === 'done') {
          this.isTrainRunning = false;
          this.trainProgress  = 100;
          this.messageService.add({
            severity: 'success',
            summary: 'Training Complete',
            detail: 'All models trained. Reload results to see updated metrics.'
          });
          this.loadStatus();
          this.loadGlobalComparison();
          this.loadFamilleResults();
          this.loadConfig();
          this.loadPipelineStatus();
        }

        if (s.status === 'error') {
          this.isTrainRunning = false;
          this.trainProgress  = 0;
          this.messageService.add({
            severity: 'error',
            summary: 'Training Failed',
            detail: s.message || 'Unknown error during training.'
          });
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.isTrainRunning = false;
        this.stopTrainPolling();
        this.cdr.detectChanges();
      }
    });
  }

  private stopTrainPolling() {
    if (this.trainPollSub) {
      this.trainPollSub.unsubscribe();
      this.trainPollSub = null;
    }
  }

  // ── Chart builder ──────────────────────────────────────────────────────────

  buildComparisonChart(data: GlobalComparisonResult[]) {
    const best = Math.max(...data.map(d => d.accuracy));
    this.comparisonChartData = {
      labels: data.map(d => d.model),
      datasets: [{
        label: 'Accuracy %',
        data: data.map(d => d.accuracy),
        backgroundColor: data.map(d =>
          d.accuracy === best
            ? 'rgba(46, 204, 113, 0.85)'
            : 'rgba(59, 130, 246, 0.55)'
        ),
        borderWidth: 1
      }]
    };
    this.comparisonChartOptions = {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true, max: 100,
          ticks: { callback: (v: number) => v + '%' }
        }
      }
    };
  }

  // ── Deploy ─────────────────────────────────────────────────────────────────

  saveConfig() {
    this.isSaving = true;
    this.deploySuccessMessage = '';

    const config: FamilyModelConfig = {};
    this.editableConfig.forEach(row => config[row.famille] = row.model);

    this.mlService.deployConfig(config).subscribe({
      next: () => {
        this.isSaving = false;
        this.activeConfig = { ...config };
        this.deploySuccessMessage = `Configuration deployed successfully for ${this.editableConfig.length} families.`;
        this.loadPipelineStatus();

        this.messageService.add({
          severity: 'success',
          summary: 'Config Deployed',
          detail: `${this.editableConfig.length} families updated successfully.`
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSaving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Deploy Failed',
          detail: 'Could not save configuration. Is the ML API running?'
        });
        this.cdr.detectChanges();
      }
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  hasConfigChanges(): boolean {
    return this.getChangedCount() > 0;
  }

  getChangedCount(): number {
    return this.editableConfig.filter(
      row => (this.activeConfig[row.famille] ?? '') !== row.model
    ).length;
  }

  getAccuracyClass(val: number | undefined): string {
    if (val === undefined || val === null) return '';
    if (val >= 60) return 'accuracy-good';
    if (val >= 40) return 'accuracy-warn';
    return 'accuracy-bad';
  }

  getAccuracySeverity(val: number): 'success' | 'warn' | 'danger' {
    if (val >= 60) return 'success';
    if (val >= 40) return 'warn';
    return 'danger';
  }

  getBestModelForFamille(row: FamilleAccuracyRow): string {
    const models = ['XGBoost', 'LightGBM', 'CatBoost', 'RandomForest', 'LinearRegression'];
    let best = '', bestVal = -Infinity;
    models.forEach(m => {
      const v = (row as any)[m];
      if (v !== undefined && v > bestVal) { bestVal = v; best = m; }
    });
    return best;
  }

  getAccuracyForConfig(famille: string, model: string): number {
    const row = this.familleResults.find(r => r.famille === famille);
    if (!row) return 0;
    const map: any = {
      xgboost: 'XGBoost',
      lightgbm: 'LightGBM',
      catboost: 'CatBoost',
      randomforest: 'RandomForest',
      linearregression: 'LinearRegression'
    };
    return (row as any)[map[model]] ?? 0;
  }

  formatDate(isoString: string | null): string {
    if (!isoString) return 'Never';
    return new Date(isoString).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
