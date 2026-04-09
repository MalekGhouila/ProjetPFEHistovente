import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../../core/services/user.service';
import { MagasinService, Magasin } from '../../../core/services/magasin.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    TableModule, TagModule, ButtonModule,
    DialogModule, InputTextModule, PasswordModule,
    SelectModule, FormsModule, AutoCompleteModule
  ],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {

  users: User[] = [];
  loading: boolean = true;
  showDialog: boolean = false;
  showEditStoreDialog: boolean = false;

  newUser = {
    username: '',
    email: '',
    password: '',
    role: '',
    idMagasin: null as number | null
  };

  // Autocomplete - string binding
  selectedStoreText: string = '';
  selectedEditStoreText: string = '';

  // Actual objects for ID extraction
  selectedStoreObject: any = null;
  selectedEditStoreObject: any = null;

  filteredStores: any[] = [];
  filteredEditStores: any[] = [];
  allStores: Magasin[] = [];

  selectedUserId: number | null = null;

  roles = [
    { label: 'ADMIN', value: 'ADMIN' },
    { label: 'MANAGER', value: 'MANAGER' },
    { label: 'RESPONSABLE_MAGASIN', value: 'RESPONSABLE_MAGASIN' },
    { label: 'DATA_ANALYST', value: 'DATA_ANALYST' }
  ];

  constructor(
    private userService: UserService,
    private magasinService: MagasinService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadAllStores();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading users:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAllStores() {
    this.magasinService.getAll().subscribe({
      next: (data: any) => {
        this.allStores = data.content || data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error loading stores:', err)
    });
  }

  searchStores(event: any) {
    const query = event.query.toLowerCase();
    this.filteredStores = this.allStores
      .filter(s => s.magasin?.toLowerCase().includes(query) ||
        s.code?.toLowerCase().includes(query))
      .slice(0, 10);
  }

  searchEditStores(event: any) {
    const query = event.query.toLowerCase();
    this.filteredEditStores = this.allStores
      .filter(s => s.magasin?.toLowerCase().includes(query) ||
        s.code?.toLowerCase().includes(query))
      .slice(0, 10);
  }

  onStoreSelect(event: any) {
    const store = event.value || event;
    this.selectedStoreObject = store;
    this.selectedStoreText = `${store.magasin} - ${store.code}`;
  }

  onEditStoreSelect(event: any) {
    const store = event.value || event;
    this.selectedEditStoreObject = store;
    this.selectedEditStoreText = `${store.magasin} - ${store.code}`;
  }


  openCreateDialog() {
    this.newUser = { username: '', email: '', password: '', role: '', idMagasin: null };
    this.selectedStoreText = '';
    this.selectedStoreObject = null;
    this.showDialog = true;
  }

  openEditStoreDialog(user: User) {
    this.selectedUserId = user.id;
    this.selectedEditStoreText = '';
    this.selectedEditStoreObject = null;
    this.showEditStoreDialog = true;
  }

  createUser() {
    if (this.newUser.role === 'RESPONSABLE_MAGASIN' && !this.selectedStoreObject) {
      alert('Please select a store for Responsable Magasin!');
      return;
    }
    if (this.selectedStoreObject) {
      this.newUser.idMagasin = this.selectedStoreObject.idMagasin;
    }
    this.userService.createUser(this.newUser).subscribe({
      next: () => {
        this.showDialog = false;
        this.loadUsers();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error creating user:', err)
    });
  }

  updateStore() {
    if (!this.selectedEditStoreObject || !this.selectedUserId) {
      alert('Please select a store!');
      return;
    }
    this.userService.updateStore(
      this.selectedUserId,
      this.selectedEditStoreObject.idMagasin
    ).subscribe({
      next: () => {
        this.showEditStoreDialog = false;
        this.loadUsers();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error updating store:', err)
    });
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('Error deleting user:', err)
      });
    }
  }

  getRoleSeverity(role: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch(role) {
      case 'ADMIN': return 'danger';
      case 'MANAGER': return 'info';
      case 'RESPONSABLE_MAGASIN': return 'warn';
      case 'DATA_ANALYST': return 'success';
      default: return 'info';
    }
  }

  getActiveSeverity(active: boolean): 'success' | 'danger' {
    return active ? 'success' : 'danger';
  }

  getStoreName(idMagasin: number | null): string {
    if (!idMagasin) return 'N/A';
    const store = this.allStores.find(s => s.idMagasin === idMagasin);
    return store ? `${store.magasin} (${store.code})` : `ID: ${idMagasin}`;
  }

  toggleActive(user: User) {
    const action = user.active ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} user "${user.username}"?`)) {
      this.userService.toggleActive(user.id).subscribe({
        next: () => {
          this.loadUsers();
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('Error toggling user status:', err)
      });
    }
  }

}
