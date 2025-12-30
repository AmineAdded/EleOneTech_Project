import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from '../../services/auth.service';
import { UserService, UpdateProfileRequest, ChangePasswordRequest } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
          <button class="profile-btn" (click)="openProfileModal()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Mon Profil
          </button>
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

      <!-- Modal Profil -->
      <div class="modal-overlay" *ngIf="showProfileModal()" (click)="closeProfileModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Mon Profil</h2>
            <button class="close-btn" (click)="closeProfileModal()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-tabs">
            <button
              [class.active]="activeTab() === 'info'"
              (click)="activeTab.set('info'); errorMessage.set(''); successMessage.set('')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Informations
            </button>
            <button
              [class.active]="activeTab() === 'password'"
              (click)="activeTab.set('password'); errorMessage.set(''); successMessage.set('')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Mot de passe
            </button>
          </div>

          <div class="modal-body">
            <!-- Messages -->
            <div *ngIf="errorMessage()" class="error-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ errorMessage() }}
            </div>

            <div *ngIf="successMessage()" class="success-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              {{ successMessage() }}
            </div>

            <!-- Tab Informations -->
            <form *ngIf="activeTab() === 'info'" class="profile-form" (ngSubmit)="handleUpdateProfile()">
              <div class="form-row">
                <div class="form-group">
                  <label for="firstname">Prénom</label>
                  <input
                    type="text"
                    id="firstname"
                    [(ngModel)]="profileData.firstname"
                    name="firstname"
                    required
                    [disabled]="isLoading()">
                </div>

                <div class="form-group">
                  <label for="lastname">Nom</label>
                  <input
                    type="text"
                    id="lastname"
                    [(ngModel)]="profileData.lastname"
                    name="lastname"
                    required
                    [disabled]="isLoading()">
                </div>
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input
                  type="email"
                  id="email"
                  [(ngModel)]="profileData.email"
                  name="email"
                  required
                  [disabled]="isLoading()">
              </div>

              <div class="form-group">
                <label for="phone">Téléphone</label>
                <input
                  type="tel"
                  id="phone"
                  [(ngModel)]="profileData.phone"
                  name="phone"
                  required
                  [disabled]="isLoading()">
              </div>

              <button type="submit" class="submit-btn" [disabled]="isLoading()">
                <span *ngIf="!isLoading()">Mettre à jour</span>
                <span *ngIf="isLoading()">Mise à jour...</span>
              </button>
            </form>

            <!-- Tab Mot de passe -->
            <form *ngIf="activeTab() === 'password'" class="profile-form" (ngSubmit)="handleChangePassword()">
              <div class="form-group">
                <label for="currentPassword">Mot de passe actuel</label>
                <div class="input-wrapper">
                  <input
                    [type]="showPassword() ? 'text' : 'password'"
                    id="currentPassword"
                    [(ngModel)]="passwordData.currentPassword"
                    name="currentPassword"
                    required
                    [disabled]="isLoading()">
                  <button
                    type="button"
                    class="toggle-password"
                    (click)="showPassword.set(!showPassword())">
                    <svg *ngIf="!showPassword()" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg *ngIf="showPassword()" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label for="newPassword">Nouveau mot de passe</label>
                <div class="input-wrapper">
                  <input
                    [type]="showNewPassword() ? 'text' : 'password'"
                    id="newPassword"
                    [(ngModel)]="passwordData.newPassword"
                    name="newPassword"
                    placeholder="Minimum 6 caractères"
                    required
                    [disabled]="isLoading()">
                  <button
                    type="button"
                    class="toggle-password"
                    (click)="showNewPassword.set(!showNewPassword())">
                    <svg *ngIf="!showNewPassword()" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg *ngIf="showNewPassword()" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label for="confirmPassword">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  id="confirmPassword"
                  [(ngModel)]="passwordData.confirmPassword"
                  name="confirmPassword"
                  required
                  [disabled]="isLoading()">
              </div>

              <button type="submit" class="submit-btn" [disabled]="isLoading()">
                <span *ngIf="!isLoading()">Changer le mot de passe</span>
                <span *ngIf="isLoading()">Changement...</span>
              </button>
            </form>
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
      gap: 1rem;
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

    .profile-btn, .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .profile-btn {
      background: linear-gradient(135deg, #9C27B0, #BA68C8);
    }

    .profile-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(156, 39, 176, 0.3);
    }

    .logout-btn {
      background: linear-gradient(135deg, #E91E63, #F06292);
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

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 2rem;
      animation: fadeIn 0.3s ease;
    }

    .modal-content {
      background: white;
      border-radius: 20px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .modal-header h2 {
      color: #C2185B;
      margin: 0;
      font-size: 1.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.3s ease;
    }

    .close-btn:hover {
      color: #C2185B;
    }

    .modal-tabs {
      display: flex;
      border-bottom: 1px solid #f0f0f0;
    }

    .modal-tabs button {
      flex: 1;
      padding: 1rem;
      background: none;
      border: none;
      color: #999;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      border-bottom: 3px solid transparent;
    }

    .modal-tabs button:hover {
      color: #C2185B;
      background: #FFF5F7;
    }

    .modal-tabs button.active {
      color: #E91E63;
      border-bottom-color: #E91E63;
    }

    .modal-body {
      padding: 2rem;
    }

    .error-message {
      background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
      border: 2px solid #ef5350;
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #c62828;
      font-size: 0.9rem;
      animation: slideIn 0.3s ease;
    }

    .success-message {
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
      border: 2px solid #66bb6a;
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #2e7d32;
      font-size: 0.9rem;
      animation: slideIn 0.3s ease;
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #8b4c6b;
    }

    .form-group input {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 1.5px solid #e8e8e8;
      border-radius: 10px;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      background: #fafafa;
    }

    .form-group input:focus {
      outline: none;
      border-color: #d4a3b8;
      background: white;
      box-shadow: 0 0 0 3px rgba(212, 163, 184, 0.1);
    }

    .form-group input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-wrapper input {
      padding-right: 3rem;
    }

    .toggle-password {
      position: absolute;
      right: 1rem;
      background: none;
      border: none;
      color: #a67c96;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.3s ease;
    }

    .toggle-password:hover {
      color: #8b4c6b;
    }

    .submit-btn {
      padding: 1rem;
      background: linear-gradient(135deg, #d4577a 0%, #c9688d 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(212, 87, 122, 0.3);
      margin-top: 0.5rem;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(212, 87, 122, 0.4);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .user-section {
        flex-direction: column;
        width: 100%;
      }

      .user-info {
        align-items: center;
      }

      .profile-btn, .logout-btn {
        width: 100%;
        justify-content: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .modal-content {
        margin: 1rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: AuthResponse | null = null;
  showProfileModal = signal(false);
  activeTab = signal<'info' | 'password'>('info');
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showPassword = signal(false);
  showNewPassword = signal(false);

  profileData = {
    firstname: '',
    lastname: '',
    email: '',
    phone: ''
  };

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileData = {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          phone: user.phone
        };
      }
    });
  }

  openProfileModal() {
    if (this.currentUser) {
      this.profileData = {
        firstname: this.currentUser.firstname,
        lastname: this.currentUser.lastname,
        email: this.currentUser.email,
        phone: this.currentUser.phone
      };
    }
    this.errorMessage.set('');
    this.successMessage.set('');
    this.showProfileModal.set(true);
  }

  closeProfileModal() {
    this.showProfileModal.set(false);
    this.activeTab.set('info');
    this.errorMessage.set('');
    this.successMessage.set('');
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  handleUpdateProfile() {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isLoading.set(true);

    const updateRequest: UpdateProfileRequest = {
      firstname: this.profileData.firstname,
      lastname: this.profileData.lastname,
      email: this.profileData.email,
      phone: this.profileData.phone
    };

    this.userService.updateProfile(updateRequest).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set('Profil mis à jour avec succès!');

        localStorage.setItem('currentUser', JSON.stringify(response));
        localStorage.setItem('token', response.token);
        this.currentUser = response;

        setTimeout(() => {
          this.closeProfileModal();
        }, 2000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Erreur lors de la mise à jour');
      }
    });
  }

  handleChangePassword() {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMessage.set('Les mots de passe ne correspondent pas');
      return;
    }

    if (this.passwordData.newPassword.length < 6) {
      this.errorMessage.set('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    this.isLoading.set(true);

    const changePasswordRequest: ChangePasswordRequest = {
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword
    };

    this.userService.changePassword(changePasswordRequest).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set(response.message);
        this.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };

        setTimeout(() => {
          this.closeProfileModal();
        }, 2000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Erreur lors du changement de mot de passe');
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
