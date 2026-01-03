// frontend/src/app/services/commande.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateCommandeRequest {
  articleRef: string;
  clientNom: string;
  quantite: number;
  dateSouhaitee: string; // Format: YYYY-MM-DD
}

export interface UpdateCommandeRequest {
  articleRef: string;
  clientNom: string;
  quantite: number;
  dateSouhaitee: string;
}

export interface CommandeResponse {
  id: number;
  articleRef: string;
  articleNom: string;
  clientNom: string;
  quantite: number;
  dateSouhaitee: string;
  dateAjout: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommandeSummaryResponse {
  totalQuantite: number;
  nombreCommandes: number;
}

export interface MessageResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private apiUrl = 'http://localhost:8080/api/commandes';

  constructor(private http: HttpClient) {}

  createCommande(commande: CreateCommandeRequest): Observable<CommandeResponse> {
    return this.http.post<CommandeResponse>(this.apiUrl, commande);
  }

  getAllCommandes(): Observable<CommandeResponse[]> {
    return this.http.get<CommandeResponse[]>(this.apiUrl);
  }

  getCommandeById(id: number): Observable<CommandeResponse> {
    return this.http.get<CommandeResponse>(`${this.apiUrl}/${id}`);
  }

  searchByArticleRef(articleRef: string): Observable<CommandeResponse[]> {
    return this.http.get<CommandeResponse[]>(`${this.apiUrl}/search/article/${articleRef}`);
  }

  searchByClientNom(clientNom: string): Observable<CommandeResponse[]> {
    return this.http.get<CommandeResponse[]>(`${this.apiUrl}/search/client/${clientNom}`);
  }

  searchByDateSouhaitee(date: string): Observable<CommandeResponse[]> {
    return this.http.get<CommandeResponse[]>(`${this.apiUrl}/search/date-souhaitee/${date}`);
  }

  searchByDateAjout(date: string): Observable<CommandeResponse[]> {
    return this.http.get<CommandeResponse[]>(`${this.apiUrl}/search/date-ajout/${date}`);
  }

  searchByArticleRefAndDateSouhaitee(articleRef: string, date: string): Observable<CommandeResponse[]> {
    return this.http.get<CommandeResponse[]>(`${this.apiUrl}/search/article/${articleRef}/date-souhaitee/${date}`);
  }

  searchByArticleRefAndDateAjout(articleRef: string, date: string): Observable<CommandeResponse[]> {
    return this.http.get<CommandeResponse[]>(`${this.apiUrl}/search/article/${articleRef}/date-ajout/${date}`);
  }

  // Sommaires
  getSummaryByArticleRef(articleRef: string): Observable<CommandeSummaryResponse> {
    return this.http.get<CommandeSummaryResponse>(`${this.apiUrl}/summary/article/${articleRef}`);
  }

  getSummaryByDateSouhaitee(date: string): Observable<CommandeSummaryResponse> {
    return this.http.get<CommandeSummaryResponse>(`${this.apiUrl}/summary/date-souhaitee/${date}`);
  }

  getSummaryByDateAjout(date: string): Observable<CommandeSummaryResponse> {
    return this.http.get<CommandeSummaryResponse>(`${this.apiUrl}/summary/date-ajout/${date}`);
  }

  getSummaryByArticleRefAndDateSouhaitee(articleRef: string, date: string): Observable<CommandeSummaryResponse> {
    return this.http.get<CommandeSummaryResponse>(`${this.apiUrl}/summary/article/${articleRef}/date-souhaitee/${date}`);
  }

  getSummaryByArticleRefAndDateAjout(articleRef: string, date: string): Observable<CommandeSummaryResponse> {
    return this.http.get<CommandeSummaryResponse>(`${this.apiUrl}/summary/article/${articleRef}/date-ajout/${date}`);
  }

  updateCommande(id: number, commande: UpdateCommandeRequest): Observable<CommandeResponse> {
    return this.http.put<CommandeResponse>(`${this.apiUrl}/${id}`, commande);
  }

  deleteCommande(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/${id}`);
  }
}