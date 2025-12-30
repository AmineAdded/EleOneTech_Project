import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div class="logo-section">
          <svg class="flower-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="25" r="12" fill="#E91E63"/>
            <circle cx="75" cy="50" r="12" fill="#E91E63"/>
            <circle cx="50" cy="75" r="12" fill="#E91E63"/>
            <circle cx="25" cy="50" r="12" fill="#E91E63"/>
            <circle cx="65" cy="35" r="9" fill="#F06292"/>
            <circle cx="65" cy="65" r="9" fill="#F06292"/>
            <circle cx="35" cy="65" r="9" fill="#F06292"/>
            <circle cx="35" cy="35" r="9" fill="#F06292"/>
            <circle cx="50" cy="50" r="15" fill="#4CAF50"/>
            <circle cx="50" cy="50" r="10" fill="#81C784"/>
          </svg>
          <h1>Flower & Flower</h1>
        </div>
        <div class="user-section">
          <div class="user-info" *ngIf="currentUser">
            <span class="user-name">{{ currentUser.firstname }} {{ currentUser.lastname }}</span>
            <span class="user-email">{{ currentUser.email }}</span>
          </div>
          <button class="logout-btn" (click)="logout()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Déconnexion
          </button>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="welcome-card">
          <h2>Bienvenue sur votre Dashboard!</h2>
          <p *ngIf="currentUser">
            Bonjour {{ currentUser.firstname }}, vous êtes connecté avec succès.
          </p>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">🌸</div>
              <h3>Commandes</h3>
              <p class="stat-number">0</p>
            </div>
            <div class="stat-card">
              <div class="stat-icon">💐</div>
              <h3>Produits</h3>
              <p class="stat-number">0</p>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⭐</div>
              <h3>Favoris</h3>
              <p class="stat-number">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #FFF5F7 0%, #FFE4E9 50%, #FFF0F3 100%);
    }

    .dashboard-header {
      background: white;
      padding: 1.5rem 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .flower-icon {
      width: 40px;
      height: 40px;
    }

    .logo-section h1 {
      font-size: 1.5rem;
      color: #C2185B;
      font-family: 'Georgia', serif;
      margin: 0;
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .user-name {
      font-weight: 600;
      color: #C2185B;
    }

    .user-email {
      font-size: 0.875rem;
      color: #E91E63;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: linear-gradient(135deg, #E91E63, #F06292);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .logout-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3);
    }

    .dashboard-content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(233, 30, 99, 0.1);
    }

    .welcome-card h2 {
      color: #C2185B;
      margin-bottom: 0.5rem;
    }

    .welcome-card > p {
      color: #E91E63;
      margin-bottom: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }

    .stat-card {
      background: linear-gradient(135deg, #FFF5F7, #FFE4E9);
      padding: 1.5rem;
      border-radius: 12px;
      text-align: center;
      transition: transform 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .stat-card h3 {
      color: #C2185B;
      margin: 0.5rem 0;
      font-size: 1rem;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #E91E63;
      margin: 0;
    }

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .user-info {
        align-items: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: AuthResponse | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout() {
    this.authService.logout();
  }
}
