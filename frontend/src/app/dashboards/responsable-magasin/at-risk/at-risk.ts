import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-at-risk',
  standalone: true,
  imports: [TableModule, TagModule],
  templateUrl: './at-risk.html',
  styleUrl: './at-risk.css'
})
export class AtRisk implements OnInit {

  storeName: string = '';

  atRiskData = [
    { product: 'CHEMISE ARBOR', code: 'AENC97A', famille: 'CHEMISE',
      currentSales: 12, previousSales: 28, decline: -57, returnRate: 23, risk: 'high' },
    { product: 'JEAN PENELOPE', code: 'AENP92A', famille: 'PANTALON',
      currentSales: 8, previousSales: 18, decline: -55, returnRate: 18, risk: 'high' },
    { product: 'PULL MASHE', code: 'SENU33', famille: 'PULL',
      currentSales: 15, previousSales: 25, decline: -40, returnRate: 12, risk: 'medium' },
    { product: 'ROBE LAPLAYA', code: 'AENR273A', famille: 'ROBE',
      currentSales: 20, previousSales: 32, decline: -37, returnRate: 8, risk: 'medium' },
    { product: 'TEE-SHIRT OLY', code: 'AENT227A', famille: 'T-SHIRT',
      currentSales: 25, previousSales: 35, decline: -28, returnRate: 6, risk: 'low' },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const storeId = this.authService.getIdMagasin();
    this.storeName = `Store #${storeId}`;
  }

  getRiskSeverity(risk: string): 'success' | 'warn' | 'danger' {
    switch(risk) {
      case 'high': return 'danger';
      case 'medium': return 'warn';
      case 'low': return 'success';
      default: return 'success';
    }
  }

  getRiskLabel(risk: string): string {
    switch(risk) {
      case 'high': return 'HIGH RISK';
      case 'medium': return 'MEDIUM RISK';
      case 'low': return 'LOW RISK';
      default: return 'LOW RISK';
    }
  }
}
