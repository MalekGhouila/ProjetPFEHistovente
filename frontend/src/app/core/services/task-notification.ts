import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


export interface Task {
  filterKey: string;
  famille: string;
  saison: string;
  codeMag: string;
  status: 'calculating' | 'ready' | 'idle';
  startTime: string;
  params: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskNotificationService {

  private taskSubject = new BehaviorSubject<Task | null>(null);
  task$ = this.taskSubject.asObservable();

  setTask(task: Task) {
    this.taskSubject.next(task);
  }

  setReady() {
    const current = this.taskSubject.value;
    if (current) {
      this.taskSubject.next({ ...current, status: 'ready' });
    }
  }

  clearTask() {
    this.taskSubject.next(null);
  }

  getCurrentTask(): Task | null {
    return this.taskSubject.value;
  }

  isCalculating(): boolean {
    return this.taskSubject.value?.status === 'calculating';
  }

  hasNotification(): boolean {
    return this.taskSubject.value !== null;
  }
}
