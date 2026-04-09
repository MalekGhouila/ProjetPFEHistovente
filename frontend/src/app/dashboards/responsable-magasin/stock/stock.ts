import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [TableModule, TagModule],
  templateUrl: './stock.html',
  styleUrl: './stock.css'
})
export class Stock implements OnInit {

  storeId: number | null = null;
  storeName: string = '';

  stockData = [
    { product: 'ROBE ROSY', code: 'AENR279A', currentStock: 5, salesVelocity: 3, daysLeft: 2, status: 'critical' },
    { product: 'TEE-SHIRT FOUDRE', code: 'SENT132A', currentStock: 12, salesVelocity: 2, daysLeft: 6, status: 'warning' },
    { product: 'PULL MASHE', code: 'SENU33', currentStock: 25, salesVelocity: 1, daysLeft: 25, status: 'good' },
    { product: 'CHEMISE ARBOR', code: 'AENC97A', currentStock: 8, salesVelocity: 2, daysLeft: 4, status: 'warning' },
    { product: 'JEAN PENELOPE', code: 'AENP92A', currentStock: 3, salesVelocity: 2, daysLeft: 2, status: 'critical' },
    { product: 'VESTE ARBOR', code: 'AENK36', currentStock: 18, salesVelocity: 1, daysLeft: 18, status: 'good' },
    { product: 'ROBE LORETTE', code: 'AENR242A', currentStock: 7, salesVelocity: 3, daysLeft: 2, status: 'critical' },
    { product: 'MAILLE FLORENCE', code: 'AENT224A', currentStock: 20, salesVelocity: 1, daysLeft: 20, status: 'good' },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.storeId = this.authService.getIdMagasin();
    this.storeName = `Store #${this.storeId}`;
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' {
    switch(status) {
      case 'critical': return 'danger';
      case 'warning': return 'warn';
      case 'good': return 'success';
      default: return 'success';
    }
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'critical': return 'RESTOCK NOW';
      case 'warning': return 'RESTOCK SOON';
      case 'good': return 'OK';
      default: return 'OK';
    }
  }
}
