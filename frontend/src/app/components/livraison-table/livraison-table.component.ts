// frontend/src/app/components/livraison-table/livraison-table.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LivraisonService,
  LivraisonResponse,
  CreateLivraisonRequest,
  UpdateLivraisonRequest
} from '../../services/livraison.service';
import { ArticleService } from '../../services/article.service';
import { ClientService } from '../../services/client.service';
import { CommandeService } from '../../services/commande.service';

interface LivraisonTable extends LivraisonResponse {
  isEditing?: boolean;
  isNew?: boolean;
}

type SortOrder = 'asc' | 'desc' | null;

@Component({
  selector: 'app-livraison-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './livraison-table.component.html',
  styleUrl: './livraison-table.component.css'
})
export class LivraisonTableComponent implements OnInit {

  livraisons = signal<LivraisonTable[]>([]);
  availableArticles = signal<{ref: string, nom: string}[]>([]);
  availableClients = signal<string[]>([]);
  availableCommandes = signal<{
    numeroCommandeClient: string,
    articleRef: string,
    clientNom: string,
    quantiteRestante: number
  }[]>([]);

  searchTerm = signal('');
  searchArticleRef = signal('');
  searchClientNom = signal('');
  searchNumeroCommande = signal('');

  sortOrder = signal<SortOrder>(null);

  // ✅ PAGINATION
  currentPage = signal(1);
  itemsPerPage = 3;

  isLoading = signal(false);
  errorMessage = signal('');

  private originalLivraisons: { [key: number]: LivraisonTable } = {};
  private editingLivraisons: Set<number> = new Set();

  constructor(
    private livraisonService: LivraisonService,
    private articleService: ArticleService,
    private clientService: ClientService,
    private commandeService: CommandeService
  ) {}

  ngOnInit() {
    this.loadLivraisons();
    this.loadArticles();
    this.loadClients();
    this.loadCommandes();
  }

  loadLivraisons() {
    this.isLoading.set(true);
    this.livraisonService.getAllLivraisons().subscribe({
      next: (livraisons) => {
        const mapped: LivraisonTable[] = livraisons.map(l => ({
          ...l,
          isEditing: false,
          isNew: false
        }));
        mapped.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        this.livraisons.set(mapped);
        this.currentPage.set(1); // ✅ Reset à la page 1
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.errorMessage.set('Erreur lors du chargement des livraisons');
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

  loadCommandes() {
    this.commandeService.getAllCommandes().subscribe({
      next: (commandes) => {
        const commandesActives = commandes
          .filter(c => c.isActive)
          .map(c => ({
            numeroCommandeClient: c.numeroCommandeClient,
            articleRef: c.articleRef,
            clientNom: c.clientNom,
            quantiteRestante: c.quantiteNonLivree || c.quantite
          }));
        this.availableCommandes.set(commandesActives);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes:', error);
      }
    });
  }

  toggleSort() {
    const currentOrder = this.sortOrder();

    if (currentOrder === null) {
      this.sortOrder.set('desc');
    } else if (currentOrder === 'desc') {
      this.sortOrder.set('asc');
    } else {
      this.sortOrder.set(null);
    }
  }

  filteredLivraisons = computed(() => {
    let filtered = this.livraisons();
    const term = this.searchTerm().toLowerCase();

    if (term) {
      filtered = filtered.filter(l =>
        l.numeroBL?.toLowerCase().includes(term) ||
        l.articleRef?.toLowerCase().includes(term) ||
        l.articleNom?.toLowerCase().includes(term) ||
        l.clientNom?.toLowerCase().includes(term) ||
        l.numeroCommandeClient?.toLowerCase().includes(term) ||
        l.quantiteLivree?.toString().includes(term)
      );
    }

    const order = this.sortOrder();
    if (order !== null) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.dateLivraison).getTime();
        const dateB = new Date(b.dateLivraison).getTime();

        return order === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    return filtered;
  });

  // ✅ PAGINATION: Livraisons paginées
  paginatedLivraisons = computed(() => {
    const filtered = this.filteredLivraisons();
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return filtered.slice(start, end);
  });

  // ✅ PAGINATION: Nombre total de pages
  totalPages = computed(() => {
    return Math.ceil(this.filteredLivraisons().length / this.itemsPerPage);
  });

  // ✅ PAGINATION: Navigation
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  // ✅ PAGINATION: Array de numéros de pages
  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1);
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push(-1);
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(total);
      }
    }

