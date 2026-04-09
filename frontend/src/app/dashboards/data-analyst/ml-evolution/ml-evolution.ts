import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MlService, ModelStatus } from '../../../core/services/ml.service';

@Component({
  selector: 'app-ml-evolution',
  standalone: true,
  imports: [ChartModule, TableModule, TagModule],
  templateUrl: './ml-evolution.html',
  styleUrl: './ml-evolution.css'
})
export class MlEvolution implements OnInit {

  modelStatus: ModelStatus | null = null;
  isLoading: boolean = true;

  // Performance per family (mock - will be real when model improves)
  familyPerformance = [
    { family: 'ROBE', wmape: 43.9, r2: 0.68, status: 'good' },
    { family: 'CHEMISE', wmape: 45.0, r2: 0.65, status: 'good' },
    { family: 'JUPE', wmape: 55.7, r2: 0.54, status: 'acceptable' },
    { family: 'COMBINAISON', wmape: 76.1, r2: 0.38, status: 'weak' },
    { family: 'PULL', wmape: 70.8, r2: 0.42, status: 'weak' },
    { family: 'PANTALON', wmape: 68.3, r2: 0.45, status: 'acceptable' },
    { family: 'MANTEAU', wmape: 72.1, r2: 0.40, status: 'weak' },
    { family: 'GILET', wmape: 65.4, r2: 0.48, status: 'acceptable' },
    { family: 'BERMUDA/SHORT', wmape: 84.3, r2: 0.25, status: 'poor' },
    { family: 'BONNETERIE/COIFFANT', wmape: 151.1, r2: -0.12, status: 'poor' },
  ];

  // Model comparison chart
  modelComparisonData: any;
  modelComparisonOptions: any;

  // Family performance chart
  familyChartData: any;
  familyChartOptions: any;

  constructor(
    private mlService: MlService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadModelStatus();
    this.initModelComparisonChart();
    this.initFamilyChart();
  }

  loadModelStatus() {
    this.mlService.getStatus().subscribe({
      next: (status) => {
        this.modelStatus = status;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  initModelComparisonChart() {
    this.modelComparisonData = {
      labels: ['Ridge', 'RandomForest', 'XGBoost', 'GradientBoosting', 'LightGBM', 'Prophet'],
      datasets: [
        {
          label: 'WMAPE % (lower is better)',
          data: [63.62, 88.10, 88.42, 90.56, 93.32, 93.93],
          backgroundColor: [
            'rgba(46, 204, 113, 0.7)',
            'rgba(231, 76, 60, 0.7)',
            'rgba(231, 76, 60, 0.7)',
            'rgba(231, 76, 60, 0.7)',
            'rgba(231, 76, 60, 0.7)',
            'rgba(231, 76, 60, 0.7)',
          ],
          borderWidth: 1
        }
      ]
    };

    this.modelComparisonOptions = {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, max: 160 } }
    };
  }

  initFamilyChart() {
    this.familyChartData = {
      labels: this.familyPerformance.map(f => f.family),
      datasets: [{
        label: 'WMAPE %',
        data: this.familyPerformance.map(f => f.wmape),
        backgroundColor: this.familyPerformance.map(f => {
          if (f.status === 'good') return 'rgba(46, 204, 113, 0.7)';
          if (f.status === 'acceptable') return 'rgba(241, 196, 15, 0.7)';
          if (f.status === 'weak') return 'rgba(231, 76, 60, 0.5)';
          return 'rgba(192, 57, 43, 0.7)';
        }),
        borderWidth: 1
      }]
    };

    this.familyChartOptions = {
      responsive: true,
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { callback: (value: number) => value + '%' }
        }
      }
    };
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' {
    switch(status) {
      case 'good': return 'success';
      case 'acceptable': return 'warn';
      default: return 'danger';
    }
  }
}
