import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Select } from 'primeng/select';
import { Paginator } from 'primeng/paginator';
import { InputText } from 'primeng/inputtext';
import { StagingService, StagingRow, StatusCounts } from '../../../core/services/staging.service';

@Component({
  selector: 'app-staging-viewer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DecimalPipe,
    DatePipe,
    TableModule,
    Select,
    Paginator,
    InputText
  ],
  templateUrl: './staging-viewer.html',
  styleUrls: ['./staging-viewer.css']
})
export class StagingViewer implements OnInit {

  rows: StagingRow[] = [];
  counts: StatusCounts = { PENDING: 0, CLEANED: 0, REJECTED: 0 };

  selectedStatus = '';
  selectedCodeMag = '';
  selectedFamille = '';

  currentPage = 0;
  pageSize = 50;
  totalElements = 0;
  totalPages = 0;

  loading = false;

  statusOptions = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Cleaned', value: 'CLEANED' },
    { label: 'Rejected', value: 'REJECTED' }
  ];

  constructor(
    private stagingService: StagingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCounts();
    this.loadData();
  }

  loadCounts(): void {
    this.stagingService.getCounts().subscribe(c => {
      this.counts = c;
      this.cdr.detectChanges();
    });
  }

  loadData(): void {
    this.loading = true;
    this.stagingService.getStaging(
      this.selectedStatus,
      this.selectedCodeMag,
      this.selectedFamille,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (res) => {
        this.rows = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadData();
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.loadData();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':  return 'badge-warning';
      case 'CLEANED':  return 'badge-success';
      case 'REJECTED': return 'badge-danger';
      default: return '';
    }
  }
}
