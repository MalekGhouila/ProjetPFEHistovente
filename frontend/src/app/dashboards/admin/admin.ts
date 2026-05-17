import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {

  welcomeMessage: string = '';

  // KPI Data
  totalUsers = '...';
  activeUsers = '...';
  totalRoles = '4';
  systemStatus = 'Healthy';

  // System status indicators
  statusDatabase:    'loading' | 'ok' | 'error' = 'loading';
  statusApiServer:   'loading' | 'ok' | 'error' = 'loading';
  statusAuthService: 'loading' | 'ok' | 'error' = 'loading';
  statusMlModel:     'loading' | 'ok' | 'pending' | 'error' = 'loading';

  private readonly SPRING_URL = 'http://localhost:8080';
  private readonly ML_URL     = 'http://localhost:8000';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.welcomeMessage = `Welcome back, ${this.authService.getUsername()}!`;
    this.loadUserStats();
    this.loadSystemStatus();
    this.loadMlStatus();
  }

  loadUserStats() {
    this.userService.getAll().subscribe({
      next: (users) => {
        this.totalUsers  = users.length.toString();
        this.activeUsers = users.filter(u => u.active).length.toString();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error loading users:', err)
    });
  }

  loadSystemStatus() {
    this.http.get<{ database: string; apiServer: string; authService: string }>(
      `${this.SPRING_URL}/api/admin/system-status`
    ).subscribe({
      next: (res) => {
        this.statusDatabase    = res.database    === 'OK' ? 'ok' : 'error';
        this.statusApiServer   = res.apiServer   === 'OK' ? 'ok' : 'error';
        this.statusAuthService = res.authService === 'OK' ? 'ok' : 'error';
        this.updateSystemStatus();
        this.cdr.detectChanges();
      },
      error: () => {
        this.statusDatabase    = 'error';
        this.statusApiServer   = 'error';
        this.statusAuthService = 'error';
        this.updateSystemStatus();
        this.cdr.detectChanges();
      }
    });
  }

  loadMlStatus() {
    this.http.get<any>(`${this.ML_URL}/model/status`).subscribe({
      next: (res) => {
        this.statusMlModel = res?.best_model ? 'ok' : 'pending';
        this.updateSystemStatus(); // ✅
        this.cdr.detectChanges();
      },
      error: () => {
        this.statusMlModel = 'pending';
        this.updateSystemStatus(); // ✅
        this.cdr.detectChanges();
      }
    });
  }

  updateSystemStatus() {
    const statuses = [this.statusDatabase, this.statusApiServer, this.statusAuthService];

    if (statuses.includes('loading') || this.statusMlModel === 'loading') {
      this.systemStatus = 'Checking...';
    } else if (statuses.includes('error') || this.statusMlModel === 'error') {
      this.systemStatus = 'Critical';
    } else if (this.statusMlModel === 'pending') {
      this.systemStatus = 'Degraded';
    } else {
      this.systemStatus = 'Healthy';
    }
  }
}
