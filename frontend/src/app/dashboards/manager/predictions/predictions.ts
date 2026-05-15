import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DecimalPipe } from '@angular/common';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import {
  MlService,
  PredictRequest,
  PredictResponse,
  ModelStatus,
  FamilleAccuracyRow,
  StoreItem
} from '../../../core/services/ml.service';

type Tier = 'high' | 'medium' | 'low';

interface FamilyOption {
  label: string;
  value: string;
  accuracy: number;
  tier: Tier;
}

interface MagasinDto {
  idMagasin: number;
  magasin: string;
  code: string;
  etat?: number;
}

interface MagasinPageResponse {
  content: MagasinDto[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [FormsModule, ButtonModule, SelectModule, CardModule, TagModule, DecimalPipe],
  templateUrl: './predictions.html',
  styleUrl: './predictions.css'
})
export class Predictions implements OnInit {
  selectedFamille = '';
  selectedMagasin = '';
  selectedYear = 2026;
  selectedWeek = 1;
  isSoldes = false;

  predictionResult: PredictResponse | null = null;
  modelStatus: ModelStatus | null = null;
  isLoading = false;
  errorMessage = '';

  families: FamilyOption[] = [];
  magasins: { label: string; value: string }[] = [];

  years = [
    { label: '2025', value: 2025 },
    { label: '2026', value: 2026 }
  ];

  weeks: { label: string; value: number }[] = [];

  private springApi = 'http://localhost:8080/api/magasins';

  constructor(
    private mlService: MlService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadFamiliesAndAccuracies();
    this.loadStoresIntersection();
    this.generateWeeks();
  }

  // ---------- Families ----------

  loadFamiliesAndAccuracies() {
    this.mlService.getStatus().subscribe({
      next: (status) => {
        this.modelStatus = status;

        this.mlService.getPerFamilleResults().subscribe({
          next: (rows) => {
            this.families = this.buildSortedFamilyOptions(status.families_supported, rows);
            this.cdr.detectChanges();
          },
          error: () => {
            this.families = status.families_supported.map(f => ({
              label: `${f} • LOW`,
              value: f,
              accuracy: 0,
              tier: 'low' as Tier
            }));
            this.cdr.detectChanges();
          }
        });
      },
      error: (err: any) => {
        console.error('Error loading families:', err);
        this.errorMessage = 'Could not load families from ML API.';
        this.cdr.detectChanges();
      }
    });
  }

  private buildSortedFamilyOptions(familyNames: string[], rows: FamilleAccuracyRow[]): FamilyOption[] {
    const mapped = familyNames.map(name => {
      const row = rows.find(r => r.famille === name);
      const best = this.getBestAccuracyFromRow(row);
      const tier = this.getTier(best);

      return {
        label: `${name} • ${tier.toUpperCase()} (${best.toFixed(1)}%)`,
        value: name,
        accuracy: best,
        tier
      };
    });

    const tierRank: Record<Tier, number> = { high: 0, medium: 1, low: 2 };
    mapped.sort((a, b) => {
      if (tierRank[a.tier] !== tierRank[b.tier]) return tierRank[a.tier] - tierRank[b.tier];
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return a.value.localeCompare(b.value);
    });

    return mapped;
  }

  private getBestAccuracyFromRow(row?: FamilleAccuracyRow): number {
    if (!row) return 0;
    const vals = [
      row.XGBoost,
      row.LightGBM,
      row.CatBoost,
      row.RandomForest,
      row.LinearRegression
    ].filter((v): v is number => typeof v === 'number');
    return vals.length ? Math.max(...vals) : 0;
  }

  private getTier(acc: number): Tier {
    if (acc >= 60) return 'high';
    if (acc >= 40) return 'medium';
    return 'low';
  }

  // ---------- Stores: FULL Spring pagination ∩ ML codes ----------

  private emptySpringPage(): MagasinPageResponse {
    return {
      content: [],
      empty: true,
      first: true,
      last: true,
      number: 0,
      numberOfElements: 0,
      size: 0,
      totalElements: 0,
      totalPages: 0
    };
  }

  private getSpringPage(page: number, size = 100): Observable<MagasinPageResponse> {
    return this.http
      .get<MagasinPageResponse>(`${this.springApi}?page=${page}&size=${size}`)
      .pipe(catchError(() => of(this.emptySpringPage())));
  }

