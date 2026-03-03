import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

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

  onLogin() {
    console.log('Login:', this.username, this.password);
  }
}
