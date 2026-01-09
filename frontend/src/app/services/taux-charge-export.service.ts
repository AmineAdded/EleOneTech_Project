// frontend/src/app/services/taux-charge-export.service.ts
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

export interface TauxChargeExportData {
  processNom: string;
  tempsNecessaire: number;
  heuresDisponibles: number;
  tauxCharge: number;
  statut: string;
}

@Injectable({
  providedIn: 'root'
})
export class TauxChargeExportService {

  constructor() {}

  /**
   * Exporte les données de taux de charge vers un fichier Excel
   */
  exportToExcel(
    data: TauxChargeExportData[],
    periode: string,
    heuresDisponibles: number
  ): void {
    // Créer les données pour Excel
    const excelData = data.map(item => ({
      'Process': item.processNom,
      'Temps nécessaire (h)': this.formatNumber(item.tempsNecessaire),
      'Heures disponibles (h)': heuresDisponibles,
      'Taux de charge (%)': this.formatNumber(item.tauxCharge),
      'Statut': this.getStatutLabel(item.tauxCharge),
      'Période': periode
    }));

    // Créer le classeur
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Définir la largeur des colonnes
    const columnWidths = [
      { wch: 25 }, // Process
      { wch: 22 }, // Temps nécessaire
      { wch: 22 }, // Heures disponibles
      { wch: 18 }, // Taux de charge
      { wch: 20 }, // Statut
      { wch: 30 }  // Période
    ];
    worksheet['!cols'] = columnWidths;

    // Créer le classeur
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Taux de Charge');

    // Générer le nom du fichier
    const fileName = `taux_charge_${this.formatDateForFilename(new Date())}.xlsx`;

    // Télécharger le fichier
    XLSX.writeFile(workbook, fileName);

    console.log('✅ Export Excel généré:', fileName);
  }

  /**
   * Formate un nombre avec 2 décimales
   */
  private formatNumber(value: number): string {
    return value.toFixed(2);
  }

  /**
   * Retourne le label du statut selon le taux de charge
   */
  private getStatutLabel(tauxCharge: number): string {
    if (tauxCharge < 50) {
      return 'Sous-charge';
    } else if (tauxCharge >= 50 && tauxCharge <= 80) {
      return 'Optimal';
    } else if (tauxCharge > 80 && tauxCharge <= 100) {
      return 'Proche saturation';
    } else {
      return '⚠ Surcharge';
    }
  }

  /**
   * Formate la date pour le nom de fichier
   */
  private formatDateForFilename(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}${month}${day}_${hours}${minutes}`;
  }
}