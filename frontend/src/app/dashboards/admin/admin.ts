import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {

  welcomeMessage: string = '';

  // KPI Data - will be real
  totalUsers = '...';
  activeUsers = '...';
  totalRoles = '4';
  systemStatus = 'Healthy';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.welcomeMessage = `Welcome back, ${this.authService.getUsername()}!`;
    this.loadUserStats();
  }

  loadUserStats() {
    this.userService.getAll().subscribe({
      next: (users) => {
        this.totalUsers = users.length.toString();
        this.activeUsers = users.filter(u => u.active).length.toString();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error loading users:', err)
    });
  }
}
