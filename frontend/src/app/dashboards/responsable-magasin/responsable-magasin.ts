import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../core/services/auth.service';
import { StoreAnalyticsService } from '../../core/services/store-analytics.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-responsable-magasin',
  standalone: true,
  imports: [ChartModule, ButtonModule, DatePipe],  templateUrl: './responsable-magasin.html',
  styleUrl: './responsable-magasin.css'
})
export class ResponsableMagasin implements OnInit {

  welcomeMessage: string = '';
  storeName: string = '';
  storeId: number | null = null;
  noStoreAssigned: boolean = false;
  lastUpdated: string = '';
  isCalculating: boolean = false;

  // KPI Data
  storeSales = '...';
  storeRevenue = '...';
  avgSaleValue = '...';
  topFamily = '...';

  // Charts
  storeSalesTrendData: any;
  storeSalesTrendOptions: any;
  storeFamilyData: any;
  storeFamilyOptions: any;

  constructor(
    private authService: AuthService,
    private storeAnalyticsService: StoreAnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.storeId = this.authService.getIdMagasin();

    if (!this.storeId) {
      this.noStoreAssigned = true;
      return;
    }

    const name = this.authService.getStoreName();
    this.storeName = name?.trim()
      ? `${name} (#${this.storeId})`
      : `Store #${this.storeId}`;
    this.welcomeMessage = `Welcome back, ${this.authService.getUsername()}!`;
    this.initChartOptions();
    this.loadStoreData();

  }

  initChartOptions() {
    this.storeSalesTrendOptions = {
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: { y: { beginAtZero: true } }
    };

    this.storeFamilyOptions = {
      responsive: true,
      plugins: { legend: { position: 'right' } }
    };
  }

  loadStoreData() {
    if (!this.storeId) return;

    // Load KPIs
    this.storeAnalyticsService.getKpis(this.storeId).subscribe({
      next: (data) => {
        if (data.hasData) {
          this.storeSales = data.totalTransactions.toLocaleString();
          this.storeRevenue = '€ ' + (data.totalRevenue / 1000000).toFixed(2) + 'M';
          this.avgSaleValue = '€ ' + data.avgSaleValue.toFixed(2);
          this.lastUpdated = data.lastUpdated;
        } else {
          this.storeSales = 'No data';
          this.storeRevenue = 'No data';
          this.avgSaleValue = 'No data';
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error loading KPIs:', err)
    });

    // Load Monthly Sales
    this.storeAnalyticsService.getMonthlySales(this.storeId).subscribe({
      next: (data) => {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        if (parsed && parsed.length > 0) {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          this.storeSalesTrendData = {
            labels: parsed.map((d: any) => monthNames[parseInt(d.month.split('-')[1]) - 1]),
            datasets: [{
              label: 'My Store Sales 2024',
              data: parsed.map((d: any) => d.totalSales),
              borderColor: '#e91e8c',
              backgroundColor: 'rgba(233, 30, 140, 0.1)',
              tension: 0.4,
              fill: true
            }]
          };
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => console.error('Error loading monthly sales:', err)
    });

    // Load Sales by Family
    this.storeAnalyticsService.getSalesByFamily(this.storeId).subscribe({
      next: (data) => {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        if (parsed && parsed.length > 0) {
          this.topFamily = parsed[0]?.famille || 'N/A';
          this.storeFamilyData = {
            labels: parsed.map((d: any) => d.famille),
            datasets: [{
              data: parsed.map((d: any) => d.totalSales),
              backgroundColor: [
                '#e91e8c', '#6c3483', '#9b59b6',
                '#3498db', '#2ecc71', '#e74c3c'
              ]
            }]
          };
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => console.error('Error loading family sales:', err)
    });
  }

  refreshData() {
    if (!this.storeId) return;
    this.isCalculating = true;
    this.cdr.detectChanges();

    this.storeAnalyticsService.calculate(this.storeId).subscribe({
      next: () => {
        this.pollStatus();
      },
      error: (err: any) => {
        console.error('Error triggering calculation:', err);
        this.isCalculating = false;
        this.cdr.detectChanges();
      }
    });
  }

  pollStatus() {
    if (!this.storeId) return;
    const interval = setInterval(() => {
      this.storeAnalyticsService.getStatus(this.storeId!).subscribe({
        next: (status) => {
          if (!status.isCalculating && status.hasData) {
            clearInterval(interval);
            this.isCalculating = false;
            this.loadStoreData();
            this.cdr.detectChanges();
          }
        }
      });
    }, 5000);
  }
}
