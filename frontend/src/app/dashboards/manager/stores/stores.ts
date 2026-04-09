import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MagasinService, Magasin } from '../../../core/services/magasin.service';

@Component({
  selector: 'app-stores',
  standalone: true,
  imports: [TableModule, TagModule, InputTextModule, FormsModule],
  templateUrl: './stores.html',
  styleUrl: './stores.css'
})
export class Stores implements OnInit {

  stores: Magasin[] = [];
  loading: boolean = true;
  searchValue: string = '';

  constructor(
    private magasinService: MagasinService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadStores();
  }

  loadStores() {
    this.loading = true;
    this.magasinService.getAll().subscribe({
      next: (data: any) => {
        this.stores = data.content || data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading stores:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusSeverity(etat: number): 'success' | 'danger' {
    return etat === 1 ? 'success' : 'danger';
  }

  getStatusLabel(etat: number): string {
    return etat === 1 ? 'Active' : 'Inactive';
  }
}
