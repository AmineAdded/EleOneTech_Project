// frontend/src/app/components/articles-table/articles-table.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProcessManagerComponent, ProcessDetail } from '../process-manager/process-manager.component';
import { ClientsManagerComponent } from '../clients-manager/clients-manager.component';

interface Article {
  id?: number;
  ref: string;
  article: string;
  famille: string;
  sousFamille: string;
  typeProcess: string;
  typeProduit: string;
  prixUnitaire: number;
  mpq: number;
  processes: ProcessDetail[];
  clients: string[];
  isEditing?: boolean;
}

@Component({
  selector: 'app-articles-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ProcessManagerComponent, ClientsManagerComponent],
  template: `
    <div class="articles-container">
      <div class="table-header">
        <h2>Fiche d'Article</h2>
        <button class="add-btn" (click)="addNewRow()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Ajouter un article
        </button>
      </div>

      <div class="table-wrapper">
        <table class="articles-table">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Article</th>
              <th>Famille</th>
              <th>Sous Famille</th>
              <th>Type de Process</th>
              <th>Type de Produit</th>
              <th>Prix Unitaire</th>
              <th>MPQ</th>
              <th>Clients</th>
              <th>Process</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let article of articles(); let i = index"
                [class.editing-row]="article.isEditing">

              <!-- Ref -->
              <td>
                <input
                  type="text"
                  [(ngModel)]="article.ref"
                  [disabled]="!article.isEditing"
                  class="table-input"
                  placeholder="Ref">
              </td>

              <!-- Article -->
              <td>
                <input
                  type="text"
                  [(ngModel)]="article.article"
                  [disabled]="!article.isEditing"
                  class="table-input"
                  placeholder="Article">
              </td>

              <!-- Famille -->
              <td>
                <input
                  type="text"
                  [(ngModel)]="article.famille"
                  [disabled]="!article.isEditing"
                  class="table-input"
                  placeholder="Famille">
              </td>

              <!-- Sous Famille -->
              <td>
                <input
                  type="text"
                  [(ngModel)]="article.sousFamille"
                  [disabled]="!article.isEditing"
                  class="table-input"
                  placeholder="Sous Famille">
              </td>

              <!-- Type Process -->
              <td>
                <select
                  [(ngModel)]="article.typeProcess"
                  [disabled]="!article.isEditing"
                  class="table-select">
                  <option value="">Sélectionner</option>
                  <option value="Seulement Annexe">Seulement Annexe</option>
                  <option value="Seulement Usine">Seulement Usine</option>
                  <option value="Annexe + Usine">Annexe + Usine</option>
                </select>
              </td>

              <!-- Type Produit -->
              <td>
                <select
                  [(ngModel)]="article.typeProduit"
                  [disabled]="!article.isEditing"
                  class="table-select">
                  <option value="">Sélectionner</option>
                  <option value="Simple">Simple</option>
                  <option value="Composé">Composé</option>
                </select>
              </td>

              <!-- Prix Unitaire -->
              <td>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="article.prixUnitaire"
                  [disabled]="!article.isEditing"
                  class="table-input"
                  placeholder="0.00">
              </td>

              <!-- MPQ -->
              <td>
                <input
                  type="number"
                  [(ngModel)]="article.mpq"
                  [disabled]="!article.isEditing"
                  class="table-input"
                  placeholder="0">
              </td>

              <!-- Clients -->
              <td class="clients-cell">
                <app-clients-manager
                  [clients]="article.clients"
                  [isEditing]="article.isEditing || false"
                  [availableClientsList]="availableClients"
                  (clientsChange)="updateClients(i, $event)">
                </app-clients-manager>
              </td>

              <!-- Process -->
              <td class="process-cell">
                <app-process-manager
                  [processes]="article.processes"
                  [isEditing]="article.isEditing || false"
                  (processesChange)="updateProcesses(i, $event)">
                </app-process-manager>
              </td>

              <!-- Actions -->
              <td>
                <div class="action-buttons">
                  <button
                    *ngIf="!article.isEditing"
                    class="edit-btn"
                    (click)="editRow(i)"
                    title="Modifier">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>

                  <button
                    *ngIf="article.isEditing"
                    class="save-btn"
                    (click)="saveRow(i)"
                    title="Enregistrer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </button>

                  <button
                    *ngIf="article.isEditing"
                    class="cancel-btn"
                    (click)="cancelEdit(i)"
                    title="Annuler">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>

                  <button
                    class="delete-btn"
                    (click)="deleteRow(i)"
                    title="Supprimer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>

            <tr *ngIf="articles().length === 0">
              <td colspan="11" class="empty-state">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
                <p>Aucun article. Cliquez sur "Ajouter un article" pour commencer.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .articles-container {
      padding: 2rem;
      background: #f8f9fa;
      min-height: calc(100vh - 80px);
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .table-header h2 {
      color: #C2185B;
      font-size: 1.8rem;
      font-weight: 400;
      font-family: 'Georgia', serif;
      margin: 0;
    }

    .add-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #4CAF50, #66BB6A);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    }

    .add-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
    }

    .table-wrapper {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .articles-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .articles-table thead {
      background: linear-gradient(135deg, #E91E63, #F06292);
      color: white;
    }

    .articles-table th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      white-space: nowrap;
    }

    .articles-table tbody tr {
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.2s ease;
    }

    .articles-table tbody tr:hover {
      background: #FFF5F7;
    }

    .articles-table tbody tr.editing-row {
      background: #E3F2FD;
    }

    .articles-table td {
      padding: 0.75rem 1rem;
      vertical-align: middle;
    }

    .clients-cell {
      min-width: 200px;
      max-width: 300px;
    }

    .process-cell {
      min-width: 250px;
      max-width: 350px;
    }

    .table-input,
    .table-select {
      width: 100%;
      padding: 0.5rem;
      border: 1.5px solid #e0e0e0;
      border-radius: 6px;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      background: white;
    }

    .table-input:focus,
    .table-select:focus {
      outline: none;
      border-color: #E91E63;
      box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.1);
    }

    .table-input:disabled,
    .table-select:disabled {
      background: transparent;
      border-color: transparent;
      cursor: default;
    }

    .table-input[type="number"] {
      text-align: right;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }

    .edit-btn,
    .save-btn,
    .cancel-btn,
    .delete-btn {
      padding: 0.4rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .edit-btn {
      background: #2196F3;
      color: white;
    }

    .edit-btn:hover {
      background: #1976D2;
      transform: translateY(-2px);
    }

    .save-btn {
      background: #4CAF50;
      color: white;
    }

    .save-btn:hover {
      background: #388E3C;
      transform: translateY(-2px);
    }

    .cancel-btn {
      background: #FF9800;
      color: white;
    }

    .cancel-btn:hover {
      background: #F57C00;
      transform: translateY(-2px);
    }

    .delete-btn {
      background: #F44336;
      color: white;
    }

    .delete-btn:hover {
      background: #D32F2F;
      transform: translateY(-2px);
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem !important;
      color: #999;
    }

    .empty-state svg {
      margin-bottom: 1rem;
      stroke-width: 1.5;
      opacity: 0.3;
    }

    .empty-state p {
      margin: 0;
      font-size: 1rem;
    }

    @media (max-width: 1400px) {
      .table-wrapper {
        overflow-x: auto;
      }

      .articles-table {
        min-width: 1500px;
      }
    }

    @media (max-width: 768px) {
      .articles-container {
        padding: 1rem;
      }

      .table-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .add-btn {
        justify-content: center;
      }
    }
  `]
})
export class ArticlesTableComponent {
  articles = signal<Article[]>([]);