  private fetchAllSpringStores(): Observable<MagasinDto[]> {
    const pageSize = 100;

    return this.getSpringPage(0, pageSize).pipe(
      switchMap((firstPage) => {
        const firstContent = firstPage.content ?? [];
        const totalPages = Math.max(firstPage.totalPages ?? 0, 1);

        if (totalPages <= 1) {
          return of(firstContent);
        }

        const requests: Observable<MagasinPageResponse>[] = [];
        for (let p = 1; p < totalPages; p++) {
          requests.push(this.getSpringPage(p, pageSize));
        }

        return forkJoin(requests).pipe(
          map((otherPages) => {
            const all = [...firstContent];
            for (const pg of otherPages) {
              all.push(...(pg.content ?? []));
            }
            return all;
          })
        );
      })
    );
  }

  private loadStoresIntersection() {
    forkJoin({
      springStores: this.fetchAllSpringStores().pipe(catchError(() => of([] as MagasinDto[]))),
      mlRes: this.mlService.getStores().pipe(catchError(() => of({ stores: [] as StoreItem[] })))
    }).subscribe({
      next: ({ springStores, mlRes }) => {
        const mlStores = mlRes.stores ?? [];

        const mlCodeSet = new Set(
          mlStores
            .map(s => (s.code ?? '').trim())
            .filter(Boolean)
        );

        if (mlCodeSet.size === 0) {
          this.magasins = [];
          this.errorMessage = 'No ML stores available (ML /stores returned empty).';
          this.cdr.detectChanges();
          return;
        }

        const springByCode = new Map<string, MagasinDto>();
        for (const s of springStores) {
          const code = (s.code ?? '').trim();
          if (code && !springByCode.has(code)) {
            springByCode.set(code, s);
          }
        }

        // Keep only ML-valid stores; enrich label with Spring name when available
        this.magasins = Array.from(mlCodeSet)
          .map(code => {
            const spring = springByCode.get(code);
            const name = (spring?.magasin ?? '').trim();
            const label = name ? `${name} (${code})` : code;
            return { label, value: code };
          })
          .sort((a, b) => a.label.localeCompare(b.label));

        if (this.selectedMagasin && !this.magasins.some(m => m.value === this.selectedMagasin)) {
          this.selectedMagasin = '';
        }

        // Optional informative message
        const namedCount = this.magasins.filter(m => m.label.includes('(')).length;
        if (namedCount < this.magasins.length) {
          this.errorMessage = `Loaded ${this.magasins.length} ML-valid stores. ${namedCount} have Spring names, ${this.magasins.length - namedCount} are code-only.`;
        } else {
          this.errorMessage = '';
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading stores:', err);
        this.errorMessage = 'Could not load stores.';
        this.cdr.detectChanges();
      }
    });
  }

  // ---------- Weeks ----------

  generateWeeks() {
    this.weeks = [];
    for (let i = 1; i <= 52; i++) {
      this.weeks.push({ label: `Week ${i}`, value: i });
    }
  }

  // ---------- Predict ----------

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
      famille: this.selectedFamille,
      code_mag: this.selectedMagasin,
      year: this.selectedYear,
      week_of_year: this.selectedWeek,
      is_soldes: this.isSoldes ? 1 : 0
    };

    this.mlService.predict(request).subscribe({
      next: (result) => {
        this.predictionResult = result;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        const backendDetail = error?.error?.detail;

        if (Array.isArray(backendDetail)) {
          this.errorMessage = backendDetail.map((e: any) => e?.msg).filter(Boolean).join(' | ');
        } else if (typeof backendDetail === 'string' && backendDetail.trim()) {
          this.errorMessage = backendDetail;
        } else {
          this.errorMessage = 'Prediction failed. Please verify family, store code, and deployed model config.';
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ---------- Helpers ----------

  getSelectedFamilyTier(): Tier | null {
    const f = this.families.find(x => x.value === this.selectedFamille);
    return f?.tier ?? null;
  }

  getTierClass(tier: Tier | null): string {
    if (tier === 'high') return 'tier-high';
    if (tier === 'medium') return 'tier-medium';
    if (tier === 'low') return 'tier-low';
    return '';
  }

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
      case 'red': return 'pi pi-times-circle';
      case 'yellow': return 'pi pi-exclamation-triangle';
      default: return 'pi pi-check-circle';
    }
  }

  getWarningClass(): string {
    if (!this.predictionResult) return '';
    switch (this.predictionResult.warning_level) {
      case 'red': return 'warning-red';
      case 'yellow': return 'warning-yellow';
      default: return 'warning-ok';
    }
  }
}
