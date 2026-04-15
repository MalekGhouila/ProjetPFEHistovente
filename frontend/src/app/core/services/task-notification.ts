import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

  private storageKey = 'analysisNotifications';
  private tasksSubject = new BehaviorSubject<Task[]>(this.loadFromStorage());

  tasks$ = this.tasksSubject.asObservable();

  // Load from localStorage on startup
  private loadFromStorage(): Task[] {
    const saved = localStorage.getItem(this.storageKey);
    return saved ? JSON.parse(saved) : [];
  }

  // Save to localStorage
  private saveToStorage(tasks: Task[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
  }

  // Add new task
  addTask(task: Task) {
    const current = this.tasksSubject.value;
    // Remove old task with same filterKey if exists
    const filtered = current.filter(t => t.filterKey !== task.filterKey);
    const updated = [task, ...filtered];
    this.tasksSubject.next(updated);
    this.saveToStorage(updated);
  }

  // Set task as ready
  setReady(filterKey: string) {
    const updated = this.tasksSubject.value.map(t =>
      t.filterKey === filterKey
        ? { ...t, status: 'ready' as const, completedTime: new Date().toISOString() }
        : t
    );
    this.tasksSubject.next(updated);
    this.saveToStorage(updated);
  }

  // Delete one notification
  deleteTask(id: string) {
    const updated = this.tasksSubject.value.filter(t => t.id !== id);
    this.tasksSubject.next(updated);
    this.saveToStorage(updated);
  }

  // Clear all notifications
  clearAll() {
    this.tasksSubject.next([]);
    localStorage.removeItem(this.storageKey);
  }

  // Getters
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
