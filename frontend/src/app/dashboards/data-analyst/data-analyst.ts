import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-data-analyst',
  standalone: true,
  imports: [ChartModule, ButtonModule, DatePipe],
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

  missingValuesChartData: any;
  missingValuesChartOptions: any;
  completenessData: any;
  completenessOptions: any;
  outliersData: any;
  outliersOptions: any;

  private apiUrl = 'http://localhost:8080/api/analytics';
  private qualityStorageKey = 'qualityCalculating';
  private pollInterval: any = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
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
    this.loadRecordsPerMonth();
    this.loadMissingByColumn();
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  initChartOptions() {
    this.missingValuesChartOptions = {
      responsive: true,
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: { callback: (value: number) => value + '%' }
        }
      }
    };

    this.completenessOptions = {
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { stacked: true },
        y: {
          stacked: true,
          beginAtZero: true,
          max: 100,
          ticks: { callback: (value: number) => value + '%' }
        }
      }
    };

    this.outliersOptions = {
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: { y: { beginAtZero: true } }
    };

    // Placeholder until real data loads
    this.missingValuesChartData = {
      labels: ['IDArCouleur', 'IDVille', 'IDRegion', 'Saison', 'CodeArticle', 'Famille'],
      datasets: [{
        label: 'Missing Values %',
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(231, 76, 60, 0.8)', 'rgba(231, 76, 60, 0.7)',
          'rgba(241, 196, 15, 0.8)', 'rgba(241, 196, 15, 0.7)',
          'rgba(46, 204, 113, 0.8)', 'rgba(46, 204, 113, 0.7)'
        ],
        borderWidth: 1
      }]
    };

    this.completenessData = {
      labels: ['2021', '2022', '2023', '2024', '2025'],
      datasets: [
        {
          label: 'Complete Records %',
          data: [85, 78, 72, 74, 76],
          backgroundColor: 'rgba(46, 204, 113, 0.7)',
          borderColor: '#2ecc71',
          borderWidth: 1
        },
        {
          label: 'Incomplete Records %',
          data: [15, 22, 28, 26, 24],
          backgroundColor: 'rgba(231, 76, 60, 0.7)',
          borderColor: '#e74c3c',
          borderWidth: 1
        }
      ]
    };

    // Placeholder until real data loads
    this.outliersData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Records per Month (2024)',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  }

  loadRecordsPerMonth() {
    this.http.get<any[]>(`${this.apiUrl}/records-per-month`).subscribe({
      next: (data) => {
        if (!data || data.length === 0) return;
        this.outliersData = {
          labels: data.map(d => d['month']),
          datasets: [{
            label: 'Records per Month (2024)',
            data: data.map(d => d['recordCount']),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          }]
        };
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error loading records per month:', err)
    });
  }

  loadMissingByColumn() {
    this.http.get<any>(`${this.apiUrl}/missing-by-column`).subscribe({
      next: (data) => {
        if (!data) return;
        const labels = Object.keys(data);
        const values = Object.values(data) as number[];
        this.missingValuesChartData = {
          labels,
          datasets: [{
            label: 'Missing Values %',
            data: values.map(v => parseFloat(v.toFixed(2))),
            backgroundColor: [
              'rgba(231, 76, 60, 0.8)', 'rgba(231, 76, 60, 0.7)',
              'rgba(241, 196, 15, 0.8)', 'rgba(241, 196, 15, 0.7)',
              'rgba(46, 204, 113, 0.8)', 'rgba(46, 204, 113, 0.7)'
            ],
            borderWidth: 1
          }]
        };
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error loading missing by column:', err)
    });
  }

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
            this.loadRecordsPerMonth();
            this.loadMissingByColumn();
            this.cdr.detectChanges();
          }
        }
      });
    }, 3000);
  }

  pollQualityStatus() {
    this.startPolling();
  }
}
