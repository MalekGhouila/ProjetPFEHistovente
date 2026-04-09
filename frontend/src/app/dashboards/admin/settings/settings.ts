import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, InputTextModule, ButtonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings {

  settings = {
    anomalyThreshold: 100,
    dormantDays: 90,
    atRiskDeclinePercent: 30,
    lowStockDays: 7,
    dataRefreshHours: 24
  };

  saved: boolean = false;

  saveSettings() {
    this.saved = true;
    setTimeout(() => this.saved = false, 3000);
  }
}
