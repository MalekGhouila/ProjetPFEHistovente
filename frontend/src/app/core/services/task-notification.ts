import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

export interface Task {
  id: string;
  filterKey: string;
  famille: string;
  saison: string;
  codeMag: string;
  status: 'calculating' | 'ready';
  startTime: string;
  completedTime?: string;
  params: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskNotificationService {

  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  constructor(private authService: AuthService) {
    this.tasksSubject.next(this.loadFromStorage());
  }

  private get storageKey(): string {
    const username = this.authService.getUsername() || 'unknown';
    return `analysisNotifications_${username}`;
  }

  private loadFromStorage(): Task[] {
    const saved = localStorage.getItem(this.storageKey);
    return saved ? JSON.parse(saved) : [];
  }

  private saveToStorage(tasks: Task[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
  }

  // Call this on navbar init to reload the correct user's notifications
  reloadForCurrentUser() {
    this.tasksSubject.next(this.loadFromStorage());
  }

  addTask(task: Task) {
    const current = this.tasksSubject.value;
    const filtered = current.filter(t => t.filterKey !== task.filterKey);
    const updated = [task, ...filtered];
    this.tasksSubject.next(updated);
    this.saveToStorage(updated);
  }

  setReady(filterKey: string) {
    const updated = this.tasksSubject.value.map(t =>
      t.filterKey === filterKey
        ? { ...t, status: 'ready' as const, completedTime: new Date().toISOString() }
        : t
    );
    this.tasksSubject.next(updated);
    this.saveToStorage(updated);
  }

  deleteTask(id: string) {
    const updated = this.tasksSubject.value.filter(t => t.id !== id);
    this.tasksSubject.next(updated);
    this.saveToStorage(updated);
  }

  clearAll() {
    this.tasksSubject.next([]);
    localStorage.removeItem(this.storageKey);
  }

  getTasks(): Task[] {
    return this.tasksSubject.value;
  }

  isCalculating(): boolean {
    return this.tasksSubject.value.some(t => t.status === 'calculating');
  }

  hasNotifications(): boolean {
    return this.tasksSubject.value.length > 0;
  }

  readyCount(): number {
    return this.tasksSubject.value.filter(t => t.status === 'ready').length;
  }

  getCalculatingTask(): Task | undefined {
    return this.tasksSubject.value.find(t => t.status === 'calculating');
  }
}
