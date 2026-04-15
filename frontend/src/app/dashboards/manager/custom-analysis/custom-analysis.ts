import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { TaskNotificationService } from '../../../core/services/task-notification';

@Component({
  selector: 'app-custom-analysis',
  standalone: true,
  imports: [FormsModule, ButtonModule, SelectModule, ChartModule, TagModule, DatePipe],
  templateUrl: './custom-analysis.html',
  styleUrl: './custom-analysis.css'
})
export class CustomAnalysis implements OnInit {

  selectedFamille: string = '';
  selectedSaison: string = '';
  selectedCodeMag: string = '';

  familles: { label: string, value: string }[] = [];
  saisons: { label: string, value: string }[] = [];
  stores: { label: string, value: string }[] = [];

  isCalculating: boolean = false;
  hasData: boolean = false;
  lastUpdated: string = '';

  totalTransactions = '...';
  totalRevenue = '...';

  monthlySalesData: any;
  monthlySalesOptions: any;
  familyData: any;
  familyOptions: any;

  private apiUrl = 'http://localhost:8080/api/analytics/custom';
  private storageKey = 'customAnalysisCalculating';
  private lastFilterKey = 'lastCustomFilter';
  private redirectKey = 'redirectedFromNotification';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private taskService: TaskNotificationService
  ) {}

  ngOnInit() {
    this.loadFilterOptions();
    this.initChartOptions();

    const savedState = localStorage.getItem(this.storageKey);
    const redirectFromNotification = localStorage.getItem(this.redirectKey);

    if (savedState) {
      const state = JSON.parse(savedState);
      this.selectedFamille = state.famille || '';
      this.selectedSaison = state.saison || '';
      this.selectedCodeMag = state.codeMag || '';
      this.isCalculating = true;

      // Restore task using addTask
      this.taskService.addTask({
        id: state.id || Date.now().toString(),
        filterKey: this.buildFilterKey(),
        famille: this.selectedFamille,
        saison: this.selectedSaison,
        codeMag: this.selectedCodeMag,
        status: 'calculating',
        startTime: state.startTime,
        params: this.buildParams()
      });

      this.cdr.detectChanges();
      const params = this.buildParamsFromValues(state.famille, state.saison, state.codeMag);
      this.pollStatusWithCancel(params, state.startTime, this.buildFilterKey());

    } else if (redirectFromNotification) {
      localStorage.removeItem(this.redirectKey);
      const lastFilter = localStorage.getItem(this.lastFilterKey);
      if (lastFilter) {
        const filter = JSON.parse(lastFilter);
        this.selectedFamille = filter.famille || '';
        this.selectedSaison = filter.saison || '';
        this.selectedCodeMag = filter.codeMag || '';
        const params = this.buildParamsFromValues(filter.famille, filter.saison, filter.codeMag);
        this.loadResults(params);
      } else {
        this.loadGlobalData();
      }
    } else {
      localStorage.removeItem(this.lastFilterKey);
      this.loadGlobalData();
    }
  }

  initChartOptions() {
    this.monthlySalesOptions = {
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: { y: { beginAtZero: true } }
    };
    this.familyOptions = {
      responsive: true,
      plugins: { legend: { position: 'right' } }
    };
  }

  loadFilterOptions() {
    this.http.get<any[]>('http://localhost:8080/api/familles').subscribe({
      next: (data) => {
        this.familles = data.filter(f => f.famille).map(f => ({ label: f.famille, value: f.famille }));
        this.cdr.detectChanges();
      }
    });

    this.http.get<any[]>('http://localhost:8080/api/saisons').subscribe({
      next: (data) => {
        this.saisons = data.filter(s => s.saison).map(s => ({ label: s.saison, value: s.code }));
        this.cdr.detectChanges();
      }
    });

    this.http.get<any>('http://localhost:8080/api/magasins').subscribe({
      next: (data) => {
        const stores = data.content || data;
        this.stores = stores.filter((s: any) => s.magasin)
          .map((s: any) => ({ label: `${s.magasin} (${s.code})`, value: s.code }));
        this.cdr.detectChanges();
      }
    });
  }

  loadGlobalData() {
    this.http.get<any>('http://localhost:8080/api/analytics/kpis').subscribe({
      next: (data) => {
        this.totalTransactions = data.totalTransactions.toLocaleString();
        this.totalRevenue = '€ ' + (data.totalRevenue / 1000000).toFixed(2) + 'M';
        this.hasData = true;
        this.lastUpdated = '';
        this.cdr.detectChanges();
      }
    });

    this.http.get<any[]>('http://localhost:8080/api/analytics/monthly-sales').subscribe({
      next: (data) => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        this.monthlySalesData = {
          labels: data.map(d => {
            const monthNum = d.month.includes('-')
              ? parseInt(d.month.split('-')[1])
              : parseInt(d.month);
            return monthNames[monthNum - 1];
          }),
          datasets: [{
            label: 'Global Sales 2024',
            data: data.map(d => d.totalSales),
            borderColor: '#6c3483',
            backgroundColor: 'rgba(108, 52, 131, 0.1)',
            tension: 0.4,
            fill: true
          }]
        };
        this.cdr.detectChanges();
      }
    });

    this.http.get<any[]>('http://localhost:8080/api/analytics/sales-by-family').subscribe({
      next: (data) => {
        this.familyData = {
          labels: data.map(d => d.famille),
          datasets: [{
            data: data.map(d => d.totalSales),
            backgroundColor: ['#6c3483', '#e91e8c', '#9b59b6', '#3498db', '#2ecc71', '#e74c3c']
          }]
        };
        this.cdr.detectChanges();
      }
    });
  }

  saveCalculatingState(id: string) {
    const state = {
      id: id,
      famille: this.selectedFamille,
      saison: this.selectedSaison,
      codeMag: this.selectedCodeMag,
      startTime: new Date().toISOString()
    };
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  clearCalculatingState() {
    localStorage.removeItem(this.storageKey);
  }

  cancelCalculation() {
    this.clearCalculatingState();
    // Remove calculating task from service
    const calc = this.taskService.getCalculatingTask();
    if (calc) this.taskService.deleteTask(calc.id);
    this.isCalculating = false;
    this.cdr.detectChanges();
  }

  generateAnalysis() {
    if (this.taskService.isCalculating()) {
      if (!confirm('A calculation is already running. Stop it and start new one?')) {
        return;
      }
      this.cancelCalculation();
    }

    const params = this.buildParams();
    const filterKey = this.buildFilterKey();

    // Check if already calculated
    this.http.get<any>(`${this.apiUrl}/status${params}`).subscribe({
      next: (status) => {
        if (status.hasData && !status.isCalculating) {
          // ← Already calculated! Show existing data instantly
          this.loadResults(params);
          // isCalculating stays false - no spinner needed
        } else if (!status.isCalculating) {
          // Not calculated → trigger calculation
          const taskId = Date.now().toString();
          this.isCalculating = true;
          this.saveCalculatingState(taskId);
          this.taskService.addTask({
            id: taskId,
            filterKey: filterKey,
            famille: this.selectedFamille,
            saison: this.selectedSaison,
            codeMag: this.selectedCodeMag,
            status: 'calculating',
            startTime: new Date().toISOString(),
            params: params
          });
          this.cdr.detectChanges();

          this.http.post<any>(`${this.apiUrl}/calculate${params}`, {}).subscribe({
            next: () => this.pollStatusWithCancel(params, new Date().toISOString(), filterKey),
            error: (err: any) => {
              console.error(err);
              this.clearCalculatingState();
              const calc = this.taskService.getCalculatingTask();
              if (calc) this.taskService.deleteTask(calc.id);
              this.isCalculating = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          this.pollStatusWithCancel(params, new Date().toISOString(), filterKey);
        }
      }
    });
  }

  pollStatusWithCancel(params: string, startTime: string, filterKey: string) {
    const interval = setInterval(() => {
      if (!localStorage.getItem(this.storageKey)) {
        clearInterval(interval);
        this.isCalculating = false;
        this.cdr.detectChanges();
        return;
      }

      this.http.get<any>(`${this.apiUrl}/status${params}`).subscribe({
        next: (status) => {
          if (!status.isCalculating && status.hasData &&
            new Date(status.lastUpdated) > new Date(startTime)) {
            clearInterval(interval);
            this.clearCalculatingState();
            this.taskService.setReady(filterKey);
            this.loadResults(params);
          }
        }
      });
    }, 5000);
  }

  loadResults(params: string) {
    this.clearCalculatingState();

    localStorage.setItem(this.lastFilterKey, JSON.stringify({
      famille: this.selectedFamille,
      saison: this.selectedSaison,
      codeMag: this.selectedCodeMag
    }));

    this.http.get<any>(`${this.apiUrl}/kpis${params}`).subscribe({
      next: (data) => {
        if (data.hasData) {
          this.totalTransactions = data.totalTransactions.toLocaleString();
          this.totalRevenue = '€ ' + (data.totalRevenue / 1000000).toFixed(2) + 'M';
          this.lastUpdated = data.lastUpdated;
          this.hasData = true;
        }
        this.isCalculating = false;
        this.cdr.detectChanges();
      }
    });

    this.http.get<any>(`${this.apiUrl}/monthly-sales${params}`).subscribe({
      next: (data) => {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        if (parsed && parsed.length > 0) {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          this.monthlySalesData = {
            labels: parsed.map((d: any) => monthNames[parseInt(d.month.split('-')[1]) - 1]),
            datasets: [{
              label: 'Sales',
              data: parsed.map((d: any) => d.totalSales),
              borderColor: '#6c3483',
              backgroundColor: 'rgba(108, 52, 131, 0.1)',
              tension: 0.4,
              fill: true
            }]
          };
          this.cdr.detectChanges();
        }
      }
    });

    this.http.get<any>(`${this.apiUrl}/sales-by-family${params}`).subscribe({
      next: (data) => {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        if (parsed && parsed.length > 0) {
          this.familyData = {
            labels: parsed.map((d: any) => d.famille),
            datasets: [{
              data: parsed.map((d: any) => d.totalSales),
              backgroundColor: ['#6c3483', '#e91e8c', '#9b59b6', '#3498db', '#2ecc71', '#e74c3c']
            }]
          };
          this.cdr.detectChanges();
        }
      }
    });
  }

  checkStatusAndLoad(famille: string, saison: string, codeMag: string) {
    const params = this.buildParamsFromValues(famille, saison, codeMag);
    this.http.get<any>(`${this.apiUrl}/status${params}`).subscribe({
      next: (status) => {
        if (status.hasData) {
          this.loadResults(params);
        }
        this.cdr.detectChanges();
      }
    });
  }

  buildFilterKey(): string {
    return (this.selectedFamille || 'ALL') + '_' +
      (this.selectedSaison || 'ALL') + '_' +
      (this.selectedCodeMag || 'ALL');
  }

  buildParams(): string {
    const params: string[] = [];
    if (this.selectedFamille) params.push(`famille=${this.selectedFamille}`);
    if (this.selectedSaison) params.push(`saison=${this.selectedSaison}`);
    if (this.selectedCodeMag) params.push(`codeMag=${this.selectedCodeMag}`);
    return params.length > 0 ? '?' + params.join('&') : '';
  }

  buildParamsFromValues(famille: string, saison: string, codeMag: string): string {
    const params: string[] = [];
    if (famille) params.push(`famille=${famille}`);
    if (saison) params.push(`saison=${saison}`);
    if (codeMag) params.push(`codeMag=${codeMag}`);
    return params.length > 0 ? '?' + params.join('&') : '';
  }

  resetFilters() {
    this.selectedFamille = '';
    this.selectedSaison = '';
    this.selectedCodeMag = '';
    localStorage.removeItem(this.lastFilterKey);
    this.loadGlobalData();
  }

  forceRecalculate() {
    if (this.taskService.isCalculating()) {
      if (!confirm('A calculation is already running. Stop it and start new one?')) {
        return;
      }
      this.cancelCalculation();
    }

    const taskId = Date.now().toString();
    const params = this.buildParams();
    const filterKey = this.buildFilterKey();

    this.isCalculating = true;
    this.saveCalculatingState(taskId);

    this.taskService.addTask({
      id: taskId,
      filterKey: filterKey,
      famille: this.selectedFamille,
      saison: this.selectedSaison,
      codeMag: this.selectedCodeMag,
      status: 'calculating',
      startTime: new Date().toISOString(),
      params: params
    });

    this.cdr.detectChanges();

    this.http.post<any>(`${this.apiUrl}/calculate${params}`, {}).subscribe({
      next: () => this.pollStatusWithCancel(params, new Date().toISOString(), filterKey),
      error: (err: any) => {
        console.error(err);
        this.clearCalculatingState();
        const calc = this.taskService.getCalculatingTask();
        if (calc) this.taskService.deleteTask(calc.id);
        this.isCalculating = false;
        this.cdr.detectChanges();
      }
    });
  }
}
