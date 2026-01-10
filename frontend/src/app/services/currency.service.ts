// frontend/src/app/services/currency.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ExchangeRates {
  EUR: number;
  USD: number;
  TND: number;
  lastUpdate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private rates = signal<ExchangeRates>({
    EUR: 1,
    USD: 1,
    TND: 1,
    lastUpdate: new Date()
  });

  // API gratuite pour les taux de change
  private readonly API_URL = 'https://api.exchangerate-api.com/v4/latest/TND';
  
  constructor(private http: HttpClient) {
    this.loadExchangeRates();
  }

  /**
   * Charge les taux de change depuis l'API
   */
  loadExchangeRates() {
    this.http.get<any>(this.API_URL).pipe(
      map(response => {
        const rates: ExchangeRates = {
          EUR: response.rates.EUR || 0.3,  // TND vers EUR
          USD: response.rates.USD || 0.32, // TND vers USD
          TND: 1,                           // TND vers TND
          lastUpdate: new Date()
          };
        return rates;
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des taux de change:', error);
        // Taux de secours (approximatifs)
        return of({
          EUR: 0.3,
          USD: 0.32,
          TND: 1,
          lastUpdate: new Date()
        });
      })
    ).subscribe(rates => {
      this.rates.set(rates);
      console.log('Taux de change mis à jour:', rates);
    });
  }

  /**
   * Convertit un montant de TND vers une autre devise
   */
  convertFromTND(amount: number, targetCurrency: 'EUR' | 'USD' | 'TND'): number {
    const rates = this.rates();
    const rate = rates[targetCurrency];
    return amount * rate;
  }

  /**
   * Obtient le taux de change actuel
   */
  getRates(): ExchangeRates {
    return this.rates();
  }

  /**
   * Obtient le symbole de la devise
   */
  getCurrencySymbol(currency: string): string {
    switch(currency) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'TND': return 'DT';
      default: return currency;
    }
  }

  /**
   * Formate un montant avec sa devise
   */
  formatAmount(amount: number, currency: string): string {
    const symbol = this.getCurrencySymbol(currency);
    const formatted = amount.toFixed(2);
    
    if (currency === 'EUR') {
      return `${formatted} ${symbol}`;
    } else if (currency === 'USD') {
      return `${symbol} ${formatted}`;
    } else {
      return `${formatted} ${symbol}`;
    }
  }
}