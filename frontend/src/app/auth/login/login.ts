import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, InputTextModule, PasswordModule, ButtonModule, CardModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onLogin() {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login({
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.authService.saveUser(response.username, response.role);

        switch(response.role) {
          case 'ADMIN':
            this.router.navigate(['/admin']);
            break;
          case 'MANAGER':
            this.router.navigate(['/manager']);
            break;
          case 'RESPONSABLE_MAGASIN':
            this.router.navigate(['/responsable-magasin']);
            break;
          case 'DATA_ANALYST':
            this.router.navigate(['/data-analyst']);
            break;
          default:
            this.router.navigate(['/login']);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Invalid username or password!';
        this.loading = false;
        this.cdr.detectChanges(); // ← Forces UI to update immediately!
      }
    });
  }
}
