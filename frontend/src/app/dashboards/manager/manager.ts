import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [ChartModule, CardModule],
  templateUrl: './manager.html',
  styleUrl: './manager.css'
})
export class Manager implements OnInit {

  welcomeMessage: string = '';

  // KPI Data
  totalSales = '...';
  totalRevenue = '...';
  totalStores = '...';
  avgSaleValue = '...';

  // Charts
  monthlySalesData: any;
  monthlySalesOptions: any;
  salesByFamilyData: any;
  salesByFamilyOptions: any;
  topStoresData: any;
  topStoresOptions: any;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.welcomeMessage = `Welcome back, ${this.authService.getUsername()!}`;
    this.initChartOptions();
    this.loadKpis();
    this.loadMonthlySales();
    this.loadTopStores();
    this.loadSalesByFamily();
  }

  // Initialize chart options only (no data yet)
  initChartOptions() {
    this.monthlySalesOptions = {
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: { y: { beginAtZero: true } }
    };

    this.salesByFamilyOptions = {
      responsive: true,
      plugins: { legend: { position: 'right' } }
    };

    this.topStoresOptions = {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    };
  }

  loadKpis() {
    this.http.get<any>('http://localhost:8080/api/analytics/kpis')
      .subscribe({
        next: (data) => {
          this.totalSales = data.totalTransactions.toLocaleString();
          this.totalRevenue = '€ ' + (data.totalRevenue / 1000000).toFixed(2) + 'M';
          this.avgSaleValue = '€ ' + data.avgSaleValue.toFixed(2);
          this.totalStores = data.totalStores.toString();
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('Error loading KPIs:', err)
      });
  }

  loadMonthlySales() {
    this.http.get<any[]>('http://localhost:8080/api/analytics/monthly-sales')
      .subscribe({
        next: (data) => {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          this.monthlySalesData = {
            labels: data.map(d => monthNames[parseInt(d.month) - 1]),
            datasets: [{
              label: 'Sales 2024',
              data: data.map(d => d.totalSales),
              borderColor: '#6c3483',
              backgroundColor: 'rgba(108, 52, 131, 0.1)',
              tension: 0.4,
              fill: true
            }]
          };
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('Error loading monthly sales:', err)
      });
  }

  loadTopStores() {
    this.http.get<any[]>('http://localhost:8080/api/analytics/top-stores')
      .subscribe({
        next: (data) => {
          this.topStoresData = {
            labels: data.map(d => d.storeName),
            datasets: [{
              label: 'Total Sales',
              data: data.map(d => d.totalSales),
              backgroundColor: 'rgba(108, 52, 131, 0.7)',
              borderColor: '#6c3483',
              borderWidth: 1
            }]
          };
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('Error loading top stores:', err)
      });
  }

  loadSalesByFamily() {
    this.http.get<any[]>('http://localhost:8080/api/analytics/sales-by-family')
      .subscribe({
        next: (data) => {
          this.salesByFamilyData = {
            labels: data.map(d => d.famille),
            datasets: [{
              data: data.map(d => d.totalSales),
              backgroundColor: [
                '#6c3483', '#e91e8c', '#9b59b6',
                '#3498db', '#2ecc71', '#e74c3c'
              ]
            }]
          };
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('Error loading sales by family:', err)
      });
  }
}
