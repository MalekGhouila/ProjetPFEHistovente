import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.css'
})
export class Unauthorized {
  constructor(private authService: AuthService, private router: Router) {}

  getHomeLink(): string {
    const role = this.authService.getRole();
    switch (role) {
      case 'ADMIN':               return '/admin';
      case 'MANAGER':             return '/manager';
      case 'RESPONSABLE_MAGASIN': return '/responsable-magasin';
      case 'DATA_ANALYST':        return '/data-analyst';
      default:                    return '/login';
    }
  }

  goHome() {
    this.router.navigate([this.getHomeLink()]);
  }
}
