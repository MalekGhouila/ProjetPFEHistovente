import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  active: boolean;
  idMagasin: number | null;
}

export interface Magasin {
  idMagasin: number;
  magasin: string;
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';
  private magasinUrl = 'http://localhost:8080/api/magasins';

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post('http://localhost:8080/api/auth/register', user);
  }

  updateStore(userId: number, storeId: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/store`, storeId);
  }

  searchStores(query: string): Observable<any> {
    return this.http.get<any>(`${this.magasinUrl}?page=0&size=10`);
  }

  toggleActive(id: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/toggle-active`, {});
  }

}
