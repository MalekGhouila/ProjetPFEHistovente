import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../core/services/auth.service';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [ChartModule, CardModule],
  templateUrl: './manager.html',
  styleUrl: './manager.css'
})
export class Manager implements OnInit {
  welcomeMessage : string ='';

  // KPI Data
  totalSales = '...';
  totalRevenue = '...';
  totalStores = '...';
  avgSaleValue = '...';

  // Line Chart - Monthly Sales
  monthlySalesData: any;
  monthlySalesOptions: any;

  // Donut Chart - Sales by Family
  salesByFamilyData: any;
  salesByFamilyOptions: any;

  // Bar Chart - Top Stores
  topStoresData: any;
  topStoresOptions: any;

  constructor(private authService : AuthService, private http: HttpClient, private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.loadKpis();
    this.initMonthlySalesChart();
    this.initSalesByFamilyChart();
    this.initTopStoresChart();
    this.welcomeMessage=`Welcome back, ${this.authService.getUsername()!}`;
  }

  loadKpis() {
    this.http.get<any>('http://localhost:8080/api/analytics/kpis')
      .subscribe({
        next: (data) => {
          this.totalSales = data.totalTransactions.toLocaleString();
          this.totalRevenue = '€ ' + (data.totalRevenue / 1000000).toFixed(2) + 'M';
          this.avgSaleValue = '€ ' + data.avgSaleValue.toFixed(2);
          this.totalStores = data.totalStores.toString();
          this.cdr.detectChanges(); // ← Fix!
        },
        error: (err: any) => {
          console.error('Error loading KPIs:', err);
          this.cdr.detectChanges();
        }
      });
  }

  initMonthlySalesChart() {
    this.monthlySalesData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Sales 2024',
        data: [12500, 14200, 13800, 15600, 18900, 21000,
          19500, 17800, 16200, 14900, 13100, 11800],
        borderColor: '#6c3483',
        backgroundColor: 'rgba(108, 52, 131, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };

    this.monthlySalesOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    };
  }

  initSalesByFamilyChart() {
    this.salesByFamilyData = {
      labels: ['ROBE', 'TEE-SHIRT', 'PULL', 'CHEMISE', 'PANTALON', 'OTHER'],
      datasets: [{
        data: [35, 25, 15, 12, 8, 5],
        backgroundColor: [
          '#6c3483', '#e91e8c', '#9b59b6',
          '#3498db', '#2ecc71', '#e74c3c'
        ]
      }]
    };

    this.salesByFamilyOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'right' }
      }
    };
  }

  initTopStoresChart() {
    this.topStoresData = {
      labels: ['Paris 01', 'Lyon 02', 'Marseille', 'Bordeaux',
        'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Lille', 'Rennes'],
      datasets: [{
        label: 'Total Sales',
        data: [8500, 7200, 6800, 6100, 5900, 5400, 4800, 4200, 3900, 3500],
        backgroundColor: 'rgba(108, 52, 131, 0.7)',
        borderColor: '#6c3483',
        borderWidth: 1
      }]
    };

    this.topStoresOptions = {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    };
  }
}
