import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { FamilleService, Famille } from '../../../core/services/famille.service';

@Component({
  selector: 'app-families',
  standalone: true,
  imports: [TableModule, TagModule, InputTextModule, FormsModule],
  templateUrl: './families.html',
  styleUrl: './families.css'
})
export class Families implements OnInit {

  families: Famille[] = [];
  loading: boolean = true;

  constructor(
    private familleService: FamilleService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadFamilies();
  }

  loadFamilies() {
    this.loading = true;
    this.familleService.getAll().subscribe({
      next: (data: Famille[]) => {
        this.families = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading families:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusSeverity(etat: boolean): 'success' | 'danger' {
    return etat ? 'success' : 'danger';
  }

  getStatusLabel(etat: boolean): string {
    return etat ? 'Active' : 'Inactive';
  }

}
