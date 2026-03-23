import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Magasin {
  idMagasin: number;
  magasin: string;
  code: string;
  etat: number;
  idVille: number;
  idRegion: number;
  idPays: number;
  idCategorie: number;
}

@Injectable({
  providedIn: 'root'
})
export class MagasinService {
  private apiUrl = 'http://localhost:8080/api/magasins';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
