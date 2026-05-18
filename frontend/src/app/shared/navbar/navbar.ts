import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TaskNotificationService, Task } from '../../core/services/task-notification';
import { DatePipe } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {
  username: string = '';
  role: string = '';
  showNotifications: boolean = false;
  tasks: Task[] = [];

  private blinkInterval: any = null;
  private blinkState: boolean = false;
  private typeInterval: any = null;
  private loopActive: boolean = false;

  private readonly NORMAL_TITLE = 'NAF NAF - Sales Intelligence Platform';
  private readonly CALC_TITLE   = 'Calculating Analysis...';

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
      this.updatePageTitle();
      this.cdr.detectChanges();
    });

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.updatePageTitle();
    });

    // When user comes back to this tab
    document.addEventListener('visibilitychange', () => {
      this.updatePageTitle();
    });
  }

  ngOnDestroy() {
    this.stopAll();
  }

  private isTabVisible(): boolean {
    return document.visibilityState === 'visible';
  }

  private stopAll() {
    this.loopActive = false;
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      clearTimeout(this.blinkInterval);
      this.blinkInterval = null;
      this.blinkState = false;
    }
    if (this.typeInterval) {
      clearInterval(this.typeInterval);
      this.typeInterval = null;
    }
  }

  private typeText(text: string, onDone?: () => void) {
    let i = 0;
    document.title = '_';
    this.typeInterval = setInterval(() => {
      i++;
      document.title = text.slice(0, i) + '_';
      if (i >= text.length) {
        clearInterval(this.typeInterval);
        this.typeInterval = null;
        document.title = text;
        onDone?.();
      }
    }, 45);
  }

  private eraseText(text: string, onDone?: () => void) {
    let i = text.length;
    this.typeInterval = setInterval(() => {
      i--;
      document.title = text.slice(0, i) + (i > 0 ? '_' : '');
      if (i <= 0) {
        clearInterval(this.typeInterval);
        this.typeInterval = null;
        document.title = '_';
        onDone?.();
      }
    }, 30);
  }

  private startCalcLoop() {
    this.loopActive = true;

    const loop = () => {
      if (!this.loopActive) return;

      this.typeText(this.CALC_TITLE, () => {
        if (!this.loopActive) return;

        this.blinkInterval = setTimeout(() => {
          if (!this.loopActive) return;
          this.blinkInterval = null;

          this.eraseText(this.CALC_TITLE, () => {
            if (!this.loopActive) return;

            this.typeText(this.NORMAL_TITLE, () => {
              if (!this.loopActive) return;

              this.blinkInterval = setTimeout(() => {
                if (!this.loopActive) return;
                this.blinkInterval = null;

                this.eraseText(this.NORMAL_TITLE, () => {
                  loop();
                });
              }, 1000);
            });
          });
        }, 1000);
      });
    };

    loop();
  }

  private updatePageTitle() {
    const calculating = this.tasks.some(t => t.status === 'calculating');
    const readyCount  = this.tasks.filter(t => t.status === 'ready').length;
    const tabVisible  = this.isTabVisible();

    this.stopAll();

    if (tabVisible && calculating) {
      // Inside the app tab → run loop animation
      this.startCalcLoop();

    } else if (!tabVisible && calculating) {
      // Outside the tab → static
      document.title = '⏳ Calculating Analysis';

    } else if (!tabVisible && readyCount > 0) {
      // Outside the tab + ready → show notification
      document.title = `🔔 ${readyCount} Analysis Ready! - NAF NAF`;

    } else {
      // Inside tab + done, or nothing happening → normal
      document.title = this.NORMAL_TITLE;
    }
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
    const basePath = this.role === 'ADMIN' ? '/admin' : '/manager';

    localStorage.setItem('redirectedFromNotification', 'true');
    localStorage.setItem('lastCustomFilter', JSON.stringify({
      famille: task.famille,
      saison: task.saison,
      codeMag: task.codeMag
    }));
    this.showNotifications = false;

    const targetUrl = `${basePath}/custom-analysis`;

    if (this.router.url.includes('custom-analysis')) {
      this.router.navigateByUrl(basePath, { skipLocationChange: true }).then(() => {
        this.router.navigate([targetUrl]);
      });
    } else {
      this.router.navigate([targetUrl]);
    }
  }

  deleteNotification(task: Task) {
    this.taskService.deleteTask(task.id);
  }

  clearAllNotifications() {
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
      this.stopAll();
      document.title = this.NORMAL_TITLE;
      localStorage.removeItem('redirectedFromNotification');
      localStorage.removeItem('lastCustomFilter');
      localStorage.removeItem('customAnalysisCalculating');
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
