import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
export class DataAnalyst implements OnInit {

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

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.welcomeMessage = `Welcome back, ${this.authService.getUsername()}!`;
    this.initChartOptions();

    // Check if calculation was running before page refresh
    const savedState = localStorage.getItem(this.qualityStorageKey);
    if (savedState) {
      this.isCalculating = true;
      this.loadKpis();
      this.cdr.detectChanges();
      this.pollQualityStatus();
    } else {
      this.loadQualityStatus();
      this.loadKpis();
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

    this.missingValuesChartData = {
      labels: ['IDArCouleur', 'IDVille', 'IDRegion', 'Saison', 'CodeArticle', 'Famille'],
      datasets: [{
        label: 'Missing Values %',
        data: [45, 38, 32, 28, 15, 8],
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

    this.outliersData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Outliers Detected',
        data: [1200, 980, 1100, 890, 750, 820, 1050, 930, 1180, 1020, 890, 643],
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  }

  loadQualityStatus() {
    this.http.get<any>(`${this.apiUrl}/quality-status`).subscribe({
      next: (status) => {
        this.lastUpdated = status.lastUpdated;
        this.isCalculating = status.isCalculating;
        if (status.isCalculating) {
          localStorage.setItem(this.qualityStorageKey, 'calculating');
          this.pollQualityStatus();
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
      next: () => this.pollQualityStatus(),
      error: (err: any) => {
        console.error(err);
        this.isCalculating = false;
        localStorage.removeItem(this.qualityStorageKey);
        this.cdr.detectChanges();
      }
    });
  }

  pollQualityStatus() {
    const startTime = new Date().toISOString();
    const interval = setInterval(() => {
      if (!localStorage.getItem(this.qualityStorageKey)) {
        clearInterval(interval);
        this.isCalculating = false;
        this.cdr.detectChanges();
        return;
      }

      this.http.get<any>(`${this.apiUrl}/quality-status`).subscribe({
        next: (status) => {
          if (!status.isCalculating &&
            new Date(status.lastUpdated) > new Date(startTime)) {
            clearInterval(interval);
            localStorage.removeItem(this.qualityStorageKey);
            this.isCalculating = false;
            this.loadQualityStatus();
            this.loadKpis();
            this.cdr.detectChanges();
          }
        }
      });
    }, 3000);
  }
}
