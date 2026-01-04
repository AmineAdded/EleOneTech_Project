// frontend/src/app/services/article.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProcessDetail {
  id: string;
  name: string;
  tempsParPF: number;
  cadenceMax: number;
}

export interface CreateArticleRequest {
  ref: string;
  article: string;
  famille: string;
  sousFamille: string;
  typeProcess: string;
  typeProduit: string;
  prixUnitaire: number;
  mpq: number;
  stock: number;
  clients: string[];
  processes: ProcessDetail[];
}

export interface UpdateArticleRequest {
  ref: string;
  article: string;
  famille: string;
  sousFamille: string;
  typeProcess: string;
  typeProduit: string;
  prixUnitaire: number;
  mpq: number;
  stock: number;
  clients: string[];
  processes: ProcessDetail[];
}

export interface ArticleResponse {
  id: number;
  ref: string;
  article: string;
  famille: string;
  sousFamille: string;
  typeProcess: string;
  typeProduit: string;
  prixUnitaire: number;
  mpq: number;
  stock: number;
  imageFilename?: string; // ✅ NOUVEAU
  clients: string[];
  processes: ProcessDetail[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = 'http://localhost:8080/api/articles';

  constructor(private http: HttpClient) {}

  createArticle(article: CreateArticleRequest): Observable<ArticleResponse> {
    return this.http.post<ArticleResponse>(this.apiUrl, article);
  }

  getAllArticles(): Observable<ArticleResponse[]> {
    return this.http.get<ArticleResponse[]>(this.apiUrl);
  }

  getArticleById(id: number): Observable<ArticleResponse> {
    return this.http.get<ArticleResponse>(`${this.apiUrl}/${id}`);
  }

  updateArticle(id: number, article: UpdateArticleRequest): Observable<ArticleResponse> {
    return this.http.put<ArticleResponse>(`${this.apiUrl}/${id}`, article);
  }

  deleteArticle(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/${id}`);
  }

  // ✅ NOUVEAU: Upload d'image
 // frontend/src/app/services/article.service.ts (vérifier cette partie)
// ✅ NOUVEAU: Upload d'image
uploadImage(articleId: number, file: File): Observable<ArticleResponse> {
  const formData = new FormData();
  formData.append('image', file);

  console.log('📤 Uploading image:', {
    articleId,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  });

  return this.http.post<ArticleResponse>(
    `${this.apiUrl}/${articleId}/image`,
    formData
  );
}
  // ✅ NOUVEAU: URL de l'image
  getImageUrl(filename: string): string {
    return `${this.apiUrl}/image/${filename}`;
  }

  // ✅ NOUVEAU: Suppression d'image
  deleteImage(articleId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/${articleId}/image`);
  }
}
