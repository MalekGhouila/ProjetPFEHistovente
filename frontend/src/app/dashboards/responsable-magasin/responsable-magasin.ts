import { Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-responsable-magasin',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './responsable-magasin.html',
  styleUrl: './responsable-magasin.css'
})
export class ResponsableMagasin implements OnInit {

  welcomeMessage: string = '';
  storeName: string = 'Store #1';
  storeId: number | null = null;
  noStoreAssigned: boolean = false;

  // KPI Data
  storeSales = '45,231';
  storeRevenue = '€ 890,432';
  avgSaleValue = '€ 35.20';
  totalProducts = '234';

  // Charts
  storeSalesTrendData: any;
  storeSalesTrendOptions: any;
  storeFamilyData: any;
  storeFamilyOptions: any;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.welcomeMessage = `Welcome back, ${this.authService.getUsername()}!`;
    this.storeId = this.authService.getIdMagasin();
    console.log(this.storeId);
    this.storeName = `Store #${this.storeId}`;
    this.initStoreSalesTrend();
    this.initStoreFamilyChart();
    if (!this.storeId) {
      this.noStoreAssigned = true;
      return;
    }
  }

  initStoreSalesTrend() {
    this.storeSalesTrendData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'My Store Sales 2024',
        data: [1200, 1400, 1100, 1600, 1900, 2100,
          1800, 1700, 1500, 1300, 1100, 1000],
        borderColor: '#e91e8c',
        backgroundColor: 'rgba(233, 30, 140, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };

    this.storeSalesTrendOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        y: { beginAtZero: true }
      }
    };
  }

  initStoreFamilyChart() {
    this.storeFamilyData = {
      labels: ['ROBE', 'TEE-SHIRT', 'PULL', 'CHEMISE', 'OTHER'],
      datasets: [{
        data: [40, 25, 15, 12, 8],
        backgroundColor: [
          '#e91e8c', '#6c3483', '#9b59b6',
          '#3498db', '#2ecc71'
        ]
      }]
    };

    this.storeFamilyOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'right' }
      }
    };
  }
}
