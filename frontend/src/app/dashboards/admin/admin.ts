import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {

  welcomeMessage: string = '';

  // KPI Data
  totalUsers = '4';
  activeUsers = '4';
  totalRoles = '4';
  systemStatus = 'Healthy';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.welcomeMessage = `Welcome back, ${this.authService.getUsername()}!`;
  }
}
