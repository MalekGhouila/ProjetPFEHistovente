import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-no-store',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './no-store.html',
  styleUrl: './no-store.css'
})
export class NoStore {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
