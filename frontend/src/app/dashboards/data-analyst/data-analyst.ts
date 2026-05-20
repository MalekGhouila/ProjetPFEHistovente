import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MlService } from '../../core/services/ml.service';

@Component({
  selector: 'app-data-analyst',
  standalone: true,
  imports: [ChartModule, ButtonModule, SelectModule, FormsModule, DatePipe],
  templateUrl: './data-analyst.html',
  styleUrl: './data-analyst.css'
})
export class DataAnalyst implements OnInit, OnDestroy {

  welcomeMessage: string = '';
  lastUpdated: string = '';
  isCalculating: boolean = false;

  totalRecords = '...';
  dataQualityScore = '...';
  missingValues = '...';
  outliersDetected = '...';

  completenessData: any;
  completenessOptions: any;
  outliersData: any;
  outliersOptions: any;

  // Pipeline history card
  isPipelineLoading = true;
  mlServerDown = false;
  pipelineDates: {
    lastClean: string | null;
    lastTrain: string | null;
    lastDeploy: string | null;
  } = { lastClean: null, lastTrain: null, lastDeploy: null };

  // Year selector for records-per-month chart
  availableYears: { label: string; value: number }[] = [];
  selectedMonthYear: number | null = null;
  yearsLoading = true;
  monthChartLoading = true;

  private apiUrl = 'http://localhost:8080/api/analytics';
  private qualityStorageKey = 'qualityCalculating';
  private pollInterval: any = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private mlService: MlService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.welcomeMessage = `Welcome back, ${this.authService.getUsername()}!`;
    this.initChartOptions();

    if (localStorage.getItem(this.qualityStorageKey)) {
      this.isCalculating = true;
      this.cdr.detectChanges();
    }

    this.loadQualityStatus();
    this.loadKpis();
    this.loadAvailableYears();
    this.loadRecordsPerYear();
    this.loadPipelineDates();
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  // ── Chart options ──────────────────────────────────────────────────

