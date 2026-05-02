import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../../core/services/auth.service';
import { StoreAnalyticsService } from '../../../core/services/store-analytics.service';

@Component({
  selector: 'app-dormant',
  standalone: true,
  imports: [TableModule, TagModule],
  templateUrl: './dormant.html',
  styleUrl: './dormant.css'
})
export class Dormant implements OnInit {

  storeName: string = '';
  dormantData: any[] = [];
  loading: boolean = true;

  totalDormant: number = 0;
  toRemove: number = 0;
  toDiscount: number = 0;
  avgDaysDormant: number = 0;

  constructor(
    private authService: AuthService,
    private storeAnalyticsService: StoreAnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const storeId = this.authService.getIdMagasin();
    const name = this.authService.getStoreName();
    this.storeName = name?.trim()
      ? `${name} (#${storeId})`
      : `Store #${storeId}`;
    if (storeId !== null) {
      this.loadDormant(storeId);
    }
  }

  loadDormant(storeId: number) {
    this.loading = true;
    this.storeAnalyticsService.getDormant(storeId).subscribe({
      next: (data) => {
        this.dormantData = data;
        this.computeKpis(data);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading dormant data', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  computeKpis(data: any[]) {
    this.totalDormant = data.length;
    this.toRemove = data.filter(i => i.action === 'remove').length;
    this.toDiscount = data.filter(i => i.action === 'discount').length;
    this.avgDaysDormant = data.length
      ? Math.round(data.reduce((sum, i) => sum + i.daysDormant, 0) / data.length)
      : 0;
  }

  getActionSeverity(action: string): 'warn' | 'danger' {
    return action === 'discount' ? 'warn' : 'danger';
  }

  getActionLabel(action: string): string {
    return action === 'discount' ? 'APPLY DISCOUNT' : 'REMOVE';
  }

  getDaysColor(days: number): string {
    if (days > 200) return 'days-critical';
    if (days > 150) return 'days-warning';
    return 'days-normal';
  }
}
