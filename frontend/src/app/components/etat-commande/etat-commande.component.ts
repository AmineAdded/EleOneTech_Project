// frontend/src/app/components/etat-commande/etat-commande.component.ts
import { Component, OnInit, signal, computed, ViewChild, ElementRef, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommandeService, CommandeResponse } from '../../services/commande.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

type SearchMode = 'month' | 'period';

interface ClientStat {
  clientNom: string;
  quantiteTotale: number;
  nombreCommandes: number;
  quantiteFerme: number;
  quantitePlanifiee: number;
}

@Component({
  selector: 'app-etat-commande',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './etat-commande.component.html',
  styleUrl: './etat-commande.component.css'
})
export class EtatCommandeComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private chartInitialized = false;

  searchMode = signal<SearchMode>('month');
  selectedYear = signal<number>(new Date().getFullYear());
  selectedMonth = signal<number>(new Date().getMonth() + 1);
  dateDebut = signal<string>('');
  dateFin = signal<string>('');

  commandes = signal<CommandeResponse[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  // Options pour les années (10 dernières années)
  years = computed(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear - i);
  });

  months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }
  ];

  // Statistiques par client
  clientStats = computed(() => {
    const stats: Map<string, ClientStat> = new Map();

    this.commandes().forEach(cmd => {
      const existing = stats.get(cmd.clientNom);

      if (existing) {
        existing.quantiteTotale += cmd.quantite;
        existing.nombreCommandes++;
        if (cmd.typeCommande === 'FERME') {
          existing.quantiteFerme += cmd.quantite;
        } else {
          existing.quantitePlanifiee += cmd.quantite;
        }
      } else {
        stats.set(cmd.clientNom, {
          clientNom: cmd.clientNom,
          quantiteTotale: cmd.quantite,
          nombreCommandes: 1,
          quantiteFerme: cmd.typeCommande === 'FERME' ? cmd.quantite : 0,
          quantitePlanifiee: cmd.typeCommande === 'PLANIFIEE' ? cmd.quantite : 0
        });
      }
    });

    // Trier par quantité décroissante
    return Array.from(stats.values()).sort((a, b) => b.quantiteTotale - a.quantiteTotale);
  });

  // Statistiques globales
  totalStats = computed(() => {
    const stats = this.clientStats();
    return {
      totalQuantite: stats.reduce((sum, s) => sum + s.quantiteTotale, 0),
      totalCommandes: stats.reduce((sum, s) => sum + s.nombreCommandes, 0),
      totalFerme: stats.reduce((sum, s) => sum + s.quantiteFerme, 0),
      totalPlanifiee: stats.reduce((sum, s) => sum + s.quantitePlanifiee, 0),
      nombreClients: stats.length
    };
  });

  constructor(private commandeService: CommandeService) {
    // Utiliser un effect pour recréer le graphique quand les données changent
    effect(() => {
      // Déclencher l'effect quand clientStats change
      const stats = this.clientStats();

      // Ne créer le graphique que si on a des données et que la vue est initialisée
      if (stats.length > 0 && this.chartInitialized && !this.isLoading()) {
        // Utiliser setTimeout pour s'assurer que le DOM est à jour
        setTimeout(() => this.createChart(), 0);
      }
    });
  }

  ngOnInit() {
    // Charger les données pour le mois en cours par défaut
    this.loadData();
  }

  ngAfterViewInit() {
    this.chartInitialized = true;
    // Créer le graphique initial si on a déjà des données
    if (this.commandes().length > 0) {
      setTimeout(() => this.createChart(), 100);
    }
  }

  loadData() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const mode = this.searchMode();

    if (mode === 'month') {
      // Calculer les dates de début et fin du mois
      const year = this.selectedYear();
      const month = this.selectedMonth();
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);

      const dateDebut = this.formatDate(firstDay);
      const dateFin = this.formatDate(lastDay);

      this.loadCommandesByPeriod(dateDebut, dateFin);
    } else {
      // Mode période
      const debut = this.dateDebut();
      const fin = this.dateFin();

      if (!debut || !fin) {
        this.errorMessage.set('Veuillez sélectionner une période complète');
        this.isLoading.set(false);
        return;
      }

      if (new Date(debut) > new Date(fin)) {
        this.errorMessage.set('La date de début doit être antérieure à la date de fin');
        this.isLoading.set(false);
        return;
      }

      this.loadCommandesByPeriod(debut, fin);
    }
  }

  private loadCommandesByPeriod(dateDebut: string, dateFin: string) {
    // Charger toutes les commandes et filtrer par période
    this.commandeService.getAllCommandes().subscribe({
      next: (commandes) => {
        // Filtrer par date souhaitée (dateSouhaitee)
        const filtered = commandes.filter(cmd => {
          const cmdDate = cmd.dateSouhaitee;
          return cmdDate >= dateDebut && cmdDate <= dateFin;
        });

        this.commandes.set(filtered);
        this.isLoading.set(false);

        // Le graphique sera recréé automatiquement par l'effect
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes:', error);
        this.errorMessage.set('Erreur lors du chargement des données');
        this.isLoading.set(false);
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  resetFilters() {
    this.searchMode.set('month');
    this.selectedYear.set(new Date().getFullYear());
    this.selectedMonth.set(new Date().getMonth() + 1);
    this.dateDebut.set('');
    this.dateFin.set('');
    this.loadData();
  }

  private createChart() {
    if (!this.chartCanvas?.nativeElement) {
      return;
    }

    // Détruire le graphique existant
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }

    const stats = this.clientStats();

    if (stats.length === 0) {
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: stats.map(s => s.clientNom),
        datasets: [
          {
            label: 'Quantité Ferme',
            data: stats.map(s => s.quantiteFerme),
            backgroundColor: 'rgba(46, 125, 50, 0.8)',
            borderColor: 'rgba(46, 125, 50, 1)',
            borderWidth: 1
          },
          {
            label: 'Quantité Planifiée',
            data: stats.map(s => s.quantitePlanifiee),
            backgroundColor: 'rgba(255, 152, 0, 0.8)',
            borderColor: 'rgba(255, 152, 0, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Quantités commandées par client',
            font: {
              size: 18,
              weight: 'bold'
            },
            color: '#c2185b'
          },
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 12
              },
              padding: 15
            }
          },
          tooltip: {
            callbacks: {
              footer: (tooltipItems) => {
                let total = 0;
                tooltipItems.forEach(item => {
                  if (item.parsed && item.parsed.y !== null) {
                    total += item.parsed.y;
                  }
                });
                return 'Total: ' + total;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'Clients',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            ticks: {
              font: {
                size: 11
              },
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            title: {
              display: true,
              text: 'Quantité',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            ticks: {
              font: {
                size: 12
              }
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  exportData() {
    // Export des données (peut être étendu pour exporter le graphique)
    const stats = this.clientStats();
    const total = this.totalStats();

    let csv = 'Client,Quantité Totale,Quantité Ferme,Quantité Planifiée,Nombre de Commandes\n';

    stats.forEach(stat => {
      csv += `${stat.clientNom},${stat.quantiteTotale},${stat.quantiteFerme},${stat.quantitePlanifiee},${stat.nombreCommandes}\n`;
    });

    csv += `\nTOTAL,${total.totalQuantite},${total.totalFerme},${total.totalPlanifiee},${total.totalCommandes}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `etat-commandes-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
