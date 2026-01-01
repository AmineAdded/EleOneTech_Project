// frontend/src/app/components/articles-table/articles-table.component.ts
import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProcessManagerComponent, ProcessDetail } from '../process-manager/process-manager.component';
import { ClientsManagerComponent } from '../clients-manager/clients-manager.component';
import { ClientService } from '../../services/client.service';
import { ArticleService, ArticleResponse, CreateArticleRequest, UpdateArticleRequest } from '../../services/article.service';

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
  createdAt?: string;
  isEditing?: boolean;
  isNew?: boolean;
}

@Component({
  selector: 'app-articles-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ProcessManagerComponent, ClientsManagerComponent],
  templateUrl: './articles-table.component.html',
  styleUrl: './articles-table.component.css'
})
export class ArticlesTableComponent implements OnInit {
  articles = signal<Article[]>([]);
  availableClients = signal<string[]>([]);
  searchTerm = '';
  isLoading = signal(false);
  errorMessage = signal('');

  private originalArticles: { [key: number]: Article } = {};
  private editingArticles: Set<number> = new Set();

  constructor(
    private clientService: ClientService,
    private articleService: ArticleService
  ) {}

  ngOnInit() {
    this.loadClients();
    this.loadArticles();
  }

  loadClients() {
    this.clientService.getAllClientsSimple().subscribe({
      next: (clients) => {
        const sortedClients = clients
          .map(c => c.nomComplet)
          .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));

        this.availableClients.set(sortedClients);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des clients:', error);
        this.errorMessage.set('Erreur lors du chargement des clients');
      }
    });
  }

  loadArticles() {
    this.isLoading.set(true);
    this.articleService.getAllArticles().subscribe({
      next: (articles) => {
        const mapped: Article[] = articles.map(a => ({
          id: a.id,
          ref: a.ref,
          article: a.article,
          famille: a.famille || '',
          sousFamille: a.sousFamille || '',
          typeProcess: a.typeProcess || '',
          typeProduit: a.typeProduit || '',
          prixUnitaire: a.prixUnitaire || 0,
          mpq: a.mpq || 0,
          processes: a.processes || [],
          clients: a.clients || [],
          createdAt: a.createdAt,
          isEditing: false,
          isNew: false
        }));
        this.articles.set(mapped);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des articles:', error);
        this.errorMessage.set('Erreur lors du chargement des articles');
        this.isLoading.set(false);
      }
    });
  }

  filteredArticles = computed(() => {
    const term = this.searchTerm.toLowerCase();
    if (!term) return this.articles();

    return this.articles().filter(article =>
      article.ref?.toLowerCase().includes(term) ||
      article.article?.toLowerCase().includes(term) ||
      article.famille?.toLowerCase().includes(term) ||
      article.sousFamille?.toLowerCase().includes(term) ||
      article.typeProcess?.toLowerCase().includes(term) ||
      article.typeProduit?.toLowerCase().includes(term) ||
      article.clients.some(c => c.toLowerCase().includes(term))
    );
  });

  /**
   * Formate la date au format français DD/MM/YYYY HH:mm
   */
  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';

    try {
      // Le format backend est "yyyy-MM-dd HH:mm:ss"
      const date = new Date(dateString);

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return '-';
    }
  }

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
      isEditing: true,
      isNew: true
    };

    this.articles.update(articles => [newArticle, ...articles]);
  }

  editRow(index: number) {
    const article = this.articles()[index];

    if (!article.isNew && article.id) {
      this.originalArticles[article.id] = JSON.parse(JSON.stringify(article));
      this.editingArticles.add(article.id);
    }

    this.articles.update(articles => {
      const updated = [...articles];
      updated[index] = { ...updated[index], isEditing: true };
      return updated;
    });
  }

  saveRow(index: number) {
    const article = this.articles()[index];

    if (!article.ref?.trim()) {
      this.errorMessage.set('La référence est obligatoire');
      return;
    }

    if (!article.article?.trim()) {
      this.errorMessage.set('Le nom de l\'article est obligatoire');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    if (article.isNew) {
      // CREATE
      const request: CreateArticleRequest = {
        ref: article.ref,
        article: article.article,
        famille: article.famille || '',
        sousFamille: article.sousFamille || '',
        typeProcess: article.typeProcess || '',
        typeProduit: article.typeProduit || '',
        prixUnitaire: article.prixUnitaire || 0,
        mpq: article.mpq || 0,
        clients: article.clients || [],
        processes: article.processes || []
      };

      this.articleService.createArticle(request).subscribe({
        next: () => {
          this.loadArticles();
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set(err.error?.message || 'Erreur lors de la création');
          this.isLoading.set(false);
        }
      });

    } else if (article.id) {
      // UPDATE
      const request: UpdateArticleRequest = {
        ref: article.ref,
        article: article.article,
        famille: article.famille || '',
        sousFamille: article.sousFamille || '',
        typeProcess: article.typeProcess || '',
        typeProduit: article.typeProduit || '',
        prixUnitaire: article.prixUnitaire || 0,
        mpq: article.mpq || 0,
        clients: article.clients || [],
        processes: article.processes || []
      };

      this.articleService.updateArticle(article.id, request).subscribe({
        next: (response) => {
          this.articles.update(articles => {
            const updated = [...articles];
            updated[index] = {
              ...response,
              isEditing: false,
              isNew: false
            };
            return updated;
          });
          delete this.originalArticles[article.id!];
          this.editingArticles.delete(article.id!);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set(err.error?.message || 'Erreur lors de la mise à jour');
          this.isLoading.set(false);
        }
      });
    }
  }

  cancelEdit(index: number) {
    const article = this.articles()[index];

    if (article.isNew) {
      this.articles.update(articles => articles.filter((_, i) => i !== index));
      return;
    }

    if (article.id) {
      const original = this.originalArticles[article.id];
      if (original) {
        this.articles.update(articles => {
          const updated = [...articles];
          updated[index] = { ...original, isEditing: false };
          return updated;
        });
        delete this.originalArticles[article.id];
        this.editingArticles.delete(article.id);
      }
    }
  }

  deleteRow(index: number) {
    const article = this.articles()[index];

    if (article.isNew) {
      this.articles.update(articles => articles.filter((_, i) => i !== index));
      return;
    }

    if (!article.id) return;

    if (!confirm(`Supprimer l'article "${article.article}" (Ref: ${article.ref}) ?`)) return;

    this.isLoading.set(true);
    this.articleService.deleteArticle(article.id).subscribe({
      next: () => {
        this.loadArticles();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Erreur lors de la suppression');
        this.isLoading.set(false);
      }
    });
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
