import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    private cdr: ChangeDetectorRef,
    private http: HttpClient
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
        this.authService.saveUser(response.username, response.role, response.idMagasin);

        if (response.idMagasin) {
          this.http.get<any>(`http://localhost:8080/api/magasins/${response.idMagasin}`, {
            headers: new HttpHeaders({ Authorization: `Bearer ${response.token}` })
          }).subscribe({
            next: (store) => {
              this.authService.saveStoreName(store.magasin);
              this.authService.saveStoreCode(store.code);
              this.navigateByRole(response.role);  // ← navigate AFTER store saved
              this.loading = false;
              this.cdr.detectChanges();
            },
            error: () => {
              this.authService.saveStoreName(null);
              this.authService.saveStoreCode(null);
              this.navigateByRole(response.role);  // ← navigate even if fetch failed
              this.loading = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          this.navigateByRole(response.role);       // ← no store fetch needed
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.errorMessage = 'Invalid username or password!';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private navigateByRole(role: string) {
    switch (role) {
      case 'ADMIN':               this.router.navigate(['/admin']); break;
      case 'MANAGER':             this.router.navigate(['/manager']); break;
      case 'RESPONSABLE_MAGASIN': this.router.navigate(['/responsable-magasin']); break;
      case 'DATA_ANALYST':        this.router.navigate(['/data-analyst']); break;
      default:                    this.router.navigate(['/login']);
    }
  }
}
