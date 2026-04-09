import { Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-data-quality',
  standalone: true,
  imports: [ChartModule, TableModule, TagModule, DecimalPipe],
  templateUrl: './data-quality.html',
  styleUrl: './data-quality.css'
})

export class DataQuality implements OnInit {

  // Overall Score
  qualityScore = 74;
  totalRecords = '16,277,213';
  cleanRecords = '12,044,937';
  problematicRecords = '4,232,276';

  // Missing Values Table
  missingValuesData = [
    { column: 'IDArCouleur', missing: 4580234, percentage: 28.1, severity: 'high' },
    { column: 'IDVille', missing: 3890123, percentage: 23.9, severity: 'high' },
    { column: 'IDRegion', missing: 3456789, percentage: 21.2, severity: 'high' },
    { column: 'Saison', missing: 2345678, percentage: 14.4, severity: 'medium' },
    { column: 'CodeArticle', missing: 1234567, percentage: 7.6, severity: 'medium' },
    { column: 'Famille', missing: 456789, percentage: 2.8, severity: 'low' },
    { column: 'PrixVente', missing: 234567, percentage: 1.4, severity: 'low' },
    { column: 'Couleur', missing: 123456, percentage: 0.8, severity: 'low' },
  ];

  // Charts
  missingValuesChartData: any;
  missingValuesChartOptions: any;
  qualityByYearData: any;
  qualityByYearOptions: any;

  ngOnInit() {
    this.initMissingValuesChart();
    this.initQualityByYearChart();
  }

  initMissingValuesChart() {
    this.missingValuesChartData = {
      labels: this.missingValuesData.map(d => d.column),
      datasets: [{
        label: 'Missing Values %',
        data: this.missingValuesData.map(d => d.percentage),
        backgroundColor: this.missingValuesData.map(d => {
          if (d.severity === 'high') return 'rgba(231, 76, 60, 0.8)';
          if (d.severity === 'medium') return 'rgba(241, 196, 15, 0.8)';
          return 'rgba(46, 204, 113, 0.8)';
        }),
        borderWidth: 1
      }]
    };

    this.missingValuesChartOptions = {
      responsive: true,
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: { callback: (value: number) => value + '%' }
        }
      }
    };
  }

  initQualityByYearChart() {
    this.qualityByYearData = {
      labels: ['2021', '2022', '2023', '2024', '2025'],
      datasets: [
        {
          label: 'Complete Records %',
          data: [85, 78, 72, 74, 76],
          backgroundColor: 'rgba(46, 204, 113, 0.7)',
          borderColor: '#2ecc71',
          borderWidth: 1
        },
        {
          label: 'Incomplete Records %',
          data: [15, 22, 28, 26, 24],
          backgroundColor: 'rgba(231, 76, 60, 0.7)',
          borderColor: '#e74c3c',
          borderWidth: 1
        }
      ]
    };

    this.qualityByYearOptions = {
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { stacked: true },
        y: {
          stacked: true,
          beginAtZero: true,
          max: 100,
          ticks: { callback: (value: number) => value + '%' }
        }
      }
    };
  }

  getSeverity(severity: string): 'success' | 'warn' | 'danger' {
    switch(severity) {
      case 'high': return 'danger';
      case 'medium': return 'warn';
      case 'low': return 'success';
      default: return 'success';
    }
  }
}
