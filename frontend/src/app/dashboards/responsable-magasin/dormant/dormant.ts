import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dormant',
  standalone: true,
  imports: [TableModule, TagModule],
  templateUrl: './dormant.html',
  styleUrl: './dormant.css'
})
export class Dormant implements OnInit {

  storeName: string = '';

  dormantData = [
    { product: 'PULL HIVER 2022', code: 'SENH22A', famille: 'PULL',
      lastSale: '2025-09-15', daysSinceLastSale: 189, totalSold: 45, action: 'discount' },
    { product: 'ROBE ETE 2021', code: 'SENR21B', famille: 'ROBE',
      lastSale: '2025-08-20', daysSinceLastSale: 215, totalSold: 23, action: 'remove' },
    { product: 'CHEMISE VINTAGE', code: 'SENC21A', famille: 'CHEMISE',
      lastSale: '2025-10-01', daysSinceLastSale: 173, totalSold: 67, action: 'discount' },
    { product: 'VESTE ANCIENNE', code: 'SENV22C', famille: 'VESTE',
      lastSale: '2025-07-10', daysSinceLastSale: 256, totalSold: 12, action: 'remove' },
    { product: 'TEE-SHIRT BASIQUE', code: 'SENT20A', famille: 'T-SHIRT',
      lastSale: '2025-11-05', daysSinceLastSale: 138, totalSold: 89, action: 'discount' },
    { product: 'JEAN CLASSIQUE', code: 'SENJ21B', famille: 'PANTALON',
      lastSale: '2025-09-30', daysSinceLastSale: 174, totalSold: 34, action: 'discount' },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const storeId = this.authService.getIdMagasin();
    this.storeName = `Store #${storeId}`;
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
