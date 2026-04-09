import { Component } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-data-monitoring',
  standalone: true,
  imports: [ChartModule, TableModule, TagModule],
  templateUrl: './data-monitoring.html',
  styleUrl: './data-monitoring.css'
})
export class DataMonitoring {

  // KPIs
  rawRecords = '16,277,213';
  cleanRecords = '11,842,122';
  removedRecords = '4,435,091';
  qualityScore = '74%';

  // Data sources status
  dataSourcesStatus = [
    { source: 'histovente (Raw)', records: '16,277,213', status: 'active', lastUpdate: '2025-12-31' },
    { source: 'histovente_clean_v1', records: '11,842,122', status: 'active', lastUpdate: '2026-03-01' },
    { source: 'article', records: '18,542', status: 'active', lastUpdate: '2026-03-15' },
    { source: 'magasin', records: '287', status: 'active', lastUpdate: '2026-03-15' },
    { source: 'arfamille', records: '48', status: 'active', lastUpdate: '2026-03-15' },
  ];

  // Cleaning stats chart
  cleaningChartData: any;
  cleaningChartOptions: any;

  // Quality by year chart
  qualityChartData: any;
  qualityChartOptions: any;

  constructor() {
    this.initCleaningChart();
    this.initQualityChart();
  }

  initCleaningChart() {
    this.cleaningChartData = {
      labels: ['Clean Records', 'Removed Records'],
      datasets: [{
        data: [11842122, 4435091],
        backgroundColor: ['rgba(46, 204, 113, 0.7)', 'rgba(231, 76, 60, 0.7)'],
        borderColor: ['#2ecc71', '#e74c3c'],
        borderWidth: 1
      }]
    };

    this.cleaningChartOptions = {
      responsive: true,
      plugins: { legend: { position: 'right' } }
    };
  }

  initQualityChart() {
    this.qualityChartData = {
      labels: ['2021', '2022', '2023', '2024', '2025'],
      datasets: [
        {
          label: 'Complete %',
          data: [85, 78, 72, 74, 76],
          backgroundColor: 'rgba(46, 204, 113, 0.7)',
          borderColor: '#2ecc71',
          borderWidth: 1
        },
        {
          label: 'Incomplete %',
          data: [15, 22, 28, 26, 24],
          backgroundColor: 'rgba(231, 76, 60, 0.7)',
          borderColor: '#e74c3c',
          borderWidth: 1
        }
      ]
    };

    this.qualityChartOptions = {
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

  getStatusSeverity(status: string): 'success' | 'danger' {
    return status === 'active' ? 'success' : 'danger';
  }
}
