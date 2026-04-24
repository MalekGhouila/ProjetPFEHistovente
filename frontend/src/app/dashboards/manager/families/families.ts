import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FamilleService, Famille } from '../../../core/services/famille.service';

@Component({
  selector: 'app-families',
  standalone: true,
  imports: [
    FormsModule, TableModule, ButtonModule, InputTextModule,
    DialogModule, ConfirmDialogModule, ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './families.html',
  styleUrl: './families.css'
})
export class Families implements OnInit {

  families: Famille[] = [];
  totalRecords = 0;
  pageSize = 10;
  currentPage = 0;
  loading = false;

  searchValue = '';
  searchTimeout: any;

  sortField: string = 'idArFamille';
  sortOrder: number = 1; // 1 = asc, -1 = desc

  showDialog = false;
  isEditMode = false;
  saving = false;
  editingId: number | null = null;

  formData: Partial<Famille> = { famille: '', code: '', etat: true };

  constructor(
    private familleService: FamilleService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.loadFamilies(); }

  loadFamilies() {
    this.loading = true;
    const direction = this.sortOrder === 1 ? 'asc' : 'desc';
    this.familleService.getPaginated(this.searchValue, this.currentPage, this.pageSize, this.sortField, direction).subscribe({
      next: (data) => {
        this.families = data.content;
        this.totalRecords = data.totalElements;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.showError('Failed to load families');
      }
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.first / event.rows;
    this.pageSize = event.rows;
    if (event.sortField) {
      this.sortField = event.sortField;
      this.sortOrder = event.sortOrder ?? 1;
    }
    this.loadFamilies();
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => { this.currentPage = 0; this.loadFamilies(); }, 400);
  }

  openAddDialog() {
    this.isEditMode = false;
    this.editingId = null;
    this.formData = { famille: '', code: '', etat: true };
    this.showDialog = true;
  }

  openEditDialog(f: Famille) {
    this.isEditMode = true;
    this.editingId = f.idArFamille;
    this.formData = { famille: f.famille, code: f.code, etat: f.etat };
    this.showDialog = true;
  }

  saveDialog() {
    if (!this.formData.famille?.trim()) { this.showError('Family name is required'); return; }
    this.saving = true;
    const req$ = this.isEditMode && this.editingId
      ? this.familleService.update(this.editingId, this.formData)
      : this.familleService.create(this.formData);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.showDialog = false;
        this.loadFamilies();
        this.messageService.add({
          severity: 'success', summary: 'Success',
          detail: this.isEditMode ? 'Family updated' : 'Family created'
        });
      },
      error: (err) => {
        this.saving = false;
        this.showError(err?.error?.message || 'Save failed');
      }
    });
  }

  toggleEtat(f: Famille) {
    this.familleService.toggleEtat(f.idArFamille).subscribe({
      next: (updated) => {
        f.etat = updated.etat;
        this.cdr.detectChanges();
        this.messageService.add({
          severity: 'success',
          summary: updated.etat ? 'Enabled' : 'Disabled',
          detail: `${updated.famille} is now ${updated.etat ? 'active' : 'inactive'}`
        });
      },
      error: () => this.showError('Toggle failed')
    });
  }

  confirmDelete(f: Famille) {
    this.confirmationService.confirm({
      message: `Delete "${f.famille}"? This cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteFamily(f)
    });
  }

  deleteFamily(f: Famille) {
    this.familleService.delete(f.idArFamille).subscribe({
      next: () => {
        this.loadFamilies();
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${f.famille} deleted` });
      },
      error: () => this.showError('Delete failed')
    });
  }

  private showError(msg: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
  }
}
