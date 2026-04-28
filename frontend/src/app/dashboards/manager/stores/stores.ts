import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MagasinService, Magasin } from '../../../core/services/magasin.service';

@Component({
  selector: 'app-stores',
  standalone: true,
  imports: [
    TableModule, TagModule, InputTextModule, ButtonModule,
    DialogModule, ConfirmDialogModule, ToastModule, FormsModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './stores.html',
  styleUrl: './stores.css'
})
export class Stores implements OnInit {

  stores: Magasin[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 0;
  pageSize = 10;
  searchValue = '';
  searchTimeout: any;

  // ── Sort state ──
  sortField: string = 'idMagasin';
  sortOrder: number = 1; // 1 = asc, -1 = desc

  // ── Dialog ──
  showDialog = false;
  isEditMode = false;
  saving = false;
  editingId: number | null = null;
  formData: Partial<Magasin> = {
    magasin: '', code: '', etat: 1, isBoutique: 0, idPays: 201, idCategorie: 3
  };

  constructor(
    private magasinService: MagasinService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadStores();
  }

  loadStores() {
    this.loading = true;
    const direction = this.sortOrder === 1 ? 'asc' : 'desc';
    this.magasinService.getPaginated(
      this.searchValue,
      this.currentPage,
      this.pageSize,
      this.sortField,
      direction
    ).subscribe({
      next: (data) => {
        this.stores = data.content;
        this.totalRecords = data.totalElements;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading stores:', err);
        this.loading = false;
      }
    });
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 0;
      this.loadStores();
    }, 400);
  }

  onPageChange(event: any) {
    this.currentPage = event.first / event.rows;
    this.pageSize = event.rows;
    if (event.sortField) {
      this.sortField = event.sortField;
      this.sortOrder = event.sortOrder ?? 1;
    }
    this.loadStores();
  }

  openAddDialog() {
    this.isEditMode = false;
    this.editingId = null;
    this.formData = {
      magasin: '', code: '', etat: 1, isBoutique: 0, idPays: 201, idCategorie: 3
    };
    this.showDialog = true;
  }

  openEditDialog(store: Magasin) {
    this.isEditMode = true;
    this.editingId = store.idMagasin;
    this.formData = {
      magasin:     store.magasin,
      code:        store.code,
      etat:        store.etat,
      isBoutique:  store.isBoutique,
      idPays:      Number(store.idPays),
      idCategorie: Number(store.idCategorie)
    };
    this.showDialog = true;
  }

  saveDialog() {
    if (!this.formData.magasin?.trim() || !this.formData.code?.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Name and Code are required' });
      return;
    }
    this.saving = true;
    const req$ = this.isEditMode && this.editingId
      ? this.magasinService.update(this.editingId, this.formData)
      : this.magasinService.create(this.formData);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.showDialog = false;
        this.loadStores();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode ? 'Store updated' : 'Store created'
        });
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.error || 'Operation failed'
        });
      }
    });
  }

  toggleEtat(store: Magasin) {
    this.magasinService.toggleEtat(store.idMagasin).subscribe({
      next: (updated) => {
        store.etat = updated.etat;
        this.cdr.detectChanges();
        this.messageService.add({
          severity: 'success',
          summary: updated.etat === 1 ? 'Enabled' : 'Disabled',
          detail: `${updated.magasin || updated.code} is now ${updated.etat === 1 ? 'active' : 'inactive'}`
        });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Toggle failed' })
    });
  }

  confirmDelete(store: Magasin) {
    this.confirmationService.confirm({
      message: `Delete "${store.magasin || store.code}"? This cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.magasinService.delete(store.idMagasin).subscribe({
          next: () => {
            this.loadStores();
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Store deleted' });
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' })
        });
      }
    });
  }

  getStatusSeverity(etat: number): 'success' | 'danger' {
    return etat === 1 ? 'success' : 'danger';
  }

  getStatusLabel(etat: number): string {
    return etat === 1 ? 'Actif' : 'Inactif';
  }

  // ── Maps ──
  readonly PAYS_MAP: Record<number, string> = {
    200: '🇩🇪 Allemagne',
    201: '🇫🇷 France',
    202: '🇧🇪 Belgique',
    203: '🇪🇸 Espagne',
    204: '🇮🇹 Italie',
    205: '🇵🇹 Portugal',
  };

  readonly CATEGORIE_MAP: Record<number, { label: string; color: string }> = {
    1: { label: 'Franchise',   color: 'cat-franchise' },
    2: { label: 'Groupe',      color: 'cat-groupe'    },
    3: { label: 'Direct',      color: 'cat-direct'    },
    7: { label: 'E-commerce',  color: 'cat-ecom'      },
    8: { label: 'Marketplace', color: 'cat-market'    },
    9: { label: 'Corner',      color: 'cat-corner'    },
  };

  readonly PAYS_ENTRIES = [
    { id: 200, label: '🇩🇪 Allemagne' },
    { id: 201, label: '🇫🇷 France' },
    { id: 202, label: '🇧🇪 Belgique' },
    { id: 203, label: '🇪🇸 Espagne' },
    { id: 204, label: '🇮🇹 Italie' },
    { id: 205, label: '🇵🇹 Portugal' },
  ];

  readonly CATEGORIE_ENTRIES = [
    { id: 1, label: 'Franchise' },
    { id: 2, label: 'Groupe' },
    { id: 3, label: 'Direct' },
    { id: 7, label: 'E-commerce' },
    { id: 8, label: 'Marketplace' },
    { id: 9, label: 'Corner' },
  ];

  // ── Helpers ──
  getPays(idPays: number): string {
    return this.PAYS_MAP[idPays] ?? `Pays ${idPays}`;
  }

  getCategorie(idCat: number): { label: string; color: string } {
    return this.CATEGORIE_MAP[idCat] ?? { label: 'Autre', color: 'cat-autre' };
  }
}
