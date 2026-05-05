import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DataQualityService } from '../../../core/services/data-quality.service';

@Component({
  selector: 'app-data-quality',
  standalone: true,
  imports: [ChartModule, TableModule, TagModule, DecimalPipe, DatePipe, ButtonModule],
  templateUrl: './data-quality.html',
  styleUrl: './data-quality.css'
})
export class DataQuality implements OnInit {

  loading = true;
  isCalculating = false;
  lastUpdated: string = '';

  // KPI cards
  qualityScore = 0;
  totalRecords = 0;
  cleanRecords = 0;
  removedRecords = 0;

  // Filter stats table
  filterStatsData: { filter: string; removed: number }[] = [];

  // Dropped columns table
  droppedColumns: { name: string; reason: string; nullPct: number }[] = [];

  // Charts
  typeVenteChartData: any;
  typeVenteChartOptions: any;
  yearDistChartData: any;
  yearDistChartOptions: any;

  constructor(
    private dataQualityService: DataQualityService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.dataQualityService.getStatus().subscribe({
      next: (s) => {
        this.lastUpdated = s.lastUpdated;
        this.isCalculating = s.isCalculating;
        if (s.isCalculating) this.pollStatus();
        this.cdr.detectChanges();
      },
      error: () => {}
    });
    this.loadStats();
  }

  loadStats() {
    this.dataQualityService.getRawStats().subscribe({
      next: (data) => {
        this.qualityScore   = data.qualityScore;
        this.totalRecords   = data.totalRecords;
        this.cleanRecords   = data.cleanRecords;
        this.removedRecords = data.removedRecords;

        this.filterStatsData = [
          { filter: 'Type de vente non valide', removed: data.filterStats.typeVente },
          { filter: 'Date nulle',               removed: data.filterStats.dateNull },
          { filter: 'Date < 2020',              removed: data.filterStats.dateOld },
          { filter: 'Quantité invalide',        removed: data.filterStats.quantite },
          { filter: 'Prix invalide',            removed: data.filterStats.prix },
        ];

        this.droppedColumns = data.droppedColumns;
        this.initTypeVenteChart(data.typeVenteDistribution);
        this.initYearDistChart(data.distributionByYear);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load data quality stats', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onRefresh() {
    if (this.isCalculating) return;
    this.isCalculating = true;
    this.cdr.detectChanges();

    this.dataQualityService.refresh().subscribe({
      next: () => { this.pollStatus(); },
      error: (err) => {
        console.error('Error triggering refresh:', err);
        this.isCalculating = false;
        this.cdr.detectChanges();
      }
    });
  }

  pollStatus() {
    const startTime = new Date().toISOString();

    const interval = setInterval(() => {
      this.dataQualityService.getStatus().subscribe({
        next: (status) => {
          if (!status.isCalculating &&
            status.lastUpdated !== 'Never' &&
            new Date(status.lastUpdated) > new Date(startTime)) {

            clearInterval(interval);
            this.lastUpdated = status.lastUpdated;
            this.loadStats();
            setTimeout(() => {
              this.isCalculating = false;
              this.cdr.detectChanges();
            }, 1500);
          }
        }
      });
    }, 5000);
  }

  initTypeVenteChart(distribution: { type: string; count: number }[]) {
    const colors = [
      '#3b82f6','#10b981','#f59e0b','#ef4444',
      '#8b5cf6','#06b6d4','#f97316','#84cc16','#ec4899','#6b7280'
    ];
    this.typeVenteChartData = {
      labels: distribution.map(d => d.type),
      datasets: [{
        data: distribution.map(d => d.count),
        backgroundColor: colors.slice(0, distribution.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
    this.typeVenteChartOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'right' },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const pct = ((ctx.parsed / total) * 100).toFixed(1);
              return ` ${ctx.label}: ${ctx.parsed.toLocaleString()} (${pct}%)`;
            }
          }
        }
      }
    };
  }

  initYearDistChart(distribution: { year: number; count: number; pct: number }[]) {
    this.yearDistChartData = {
      labels: distribution.map(d => d.year.toString()),
      datasets: [{
        label: 'Clean Records',
        data: distribution.map(d => d.count),
        backgroundColor: ['#3b82f6','#10b981','#f59e0b','#8b5cf6'],
        borderRadius: 6,
        borderWidth: 0
      }]
    };
    this.yearDistChartOptions = {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const pct = distribution[ctx.dataIndex].pct;
              return ` ${ctx.parsed.y.toLocaleString()} records (${pct}%)`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: number) => (value / 1000000).toFixed(1) + 'M'
          }
        }
      }
    };
  }

  getReasonSeverity(reason: string): 'success' | 'warn' | 'danger' {
    if (reason === '>60% NULL') return 'danger';
    if (reason === '100% zéros') return 'warn';
    return 'warn';
  }
}