    return pages;
  }

  performSearch() {
    const articleRef = this.searchArticleRef();
    const clientNom = this.searchClientNom();
    const numeroCommande = this.searchNumeroCommande();

    if (!articleRef && !clientNom && !numeroCommande) {
      this.loadLivraisons();
      return;
    }

    this.isLoading.set(true);

    if (numeroCommande) {
      this.livraisonService.searchByNumeroCommande(numeroCommande).subscribe({
        next: (livraisons) => this.updateLivraisons(livraisons),
        error: (error) => this.handleSearchError(error)
      });
    } else if (articleRef) {
      this.livraisonService.searchByArticleRef(articleRef).subscribe({
        next: (livraisons) => this.updateLivraisons(livraisons),
        error: (error) => this.handleSearchError(error)
      });
    } else if (clientNom) {
      this.livraisonService.searchByClientNom(clientNom).subscribe({
        next: (livraisons) => this.updateLivraisons(livraisons),
        error: (error) => this.handleSearchError(error)
      });
    }
  }

  private updateLivraisons(livraisons: LivraisonResponse[]) {
    const mapped: LivraisonTable[] = livraisons.map(l => ({
      ...l,
      isEditing: false,
      isNew: false
    }));
    mapped.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    this.livraisons.set(mapped);
    this.currentPage.set(1); // ✅ Reset à la page 1
    this.isLoading.set(false);
  }

  private handleSearchError(error: any) {
    console.error(error);
    this.errorMessage.set('Erreur lors de la recherche');
    this.isLoading.set(false);
  }

  resetFilters() {
    this.searchTerm.set('');
    this.searchArticleRef.set('');
    this.searchClientNom.set('');
    this.searchNumeroCommande.set('');
    this.sortOrder.set(null);
    this.loadLivraisons();
  }

  exportToExcel() {
    this.isLoading.set(true);

    const articleRef = this.searchArticleRef() || undefined;
    const clientNom = this.searchClientNom() || undefined;
    const numeroCommande = this.searchNumeroCommande() || undefined;

    this.livraisonService.exportToExcel(articleRef, clientNom, numeroCommande).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const today = new Date().toISOString().split('T')[0];
        link.download = `livraisons_${today}.xlsx`;

        link.click();
        window.URL.revokeObjectURL(url);

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error("Erreur lors de l'export:", error);
        this.errorMessage.set("Erreur lors de l'export Excel");
        this.isLoading.set(false);
      },
    });
  }

  addNewRow() {
    const today = new Date().toISOString().split('T')[0];
    const newLivraison: LivraisonTable = {
      id: 0 as any,
      numeroBL: 'Auto',
      articleRef: '',
      articleNom: '',
      clientNom: '',
      numeroCommandeClient: '',
      quantiteLivree: 1,
      dateLivraison: today,
      isActive: true,
      createdAt: '',
      updatedAt: '',
      isEditing: true,
      isNew: true
    };

    this.livraisons.update(livraisons => [newLivraison, ...livraisons]);
    this.currentPage.set(1); // ✅ Aller à la première page
  }

  editRow(index: number) {
    const liv = this.paginatedLivraisons()[index];
    const realIndex = this.livraisons().findIndex(l => l.id === liv.id);

    if (!liv.isNew) {
      this.originalLivraisons[liv.id] = { ...liv };
      this.editingLivraisons.add(liv.id);
    }

    this.livraisons.update(livraisons => {
      const updated = [...livraisons];
      updated[realIndex] = { ...updated[realIndex], isEditing: true };
      return updated;
    });
  }

  saveRow(index: number) {
    const liv = this.paginatedLivraisons()[index];
    const realIndex = this.livraisons().findIndex(l => l.id === liv.id);

    if (!liv.articleRef?.trim()) {
      this.errorMessage.set('La référence de l\'article est obligatoire');
      return;
    }

    if (!liv.clientNom?.trim()) {
      this.errorMessage.set('Le nom du client est obligatoire');
      return;
    }

    if (!liv.numeroCommandeClient?.trim()) {
      this.errorMessage.set('Le numéro de commande est obligatoire');
      return;
    }

    if (!liv.quantiteLivree || liv.quantiteLivree < 1) {
      this.errorMessage.set('La quantité doit être au moins 1');
      return;
    }

    if (!liv.dateLivraison) {
      this.errorMessage.set('La date de livraison est obligatoire');
      return;
    }

    this.isLoading.set(true);

    if (liv.isNew) {
      const request: CreateLivraisonRequest = {
        articleRef: liv.articleRef,
        clientNom: liv.clientNom,
        numeroCommandeClient: liv.numeroCommandeClient,
        quantiteLivree: liv.quantiteLivree,
        dateLivraison: liv.dateLivraison
      };

      this.livraisonService.createLivraison(request).subscribe({
        next: () => {
          this.loadLivraisons();
          this.loadCommandes();
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set(err.error?.message || 'Erreur lors de la création');
          this.isLoading.set(false);
        }
      });

    } else {
      const request: UpdateLivraisonRequest = {
        articleRef: liv.articleRef,
        clientNom: liv.clientNom,
        numeroCommandeClient: liv.numeroCommandeClient,
        quantiteLivree: liv.quantiteLivree,
        dateLivraison: liv.dateLivraison
      };

      this.livraisonService.updateLivraison(liv.id, request).subscribe({
        next: (response) => {
          this.livraisons.update(livraisons => {
            const updated = [...livraisons];
            updated[realIndex] = {
              ...response,
              isEditing: false,
              isNew: false
            };
            return updated;
          });
          delete this.originalLivraisons[liv.id];
          this.editingLivraisons.delete(liv.id);
          this.loadCommandes();
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
    const liv = this.paginatedLivraisons()[index];
    const realIndex = this.livraisons().findIndex(l => l.id === liv.id);

    if (liv.isNew) {
      this.livraisons.update(livraisons => livraisons.filter((_, i) => i !== realIndex));
      return;
    }

    const original = this.originalLivraisons[liv.id];
    if (original) {
      this.livraisons.update(livraisons => {
        const updated = [...livraisons];
        updated[realIndex] = { ...original, isEditing: false };
        return updated;
      });
      delete this.originalLivraisons[liv.id];
      this.editingLivraisons.delete(liv.id);
    }
  }

  deleteRow(index: number) {
    const liv = this.paginatedLivraisons()[index];
    const realIndex = this.livraisons().findIndex(l => l.id === liv.id);

    if (liv.isNew) {
      this.livraisons.update(livraisons => livraisons.filter((_, i) => i !== realIndex));
      return;
    }

    if (!confirm(`Supprimer la livraison BL ${liv.numeroBL} ?`)) return;

    this.isLoading.set(true);
    this.livraisonService.deleteLivraison(liv.id).subscribe({
      next: () => {
        this.loadLivraisons();
        this.loadCommandes();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Erreur lors de la suppression');
        this.isLoading.set(false);
      }
    });
  }

  isEditing(liv: LivraisonTable): boolean {
    return liv.isEditing === true;
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

  onArticleChange(liv: LivraisonTable) {
    liv.articleNom = this.getArticleNomFromRef(liv.articleRef);
  }

  getFilteredCommandes(articleRef: string, clientNom: string) {
    return this.availableCommandes().filter(c =>
      c.articleRef === articleRef && c.clientNom === clientNom
    );
  }

   getQuantiteRestante(numeroCommande: string): number {
    const cmd = this.availableCommandes().find(c => c.numeroCommandeClient === numeroCommande);
    return cmd ? cmd.quantiteRestante : 0;
  }
   // ✅ NOUVELLE LOGIQUE: Quand on change la commande, remplir les autres champs
  onCommandeChange(liv: LivraisonTable) {
    const commande = this.availableCommandes().find(
      c => c.numeroCommandeClient === liv.numeroCommandeClient
    );
    
    if (commande) {
      liv.articleRef = commande.articleRef;
      liv.clientNom = commande.clientNom;
      liv.articleNom = this.getArticleNomFromRef(commande.articleRef);
    }
  }
}