import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { MlService, ModelStatus } from '../../../core/services/ml.service';

@Component({
  selector: 'app-ml-monitoring',
  standalone: true,
  imports: [TagModule],
  templateUrl: './ml-monitoring.html',
  styleUrl: './ml-monitoring.css'
})
export class MlMonitoring implements OnInit {

  modelStatus: ModelStatus | null = null;
  isLoading: boolean = true;
  error: boolean = false;

  constructor(
    private mlService: MlService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadStatus();
  }

  loadStatus() {
    this.mlService.getStatus().subscribe({
      next: (status) => {
        this.modelStatus = status;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading ML status:', err);
        this.error = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusSeverity(): 'success' | 'danger' {
    return this.modelStatus?.status === 'healthy' ? 'success' : 'danger';
  }

  getAccuracySeverity(): 'success' | 'warn' | 'danger' {
    if (!this.modelStatus) return 'danger';
    const wmape = this.modelStatus.wmape;
    if (wmape < 50) return 'success';
    if (wmape < 75) return 'warn';
    return 'danger';
  }
}
