import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { DecimalPipe } from '@angular/common';
import {
  MlService,
  PredictRequest,
  PredictResponse,
  ModelStatus
} from '../../../core/services/ml.service';

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [FormsModule, ButtonModule, SelectModule, CardModule, ChartModule, TagModule, DecimalPipe],
  templateUrl: './predictions.html',
  styleUrl: './predictions.css'
})
export class Predictions implements OnInit {

  // ── Form fields ──────────────────────────────────────────────────────────
  selectedFamille: string  = '';
  selectedMagasin: string  = '';
  selectedYear:    number  = 2026;
  selectedWeek:    number  = 1;
  isSoldes:        boolean = false;

  // ── Result ───────────────────────────────────────────────────────────────
  predictionResult: PredictResponse | null = null;
  modelStatus:      ModelStatus     | null = null;
  isLoading:    boolean = false;
  errorMessage: string  = '';

  // ── Dropdown options ─────────────────────────────────────────────────────
  families: { label: string; value: string }[] = [];

  magasins: { label: string; value: string }[] = [
    { label: 'Mag 001', value: '001' },
    { label: 'Mag 002', value: '002' },
    { label: 'Mag 003', value: '003' },
  ];

  years = [
    { label: '2025', value: 2025 },
    { label: '2026', value: 2026 },
  ];

  weeks: { label: string; value: number }[] = [];

  constructor(
    private mlService: MlService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadFamilies();
    this.generateWeeks();
  }

  // ── Loaders ───────────────────────────────────────────────────────────────

  loadFamilies() {
    this.mlService.getStatus().subscribe({
      next: (status) => {
        this.modelStatus = status;
        this.families = status.families_supported.map(f => ({ label: f, value: f }));
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error loading families:', err)
    });
  }

  generateWeeks() {
    for (let i = 1; i <= 52; i++) {
      this.weeks.push({ label: `Week ${i}`, value: i });
    }
  }

  // ── Predict ───────────────────────────────────────────────────────────────

  predict() {
    if (!this.selectedFamille) {
      this.errorMessage = 'Please select a product family!';
      return;
    }
    if (!this.selectedMagasin) {
      this.errorMessage = 'Please select a store!';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.predictionResult = null;

    const request: PredictRequest = {
      famille:      this.selectedFamille,
      code_mag:     this.selectedMagasin,
      year:         this.selectedYear,
      week_of_year: this.selectedWeek,
      is_soldes:    this.isSoldes ? 1 : 0
    };

    this.mlService.predict(request).subscribe({
      next: (result) => {
        this.predictionResult = result;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Prediction failed! Check if ML server is running.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getConfidenceLabel(): string {
    if (!this.predictionResult) return '';
    const acc = this.predictionResult.accuracy;
    if (acc >= 60) return 'HIGH';
    if (acc >= 40) return 'MEDIUM';
    return 'LOW';
  }

  getConfidenceSeverity(): 'success' | 'warn' | 'danger' {
    if (!this.predictionResult) return 'warn';
    return this.getAccuracySeverity(this.predictionResult.accuracy);
  }

  getAccuracySeverity(val: number): 'success' | 'warn' | 'danger' {
    if (val >= 60) return 'success';
    if (val >= 40) return 'warn';
    return 'danger';
  }

  getWarningIcon(): string {
    if (!this.predictionResult) return '';
    switch (this.predictionResult.warning_level) {
      case 'red':    return 'pi pi-times-circle';
      case 'yellow': return 'pi pi-exclamation-triangle';
      default:       return 'pi pi-check-circle';
    }
  }

  getWarningClass(): string {
    if (!this.predictionResult) return '';
    switch (this.predictionResult.warning_level) {
      case 'red':    return 'warning-red';
      case 'yellow': return 'warning-yellow';
      default:       return 'warning-ok';
    }
  }
}
