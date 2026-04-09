import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { MlService, PredictRequest, PredictResponse } from '../../../core/services/ml.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [FormsModule, ButtonModule, SelectModule, CardModule, ChartModule, TagModule, DecimalPipe],
  templateUrl: './predictions.html',
  styleUrl: './predictions.css'
})
export class Predictions implements OnInit {

  // Form fields
  selectedFamille: string = '';
  selectedYear: number = 2025;
  selectedWeek: number = 1;

  // Prediction result
  predictionResult: PredictResponse | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  // Supported families
  families: { label: string, value: string }[] = [];

  // Years and weeks
  years = [
    { label: '2025', value: 2025 },
    { label: '2026', value: 2026 }
  ];

  weeks: { label: string, value: number }[] = [];

  // Mock lag values (will be auto-calculated later)
  lagValues = {
    lag1: 3200,
    lag2: 3100,
    lag4: 2900,
    lag52: 3000,
    rollingMean4: 3050,
    rollingMean12: 2950
  };

  constructor(
    private mlService: MlService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadModelStatus();
    this.generateWeeks();
  }

  loadModelStatus() {
    this.mlService.getStatus().subscribe({
      next: (status) => {
        this.families = status.families_supported.map(f => ({
          label: f,
          value: f
        }));
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error loading model status:', err)
    });
  }

  generateWeeks() {
    for (let i = 1; i <= 52; i++) {
      this.weeks.push({ label: `Week ${i}`, value: i });
    }
  }

  predict() {
    if (!this.selectedFamille) {
      this.errorMessage = 'Please select a product family!';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.predictionResult = null;

    const request: PredictRequest = {
      famille: this.selectedFamille,
      year: this.selectedYear,
      week_of_year: this.selectedWeek,
      lag1: this.lagValues.lag1,
      lag2: this.lagValues.lag2,
      lag4: this.lagValues.lag4,
      lag52: this.lagValues.lag52,
      rollingMean4: this.lagValues.rollingMean4,
      rollingMean12: this.lagValues.rollingMean12
    };

    this.mlService.predict(request).subscribe({
      next: (result) => {
        this.predictionResult = result;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = 'Prediction failed! Check if ML server is running.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getConfidenceLabel(): string {
    if (!this.predictionResult) return '';
    const wmape = 63.62;
    if (wmape < 50) return 'HIGH';
    if (wmape < 75) return 'MEDIUM';
    return 'LOW';
  }

  getConfidenceSeverity(): 'success' | 'warn' | 'danger' {
    const label = this.getConfidenceLabel();
    if (label === 'HIGH') return 'success';
    if (label === 'MEDIUM') return 'warn';
    return 'danger';
  }
}
