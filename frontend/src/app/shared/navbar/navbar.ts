import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TaskNotificationService, Task } from '../../core/services/task-notification';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  username: string = '';
  role: string = '';
  showNotifications: boolean = false;
  tasks: Task[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private taskService: TaskNotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.username = this.authService.getUsername() || '';
    this.role = this.authService.getRole() || '';

    this.taskService.tasks$.subscribe((tasks: Task[]) => {
      this.tasks = tasks;

      // Update browser tab title
      const calculating = tasks.some(t => t.status === 'calculating');
      const readyCount = tasks.filter(t => t.status === 'ready').length;

      if (calculating) {
        document.title = '⏳ Calculating... - NAF NAF';
      } else if (readyCount > 0) {
        document.title = `🔔 ${readyCount} Analysis Ready! - NAF NAF`;
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

  goToResults(task: Task) {
    localStorage.setItem('redirectedFromNotification', 'true');
    localStorage.setItem('lastCustomFilter', JSON.stringify({
      famille: task.famille,
      saison: task.saison,
      codeMag: task.codeMag
    }));
    this.showNotifications = false;

    // Check if already on custom-analysis page
    if (this.router.url.includes('custom-analysis')) {
      // Force reload by navigating away then back
      this.router.navigateByUrl('/manager', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/manager/custom-analysis']);
      });
    } else {
      this.router.navigate(['/manager/custom-analysis']);
    }
  }

  deleteNotification(task: Task) {
    this.taskService.deleteTask(task.id);
  }

  clearAllNotifications() {
    document.title = 'NAF NAF - Sales Intelligence Platform';
    this.taskService.clearAll();
    this.showNotifications = false;
  }

  getTaskLabel(task: Task): string {
    const parts = [];
    if (task.famille) parts.push(task.famille);
    if (task.saison) parts.push(task.saison);
    if (task.codeMag) parts.push(task.codeMag);
    return parts.length > 0 ? parts.join(' | ') : 'All data';
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      document.title = 'NAF NAF - Sales Intelligence Platform';
      localStorage.removeItem('redirectedFromNotification');
      localStorage.removeItem('lastCustomFilter');
      localStorage.removeItem('customAnalysisCalculating');
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