  initChartOptions() {
    const textColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--text-primary').trim() || '#e2e8f0';
    const mutedColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--text-secondary').trim() || '#94a3b8';
    const gridColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--border-color').trim() || 'rgba(255,255,255,0.08)';

    const axisDefaults = {
      ticks: { color: mutedColor, font: { size: 11 } },
      grid: { color: gridColor }
    };

    this.completenessOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: any) =>
              ' ' + ctx.parsed.y.toLocaleString() + ' records'
          }
        }
      },
      scales: {
        x: { ...axisDefaults },
        y: {
          ...axisDefaults,
          beginAtZero: true,
          ticks: {
            ...axisDefaults.ticks,
            callback: (value: number) => (value / 1_000_000).toFixed(1) + 'M'
          }
        }
      }
    };

    this.outliersOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: any) =>
              ' ' + ctx.parsed.y.toLocaleString() + ' records'
          }
        }
      },
      scales: {
        x: {
          ...axisDefaults,
          ticks: {
            ...axisDefaults.ticks,
            autoSkip: false,
            maxTicksLimit: 12,
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          ...axisDefaults,
          beginAtZero: true
        }
      }
    };

    this.completenessData = { labels: [], datasets: [] };

    this.outliersData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Records per Month',
        data: new Array(12).fill(0),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  }

  // ── Year selector ──────────────────────────────────────────────────

  loadAvailableYears() {
    this.yearsLoading = true;
    this.monthChartLoading = true;
    this.cdr.detectChanges();

    this.http.get<number[]>(`${this.apiUrl}/available-years`).subscribe({
      next: (years) => {
        this.availableYears = years.map(y => ({ label: y.toString(), value: y }));

        if (years.length > 0) {
          this.selectedMonthYear = years[0];
          this.loadRecordsPerMonth(this.selectedMonthYear);
        } else {
          this.selectedMonthYear = null;
          this.monthChartLoading = false;
        }

        this.yearsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        const fallback = [2025, 2024, 2023, 2022];
        this.availableYears = fallback.map(y => ({ label: y.toString(), value: y }));
        this.selectedMonthYear = fallback[0];
        this.yearsLoading = false;
        this.loadRecordsPerMonth(this.selectedMonthYear);
        this.cdr.detectChanges();
      }
    });
  }

  onMonthYearChange() {
    if (this.selectedMonthYear) {
      this.loadRecordsPerMonth(this.selectedMonthYear);
    }
  }

  // ── Chart data loaders ─────────────────────────────────────────────

  loadRecordsPerMonth(year?: number) {
    const url = year
      ? `${this.apiUrl}/records-per-month?year=${year}`
      : `${this.apiUrl}/records-per-month`;

    this.monthChartLoading = true;
    this.cdr.detectChanges();

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.outliersData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
              label: `Records${year ? ' — ' + year : ''}`,
              data: new Array(12).fill(0),
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59,130,246,0.1)',
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6
            }]
          };
          this.monthChartLoading = false;
          this.cdr.detectChanges();
          return;
        }

        const detectedYear = data[0]['year'] ?? year ?? '';

        this.outliersData = {
          labels: data.map(d => d['month']),
          datasets: [{
            label: `Records${detectedYear ? ' — ' + detectedYear : ''}`,
            data: data.map(d => d['recordCount']),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        };

        this.monthChartLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading records per month:', err);
        this.monthChartLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadRecordsPerYear() {
    this.http.get<any[]>(`${this.apiUrl}/records-per-year`).subscribe({
      next: (data) => {
        if (!data || data.length === 0) return;

        this.completenessData = {
          labels: data.map(d => d['year'].toString()),
          datasets: [{
            label: 'Records per Year',
            data: data.map(d => d['recordCount']),
            backgroundColor: 'rgba(59,130,246,0.7)',
            hoverBackgroundColor: 'rgba(59,130,246,0.9)',
            borderRadius: 6,
            borderWidth: 0
          }]
        };

        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error loading records per year:', err)
    });
  }

  // ── Pipeline ───────────────────────────────────────────────────────

  loadPipelineDates() {
    this.isPipelineLoading = true;
    this.mlServerDown = false;

    this.mlService.getPipelineStatus().subscribe({
      next: (status) => {
        this.mlServerDown = false;
        this.pipelineDates = {
          lastClean: status.clean?.last_run ? this.formatDate(status.clean.last_run) : null,
          lastTrain: status.train?.last_run ? this.formatDate(status.train.last_run) : null,
          lastDeploy: status.deploy?.last_deployed ? this.formatDate(status.deploy.last_deployed) : null
        };
        this.isPipelineLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mlServerDown = true;
        this.pipelineDates = { lastClean: null, lastTrain: null, lastDeploy: null };
        this.isPipelineLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToMlEvolution() {
    if (this.mlServerDown) return;
    this.router.navigate(['/data-analyst/ml-evolution']);
  }

  // ── Quality / KPIs ─────────────────────────────────────────────────

  loadQualityStatus() {
    this.http.get<any>(`${this.apiUrl}/quality-status`).subscribe({
      next: (status) => {
        this.lastUpdated = status.lastUpdated;
        this.isCalculating = status.isCalculating;

        if (status.isCalculating) {
          localStorage.setItem(this.qualityStorageKey, 'calculating');
          this.startPolling();
        } else {
          localStorage.removeItem(this.qualityStorageKey);
        }

        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error loading quality status:', err)
    });
  }

  loadKpis() {
    this.http.get<any>(`${this.apiUrl}/data-quality`).subscribe({
      next: (data) => {
        this.totalRecords = data.totalRecords.toLocaleString();
        this.dataQualityScore = data.qualityScore.toFixed(1) + '%';
        this.missingValues = data.missingValuesPercentage.toFixed(1) + '%';
        this.outliersDetected = data.outliersCount.toLocaleString();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error loading quality KPIs:', err)
    });
  }

  refreshData() {
    this.isCalculating = true;
    localStorage.setItem(this.qualityStorageKey, 'calculating');
    this.cdr.detectChanges();

    this.http.post<any>(`${this.apiUrl}/refresh-quality`, {}).subscribe({
      next: () => this.startPolling(),
      error: (err: any) => {
        console.error(err);
        this.isCalculating = false;
        localStorage.removeItem(this.qualityStorageKey);
        this.cdr.detectChanges();
      }
    });
  }

  // ── Stop calculation ───────────────────────────────────────────────

  stopCalculation() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    this.isCalculating = false;
    localStorage.removeItem(this.qualityStorageKey);
    this.cdr.detectChanges();
  }

  // ── Polling ────────────────────────────────────────────────────────

  startPolling() {
    if (this.pollInterval) return;

    const startTime = new Date().toISOString();

    this.pollInterval = setInterval(() => {
      this.http.get<any>(`${this.apiUrl}/quality-status`).subscribe({
        next: (status) => {
          if (!status.isCalculating &&
            new Date(status.lastUpdated) > new Date(startTime)) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
            localStorage.removeItem(this.qualityStorageKey);
            this.isCalculating = false;
            this.lastUpdated = status.lastUpdated;

            this.loadKpis();
            this.loadRecordsPerMonth(this.selectedMonthYear ?? undefined);
            this.loadRecordsPerYear();
            this.cdr.detectChanges();
          }
        }
      });
    }, 3000);
  }

  pollQualityStatus() {
    this.startPolling();
  }

  private formatDate(isoString: string): string {
    return new Date(isoString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
