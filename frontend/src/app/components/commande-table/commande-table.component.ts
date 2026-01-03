// frontend/src/app/components/commande-table/commande-table.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CommandeService,
  CommandeResponse,
  CreateCommandeRequest,
  UpdateCommandeRequest,
  CommandeSummaryResponse
} from '../../services/commande.service';
import { ArticleService } from '../../services/article.service';
import { ClientService } from '../../services/client.service';

interface CommandeTable extends CommandeResponse {
  isEditing?: boolean;
  isNew?: boolean;
}

@Component({
  selector: 'app-commande-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './commande-table.component.html',
  styleUrl: './commande-table.component.css'
})
export class CommandeTableComponent implements OnInit {

  commandes = signal<CommandeTable[]>([]);
  availableArticles = signal<{ref: string, nom: string}[]>([]);
  availableClients = signal<string[]>([]);
  
  searchTerm = signal('');
  searchArticleRef = signal('');
  searchClientNom = signal('');
  searchDateSouhaitee = signal('');
  searchDateAjout = signal('');
  searchTypeDate = signal<'souhaitee' | 'ajout'>('souhaitee');
  
  summary = signal<CommandeSummaryResponse | null>(null);
  
  isLoading = signal(false);
  errorMessage = signal('');

  private originalCommandes: { [key: number]: CommandeTable } = {};
  private editingCommandes: Set<number> = new Set();

  constructor(
    private commandeService: CommandeService,
    private articleService: ArticleService,
    private clientService: ClientService
  ) {}

  ngOnInit() {
    this.loadCommandes();
    this.loadArticles();
    this.loadClients();
  }

  loadCommandes() {
    this.isLoading.set(true);
    this.commandeService.getAllCommandes().subscribe({
      next: (commandes) => {
        const mapped: CommandeTable[] = commandes.map(c => ({
          ...c,
          isEditing: false,
          isNew: false
        }));
        this.commandes.set(mapped);
        this.summary.set(null);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.errorMessage.set('Erreur lors du chargement des commandes');
        this.isLoading.set(false);
      }
    });
  }

  loadArticles() {
    this.articleService.getAllArticles().subscribe({
      next: (articles) => {
        const mapped = articles.map(a => ({
          ref: a.ref,
          nom: a.article
        }));
        this.availableArticles.set(mapped);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des articles:', error);
      }
    });
  }

  loadClients() {
    this.clientService.getAllClientsSimple().subscribe({
      next: (clients) => {
        const mapped = clients.map(c => c.nomComplet);
        this.availableClients.set(mapped);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des clients:', error);
      }
    });
  }

  // ✅ Recherche avec filtres multiples
  filteredCommandes = computed(() => {
    let filtered = this.commandes();
    const term = this.searchTerm().toLowerCase();

    if (term) {
      filtered = filtered.filter(c =>
        c.articleRef?.toLowerCase().includes(term) ||
        c.articleNom?.toLowerCase().includes(term) ||
        c.clientNom?.toLowerCase().includes(term) ||
        c.quantite?.toString().includes(term)
      );
    }

    return filtered;
  });

  // ✅ Recherche par article
  searchByArticle() {
    const ref = this.searchArticleRef();
    if (!ref) {
      this.loadCommandes();
      return;
    }

    this.isLoading.set(true);
    this.commandeService.searchByArticleRef(ref).subscribe({
      next: (commandes) => {
        const mapped: CommandeTable[] = commandes.map(c => ({
          ...c,
          isEditing: false,
          isNew: false
        }));
        this.commandes.set(mapped);
        this.loadSummary();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.errorMessage.set('Erreur lors de la recherche');
        this.isLoading.set(false);
      }
    });
  }

  // ✅ Recherche par client
  searchByClient() {
    const nom = this.searchClientNom();
    if (!nom) {
      this.loadCommandes();
      return;
    }

    this.isLoading.set(true);
    this.commandeService.searchByClientNom(nom).subscribe({
      next: (commandes) => {
        const mapped: CommandeTable[] = commandes.map(c => ({
          ...c,
          isEditing: false,
          isNew: false
        }));
        this.commandes.set(mapped);
        this.summary.set(null);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.errorMessage.set('Erreur lors de la recherche');
        this.isLoading.set(false);
      }
    });
  }

  // ✅ Recherche par date
  searchByDate() {
    const typeDate = this.searchTypeDate();
    const date = typeDate === 'souhaitee' ? this.searchDateSouhaitee() : this.searchDateAjout();
    const articleRef = this.searchArticleRef();

    if (!date && !articleRef) {
      this.loadCommandes();
      return;
    }

    this.isLoading.set(true);

    let searchObservable;

    if (articleRef && date) {
      // Recherche combinée
      searchObservable = typeDate === 'souhaitee'
        ? this.commandeService.searchByArticleRefAndDateSouhaitee(articleRef, date)
        : this.commandeService.searchByArticleRefAndDateAjout(articleRef, date);
    } else if (date) {
      // Recherche par date uniquement
      searchObservable = typeDate === 'souhaitee'
        ? this.commandeService.searchByDateSouhaitee(date)
        : this.commandeService.searchByDateAjout(date);
    } else {
      // Recherche par article uniquement (déjà gérée)
      this.searchByArticle();
      return;
    }

    searchObservable.subscribe({
      next: (commandes) => {
        const mapped: CommandeTable[] = commandes.map(c => ({
          ...c,
          isEditing: false,
          isNew: false
        }));
        this.commandes.set(mapped);
        this.loadSummary();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.errorMessage.set('Erreur lors de la recherche');
        this.isLoading.set(false);
      }
    });
  }