  availableClients = [
    'Client A',
    'Client B',
    'Client C',
    'Client D',
    'Client E'
  ];

  private originalArticles: { [key: number]: Article } = {};

  addNewRow() {
    const newArticle: Article = {
      ref: '',
      article: '',
      famille: '',
      sousFamille: '',
      typeProcess: '',
      typeProduit: '',
      prixUnitaire: 0,
      mpq: 0,
      processes: [],
      clients: [],
      isEditing: true
    };

    this.articles.update(articles => [newArticle, ...articles]);
  }

  editRow(index: number) {
    const currentArticles = this.articles();
    this.originalArticles[index] = JSON.parse(JSON.stringify(currentArticles[index]));

    this.articles.update(articles => {
      const updated = [...articles];
      updated[index] = { ...updated[index], isEditing: true };
      return updated;
    });
  }

  saveRow(index: number) {
    this.articles.update(articles => {
      const updated = [...articles];
      updated[index] = { ...updated[index], isEditing: false };
      return updated;
    });

    delete this.originalArticles[index];
    console.log('Article sauvegardé:', this.articles()[index]);
  }

  cancelEdit(index: number) {
    if (this.originalArticles[index]) {
      this.articles.update(articles => {
        const updated = [...articles];
        updated[index] = { ...this.originalArticles[index], isEditing: false };
        return updated;
      });
      delete this.originalArticles[index];
    } else {
      this.articles.update(articles => articles.filter((_, i) => i !== index));
    }
  }

  deleteRow(index: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      this.articles.update(articles => articles.filter((_, i) => i !== index));
      delete this.originalArticles[index];
    }
  }

  updateClients(articleIndex: number, clients: string[]) {
    this.articles.update(articles => {
      const updated = [...articles];
      updated[articleIndex].clients = clients;
      return updated;
    });
  }

  updateProcesses(articleIndex: number, processes: ProcessDetail[]) {
    this.articles.update(articles => {
      const updated = [...articles];
      updated[articleIndex].processes = processes;
      return updated;
    });
  }
}
