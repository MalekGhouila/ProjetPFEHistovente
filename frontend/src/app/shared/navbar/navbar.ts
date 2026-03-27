import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  username: string = '';
  role: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.username = this.authService.getUsername() || '';
    this.role = this.authService.getRole() || '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
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

}
