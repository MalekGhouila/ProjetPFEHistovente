import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TaskNotificationService, Task } from '../../core/services/task-notification';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
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
