import { Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-data-analyst',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './data-analyst.html',
  styleUrl: './data-analyst.css'
})
export class DataAnalyst implements OnInit {

  welcomeMessage: string = '';

  // Data Quality KPIs
  totalRecords = '16,277,213';
  dataQualityScore = '74%';
  missingValues = '26%';
  outliersDetected = '12,453';

  // Missing Values Chart
  missingValuesData: any;
  missingValuesOptions: any;

  // Data Completeness Chart
  completenessData: any;
  completenessOptions: any;

  // Outliers Chart
  outliersData: any;
  outliersOptions: any;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.welcomeMessage = `Welcome back, ${this.authService.getUsername()}!`;
    this.initMissingValuesChart();
    this.initCompletenessChart();
    this.initOutliersChart();
  }

  initMissingValuesChart() {
    this.missingValuesData = {
      labels: ['IDArCouleur', 'IDVille', 'IDRegion', 'Saison', 'CodeArticle', 'Famille'],
      datasets: [{
        label: 'Missing Values %',
        data: [45, 38, 32, 28, 15, 8],
        backgroundColor: [
          'rgba(231, 76, 60, 0.8)',
          'rgba(231, 76, 60, 0.7)',
          'rgba(241, 196, 15, 0.8)',
          'rgba(241, 196, 15, 0.7)',
          'rgba(46, 204, 113, 0.8)',
          'rgba(46, 204, 113, 0.7)',
        ],
        borderWidth: 1
      }]
    };

    this.missingValuesOptions = {
      responsive: true,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        title: { display: false }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value: number) => value + '%'
          }
        }
      }
    };
  }

  initCompletenessChart() {
    this.completenessData = {
      labels: ['2021', '2022', '2023', '2024', '2025'],
      datasets: [
        {
          label: 'Complete Records',
          data: [85, 78, 72, 74, 76],
          backgroundColor: 'rgba(46, 204, 113, 0.7)',
          borderColor: '#2ecc71',
          borderWidth: 1
        },
        {
          label: 'Incomplete Records',
          data: [15, 22, 28, 26, 24],
          backgroundColor: 'rgba(231, 76, 60, 0.7)',
          borderColor: '#e74c3c',
          borderWidth: 1
        }
      ]
    };

    this.completenessOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        x: { stacked: true },
        y: {
          stacked: true,
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value: number) => value + '%'
          }
        }
      }
    };
  }

  initOutliersChart() {
    this.outliersData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Outliers Detected',
        data: [1200, 980, 1100, 890, 750, 820,
          1050, 930, 1180, 1020, 890, 643],
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };

    this.outliersOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        y: { beginAtZero: true }
      }
    };
  }
}
