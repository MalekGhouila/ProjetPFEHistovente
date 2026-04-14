import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TaskNotificationService, Task } from '../../core/services/task-notification';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  username: string = '';
  role: string = '';
  showNotifications: boolean = false;
  currentTask: Task | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private taskService: TaskNotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.username = this.authService.getUsername() || '';
    this.role = this.authService.getRole() || '';

    // Subscribe to task notifications
    this.taskService.task$.subscribe((task: Task | null) => {
      this.currentTask = task;
      // Change browser tab title based on task status
      if (task?.status === 'ready') {
        document.title = '🔔 Analysis Ready! - NAF NAF';
      } else if (task?.status === 'calculating') {
        document.title = '⏳ Calculating... - NAF NAF';
      } else {
        document.title = 'NAF NAF - Sales Intelligence Platform';
      }
      this.cdr.detectChanges();
    });
  }

  getRoleDisplay(role: string): string {
    switch(role) {
      case 'ADMIN': return 'Admin';
      case 'MANAGER': return 'Manager';
      case 'RESPONSABLE_MAGASIN': return 'Responsable Magasin';
      case 'DATA_ANALYST': return 'Data Analyst';
      default: return role;
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  goToResults() {
    this.showNotifications = false;
    this.router.navigate(['/manager/custom-analysis']);
  }

  clearNotification() {
    this.taskService.clearTask();
    this.showNotifications = false;
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
