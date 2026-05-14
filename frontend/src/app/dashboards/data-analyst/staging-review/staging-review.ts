import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Paginator } from 'primeng/paginator';
import { StagingService, StagingRow, ReviewCounts } from '../../../core/services/staging.service';

@Component({
  selector: 'app-staging-review',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DecimalPipe, DatePipe,
    TableModule, TagModule, ButtonModule,
    DialogModule, InputTextModule, Paginator
  ],
  templateUrl: './staging-review.html',
  styleUrls: ['./staging-review.css']
})
export class StagingReview implements OnInit {

  // KPI counts
  counts: ReviewCounts = { PENDING: 0, CLEANED: 0, REJECTED: 0, problems: 0, autoValid: 0 };

  // Pending table
  pendingRows: StagingRow[] = [];
  pendingTotal = 0;
  pendingPage = 0;
  pendingSize = 50;
  loadingPending = false;

  // Problems table
  problemRows: StagingRow[] = [];
  problemTotal = 0;
  problemPage = 0;
  problemSize = 50;
  loadingProblems = false;

  // Reject dialog
  rejectDialogVisible = false;
  rejectReason = '';
  rejectTargetId: number | null = null;

  // Bulk approve confirm dialog
  bulkDialogVisible = false;
  bulkApproving = false;
  lastBulkCount = 0;

  constructor(
    private stagingService: StagingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loadCounts();
    this.loadPending();
    this.loadProblems();
  }

  loadCounts(): void {
    this.stagingService.getReviewCounts().subscribe({
      next: (c) => { this.counts = c; this.cdr.detectChanges(); }
    });
  }

  loadPending(): void {
    this.loadingPending = true;
    this.stagingService.getStaging('PENDING', '', '', this.pendingPage, this.pendingSize)
      .subscribe({
        next: (res) => {
          this.pendingRows = res.content;
          this.pendingTotal = res.totalElements;
          this.loadingPending = false;
          this.cdr.detectChanges();
        },
        error: () => { this.loadingPending = false; this.cdr.detectChanges(); }
      });
  }

  loadProblems(): void {
    this.loadingProblems = true;
    this.stagingService.getProblems(this.problemPage, this.problemSize).subscribe({
      next: (res) => {
        this.problemRows = res.content;
        this.problemTotal = res.totalElements;
        this.loadingProblems = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingProblems = false; this.cdr.detectChanges(); }
    });
  }

  // ── Single approve ─────────────────────────────────────────────
  approve(id: number): void {
    this.stagingService.approveOne(id).subscribe({
      next: () => this.loadAll()
    });
  }

  // ── Open reject dialog ─────────────────────────────────────────
  openReject(id: number): void {
    this.rejectTargetId = id;
    this.rejectReason = '';
    this.rejectDialogVisible = true;
  }

  confirmReject(): void {
    if (!this.rejectTargetId) return;
    this.stagingService.rejectOne(this.rejectTargetId, this.rejectReason).subscribe({
      next: () => {
        this.rejectDialogVisible = false;
        this.rejectTargetId = null;
        this.loadAll();
      }
    });
  }

  // ── Bulk approve ───────────────────────────────────────────────
  openBulkApprove(): void {
    this.bulkDialogVisible = true;
  }

  confirmBulkApprove(): void {
    this.bulkApproving = true;
    this.stagingService.bulkApprove().subscribe({
      next: (res) => {
        this.lastBulkCount = res.approved;
        this.bulkApproving = false;
        this.bulkDialogVisible = false;
        this.loadAll();
        this.cdr.detectChanges();
      },
      error: () => { this.bulkApproving = false; this.cdr.detectChanges(); }
    });
  }

  // ── Pagination ─────────────────────────────────────────────────
  onPendingPageChange(event: any): void {
    this.pendingPage = event.page;
    this.loadPending();
  }

  onProblemPageChange(event: any): void {
    this.problemPage = event.page;
    this.loadProblems();
  }

  // ── Helpers ────────────────────────────────────────────────────
  getProblems(row: StagingRow): string[] {
    const issues: string[] = [];
    if (!row.quantite || row.quantite <= 0) issues.push('Quantité invalide');
    if (!row.prixVente || row.prixVente <= 0) issues.push('Prix invalide');
    if (!row.dateVente) issues.push('Date manquante');
    if (!row.famille) issues.push('Famille manquante');
    if (!row.codeMag) issues.push('CodeMag manquant');
    return issues;
  }
}
