import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { StoreAnalyticsService } from '../../../core/services/store-analytics.service';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [TableModule, TagModule, CommonModule],
  templateUrl: './stock.html',
  styleUrl: './stock.css'
})
export class Stock implements OnInit {

  storeName: string = '';
  stockData: any[] = [];
  loading: boolean = true;

  // KPIs
  criticalCount: number = 0;
  warningCount: number = 0;
  goodCount: number = 0;
  totalCount: number = 0;

  constructor(
    private authService: AuthService,
    private storeAnalyticsService: StoreAnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const storeId = this.authService.getIdMagasin();
    this.storeName = `Store #${storeId}`;
    if (storeId !== null) {
      this.loadStockForecast(storeId);
    }
  }

  loadStockForecast(storeId: number) {
    this.loading = true;
    this.storeAnalyticsService.getStockForecast(storeId).subscribe({
      next: (data) => {
        this.stockData = data;
        this.computeKpis(data);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading stock forecast', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  computeKpis(data: any[]) {
    this.totalCount    = data.length;
    this.criticalCount = data.filter(i => i.status === 'critical').length;
    this.warningCount  = data.filter(i => i.status === 'warning').length;
    this.goodCount     = data.filter(i => i.status === 'good').length;
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' {
    switch (status) {
      case 'critical': return 'danger';
      case 'warning':  return 'warn';
      case 'good':     return 'success';
      default:         return 'success';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'critical': return 'RESTOCK NOW';
      case 'warning':  return 'RESTOCK SOON';
      case 'good':     return 'OK';
      default:         return 'OK';
    }
  }

  getTrendIcon(current: number, prev: number): string {
    if (current > prev) return 'pi pi-arrow-up';
    if (current < prev) return 'pi pi-arrow-down';
    return 'pi pi-minus';
  }

  getTrendColor(current: number, prev: number): string {
    if (current > prev) return 'trend-up';
    if (current < prev) return 'trend-down';
    return 'trend-neutral';
  }
}