  // ✅ Charger le sommaire selon les filtres actifs
  loadSummary() {
    const articleRef = this.searchArticleRef();
    const typeDate = this.searchTypeDate();
    const date = typeDate === 'souhaitee' ? this.searchDateSouhaitee() : this.searchDateAjout();

    if (!articleRef && !date) {
      this.summary.set(null);
      return;
    }

    let summaryObservable;

    if (articleRef && date) {
      summaryObservable = typeDate === 'souhaitee'
        ? this.commandeService.getSummaryByArticleRefAndDateSouhaitee(articleRef, date)
        : this.commandeService.getSummaryByArticleRefAndDateAjout(articleRef, date);
    } else if (articleRef) {
      summaryObservable = this.commandeService.getSummaryByArticleRef(articleRef);
    } else if (date) {
      summaryObservable = typeDate === 'souhaitee'
        ? this.commandeService.getSummaryByDateSouhaitee(date)
        : this.commandeService.getSummaryByDateAjout(date);
    } else {
      this.summary.set(null);
      return;
    }

    summaryObservable.subscribe({
      next: (summary) => {
        this.summary.set(summary);
      },
      error: (error) => {
        console.error('Erreur lors du chargement du sommaire:', error);
      }
    });
  }

  // ✅ Réinitialiser les filtres
  resetFilters() {
    this.searchTerm.set('');
    this.searchArticleRef.set('');
    this.searchClientNom.set('');
    this.searchDateSouhaitee.set('');
    this.searchDateAjout.set('');
    this.searchTypeDate.set('souhaitee');
    this.summary.set(null);
    this.loadCommandes();
  }

  addNewRow() {
    const today = new Date().toISOString().split('T')[0];
    const newCommande: CommandeTable = {
      id: 0 as any,
      articleRef: '',
      articleNom: '',
      clientNom: '',
      quantite: 1,
      dateSouhaitee: today,
      dateAjout: today,
      isActive: true,
      createdAt: '',
      updatedAt: '',
      isEditing: true,
      isNew: true
    };

    this.commandes.update(commandes => [newCommande, ...commandes]);
  }

  editRow(index: number) {
    const cmd = this.commandes()[index];

    if (!cmd.isNew) {
      this.originalCommandes[cmd.id] = { ...cmd };
      this.editingCommandes.add(cmd.id);
    }

    this.commandes.update(commandes => {
      const updated = [...commandes];
      updated[index] = { ...updated[index], isEditing: true };
      return updated;
    });
  }

  saveRow(index: number) {
    const cmd = this.commandes()[index];

    if (!cmd.articleRef?.trim()) {
      this.errorMessage.set('La référence de l\'article est obligatoire');
      return;
    }

    if (!cmd.clientNom?.trim()) {
      this.errorMessage.set('Le nom du client est obligatoire');
      return;
    }

    if (!cmd.quantite || cmd.quantite < 1) {
      this.errorMessage.set('La quantité doit être au moins 1');
      return;
    }

    if (!cmd.dateSouhaitee) {
      this.errorMessage.set('La date souhaitée est obligatoire');
      return;
    }

    this.isLoading.set(true);

    if (cmd.isNew) {
      const request: CreateCommandeRequest = {
        articleRef: cmd.articleRef,
        clientNom: cmd.clientNom,
        quantite: cmd.quantite,
        dateSouhaitee: cmd.dateSouhaitee
      };

      this.commandeService.createCommande(request).subscribe({
        next: () => {
          this.loadCommandes();
          this.loadSummary();
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set(err.error?.message || 'Erreur lors de la création');
          this.isLoading.set(false);
        }
      });

    } else {
      const request: UpdateCommandeRequest = {
        articleRef: cmd.articleRef,
        clientNom: cmd.clientNom,
        quantite: cmd.quantite,
        dateSouhaitee: cmd.dateSouhaitee
      };

      this.commandeService.updateCommande(cmd.id, request).subscribe({
        next: (response) => {
          this.commandes.update(commandes => {
            const updated = [...commandes];
            updated[index] = {
              ...response,
              isEditing: false,
              isNew: false
            };
            return updated;
          });
          delete this.originalCommandes[cmd.id];
          this.editingCommandes.delete(cmd.id);
          this.loadSummary();
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
    const cmd = this.commandes()[index];

    if (cmd.isNew) {
      this.commandes.update(commandes => commandes.filter((_, i) => i !== index));
      return;
    }

    const original = this.originalCommandes[cmd.id];
    if (original) {
      this.commandes.update(commandes => {
        const updated = [...commandes];
        updated[index] = { ...original, isEditing: false };
        return updated;
      });
      delete this.originalCommandes[cmd.id];
      this.editingCommandes.delete(cmd.id);
    }
  }

  deleteRow(index: number) {
    const cmd = this.commandes()[index];

    if (cmd.isNew) {
      this.commandes.update(commandes => commandes.filter((_, i) => i !== index));
      return;
    }

    if (!confirm(`Supprimer la commande de ${cmd.quantite} unités de "${cmd.articleNom}" pour ${cmd.clientNom} ?`)) return;

    this.isLoading.set(true);
    this.commandeService.deleteCommande(cmd.id).subscribe({
      next: () => {
        this.loadCommandes();
        this.loadSummary();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Erreur lors de la suppression');
        this.isLoading.set(false);
      }
    });
  }

  isEditing(cmd: CommandeTable): boolean {
    return cmd.isEditing === true;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  getArticleNomFromRef(ref: string): string {
    const article = this.availableArticles().find(a => a.ref === ref);
    return article ? article.nom : '';
  }
}