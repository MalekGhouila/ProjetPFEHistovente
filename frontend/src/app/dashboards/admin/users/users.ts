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
import { UserService, User, UpdateUserRequest } from '../../../core/services/user.service';
import { MagasinService, Magasin } from '../../../core/services/magasin.service';
import { AuthService } from '../../../core/services/auth.service';

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
  showEditDialog: boolean = false;
  showEditStoreDialog: boolean = false;

  // Inline validation errors
  createErrors: { [key: string]: string } = {};
  editErrors: { [key: string]: string } = {};
  editStoreError: string = '';

  // Confirm delete/toggle state
  showDeleteConfirm: boolean = false;
  showToggleConfirm: boolean = false;
  pendingDeleteId: number | null = null;
  pendingToggleUser: User | null = null;

  newUser = {
    username: '',
    email: '',
    password: '',
    role: '',
    idMagasin: null as number | null
  };

  editUser = {
    id: null as number | null,
    username: '',
    email: '',
    password: '',
    role: '',
    idMagasin: null as number | null
  };

  // Autocomplete - string binding
  selectedStoreText: string = '';
  selectedEditStoreText: string = '';
  selectedEditUserStoreText: string = '';

  // Actual objects for ID extraction
  selectedStoreObject: any = null;
  selectedEditStoreObject: any = null;
  selectedEditUserStoreObject: any = null;

  filteredStores: any[] = [];
  filteredEditStores: any[] = [];
  filteredEditUserStores: any[] = [];
  allStores: Magasin[] = [];

  selectedUserId: number | null = null;

  // Current logged-in username for self-delete guard
  currentUsername: string | null = null;

  roles = [
    { label: 'ADMIN', value: 'ADMIN' },
    { label: 'MANAGER', value: 'MANAGER' },
    { label: 'RESPONSABLE_MAGASIN', value: 'RESPONSABLE_MAGASIN' },
    { label: 'DATA_ANALYST', value: 'DATA_ANALYST' }
  ];

  constructor(
    private userService: UserService,
    private magasinService: MagasinService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUsername = this.authService.getUsername();
    this.loadUsers();
    this.loadAllStores();
  }

  // ── Self-delete guard ─────────────────────────────────────────────

  canDelete(user: User): boolean {
    return user.username !== this.currentUsername;
  }

  // ── Data loaders ──────────────────────────────────────────────────

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

  // ── Validation ────────────────────────────────────────────────────

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  private validateCreate(): boolean {
    this.createErrors = {};
    if (!this.newUser.username.trim()) {
      this.createErrors['username'] = 'Username is required.';
    }
    if (this.newUser.email && !this.isValidEmail(this.newUser.email)) {
      this.createErrors['email'] = 'Please enter a valid email address.';
    }
    if (!this.newUser.password.trim()) {
      this.createErrors['password'] = 'Password is required.';
    }
    if (!this.newUser.role) {
      this.createErrors['role'] = 'Please select a role.';
    }
    if (this.newUser.role === 'RESPONSABLE_MAGASIN' && !this.selectedStoreObject) {
      this.createErrors['store'] = 'Please select a store for Responsable Magasin.';
    }
    return Object.keys(this.createErrors).length === 0;
  }

  private validateEdit(): boolean {
    this.editErrors = {};
    if (!this.editUser.username.trim()) {
      this.editErrors['username'] = 'Username is required.';
    }
    if (this.editUser.email && !this.isValidEmail(this.editUser.email)) {
      this.editErrors['email'] = 'Please enter a valid email address.';
    }
    if (!this.editUser.role) {
      this.editErrors['role'] = 'Please select a role.';
    }
    if (this.editUser.role === 'RESPONSABLE_MAGASIN' && !this.editUser.idMagasin) {
      this.editErrors['store'] = 'Please select a store for Responsable Magasin.';
    }
    return Object.keys(this.editErrors).length === 0;
  }

  // ── Autocomplete search handlers ──────────────────────────────────

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

  searchEditUserStores(event: any) {
    const query = event.query.toLowerCase();
    this.filteredEditUserStores = this.allStores
      .filter(s => s.magasin?.toLowerCase().includes(query) ||
        s.code?.toLowerCase().includes(query))
      .slice(0, 10);
  }

  // ── Select handlers ───────────────────────────────────────────────

  onStoreSelect(event: any) {
    const store = event.value || event;
    this.selectedStoreObject = store;
    this.selectedStoreText = `${store.magasin} - ${store.code}`;
    delete this.createErrors['store'];
  }

  onEditStoreSelect(event: any) {
    const store = event.value || event;
    this.selectedEditStoreObject = store;
    this.selectedEditStoreText = `${store.magasin} - ${store.code}`;
    this.editStoreError = '';
  }

  onEditUserStoreSelect(event: any) {
    const store = event.value || event;
    this.selectedEditUserStoreObject = store;
    this.selectedEditUserStoreText = `${store.magasin} - ${store.code}`;
    this.editUser.idMagasin = store.idMagasin;
    delete this.editErrors['store'];
  }

  // ── Dialog openers ────────────────────────────────────────────────

  openCreateDialog() {
    this.newUser = { username: '', email: '', password: '', role: '', idMagasin: null };
    this.selectedStoreText = '';
    this.selectedStoreObject = null;
    this.createErrors = {};
    this.showDialog = true;
  }

  openEditDialog(user: User) {
    this.editUser = {
      id: user.id,
      username: user.username,
      email: user.email ?? '',
      password: '',
      role: user.role,
      idMagasin: user.idMagasin
    };

    const existing = this.allStores.find(s => s.idMagasin === user.idMagasin);
    if (existing) {
      this.selectedEditUserStoreObject = existing;
      this.selectedEditUserStoreText = `${existing.magasin} - ${existing.code}`;
    } else {
      this.selectedEditUserStoreObject = null;
      this.selectedEditUserStoreText = '';
    }

    this.editErrors = {};
    this.showEditDialog = true;
  }

  openEditStoreDialog(user: User) {
    this.selectedUserId = user.id;
    this.selectedEditStoreText = '';
    this.selectedEditStoreObject = null;
    this.editStoreError = '';
    this.showEditStoreDialog = true;
  }

  // ── Confirm delete/toggle dialogs ─────────────────────────────────

  confirmDelete(user: User) {
    if (!this.canDelete(user)) return;
    this.pendingDeleteId = user.id;
    this.showDeleteConfirm = true;
  }

  confirmToggle(user: User) {
    this.pendingToggleUser = user;
    this.showToggleConfirm = true;
  }

  cancelDelete() {
    this.pendingDeleteId = null;
    this.showDeleteConfirm = false;
  }

  cancelToggle() {
    this.pendingToggleUser = null;
    this.showToggleConfirm = false;
  }

  // ── CRUD actions ──────────────────────────────────────────────────

  createUser() {
    if (!this.validateCreate()) return;

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

  saveEditUser() {
    if (!this.editUser.id) return;
    if (!this.validateEdit()) return;

    const req: UpdateUserRequest = {
      username: this.editUser.username,
      email: this.editUser.email || null,
      role: this.editUser.role,
      idMagasin: this.editUser.idMagasin
    };

    if (this.editUser.password?.trim()) {
      req.password = this.editUser.password.trim();
    }

    this.userService.updateUser(this.editUser.id, req).subscribe({
      next: () => {
        this.showEditDialog = false;
        this.loadUsers();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error updating user:', err)
    });
  }

  updateStore() {
    if (!this.selectedEditStoreObject || !this.selectedUserId) {
      this.editStoreError = 'Please select a store.';
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

  deleteUser() {
    if (!this.pendingDeleteId) return;
    this.userService.deleteUser(this.pendingDeleteId).subscribe({
      next: () => {
        this.showDeleteConfirm = false;
        this.pendingDeleteId = null;
        this.loadUsers();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error deleting user:', err)
    });
  }

  toggleActive() {
    if (!this.pendingToggleUser) return;
    this.userService.toggleActive(this.pendingToggleUser.id).subscribe({
      next: () => {
        this.showToggleConfirm = false;
        this.pendingToggleUser = null;
        this.loadUsers();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error toggling user status:', err)
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────

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

  removeReadonly(event: Event) {
    (event.target as HTMLInputElement).removeAttribute('readonly');
  }
}
