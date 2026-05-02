import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { StoreAnalyticsService } from '../../../core/services/store-analytics.service';

@Component({
  selector: 'app-at-risk',
  standalone: true,
  imports: [TableModule, TagModule, CommonModule],
  templateUrl: './at-risk.html',
  styleUrl: './at-risk.css'
})
export class AtRisk implements OnInit {

  storeName: string = '';
  atRiskData: any[] = [];
  loading: boolean = true;

  // KPIs
  highRisk: number = 0;
  mediumRisk: number = 0;
  lowRisk: number = 0;
  totalAtRisk: number = 0;

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
      this.loadAtRisk(storeId);
    }
  }

  loadAtRisk(storeId: number) {
    this.loading = true;
    this.storeAnalyticsService.getAtRisk(storeId).subscribe({
      next: (data) => {
        this.atRiskData = data;
        this.computeKpis(data);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading at-risk data', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  computeKpis(data: any[]) {
    this.totalAtRisk = data.length;
    this.highRisk   = data.filter(i => i.risk === 'high').length;
    this.mediumRisk = data.filter(i => i.risk === 'medium').length;
    this.lowRisk    = data.filter(i => i.risk === 'low').length;
  }

  getRiskSeverity(risk: string): 'success' | 'warn' | 'danger' {
    switch (risk) {
      case 'high':   return 'danger';
      case 'medium': return 'warn';
      case 'low':    return 'success';
      default:       return 'success';
    }
  }

  getRiskLabel(risk: string): string {
    switch (risk) {
      case 'high':   return 'HIGH RISK';
      case 'medium': return 'MEDIUM RISK';
      case 'low':    return 'LOW RISK';
      default:       return 'LOW RISK';
    }
  }

  getDeclineColor(decline: number): string {
    if (decline <= -75) return 'decline-critical';
    if (decline <= -50) return 'decline-high';
    return 'decline-medium';
  }
}
