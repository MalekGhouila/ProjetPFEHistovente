import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Famille {
  idArFamille: number;
  code: string;
  famille: string;
  etat: boolean; // ← change from number to boolean
}


@Injectable({
  providedIn: 'root'
})
export class FamilleService {
  private apiUrl = 'http://localhost:8080/api/familles';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Famille[]> {
    return this.http.get<Famille[]>(this.apiUrl);
  }
}
