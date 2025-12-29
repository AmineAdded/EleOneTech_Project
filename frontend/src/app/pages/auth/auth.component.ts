import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <!-- Fond décoratif -->
      <div class="background-decoration">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>

      <div class="auth-card">
        <!-- Logo et titre -->
        <div class="auth-header">
          <div class="logo-wrapper">
            <div class="logo-circle">
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
            </div>
          </div>
          <h1 class="app-title">Flower & Flower</h1>
        </div>

        <!-- Formulaire de connexion -->
        <div *ngIf="isLogin()" class="form-container">
          <h2 class="form-title">Bienvenue</h2>
          <p class="form-subtitle">Connectez-vous à votre compte</p>

          <form class="auth-form" (ngSubmit)="handleLogin()">
            <div class="form-group">
              <label for="login-email">Email</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  id="login-email"
                  [(ngModel)]="loginData.email"
                  name="email"
                  placeholder="votre@email.com"
                  required>
              </div>
            </div>

            <div class="form-group">
              <label for="login-password">Mot de passe</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  id="login-password"
                  [(ngModel)]="loginData.password"
                  name="password"
                  placeholder="••••••••"
                  required>
                <button
                  type="button"
                  class="toggle-password"
                  (click)="showPassword.set(!showPassword())">
                  <svg *ngIf="!showPassword()" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg *ngIf="showPassword()" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="form-footer">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe">
                <span>Se souvenir de moi</span>
              </label>
              <a href="javascript:void(0)" class="forgot-link" (click)="goToForgotPassword()">
                Mot de passe oublié?
              </a>
            </div>

            <button type="submit" class="submit-btn">
              <span>Se connecter</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </form>

          <div class="form-switch">
            <p>Vous n'avez pas de compte?
              <a href="javascript:void(0)" (click)="isLogin.set(false)">Créer un compte</a>
            </p>
          </div>
        </div>

        <!-- Formulaire d'inscription -->
        <div *ngIf="!isLogin()" class="form-container">
          <h2 class="form-title">Créer un compte</h2>
          <p class="form-subtitle">Rejoignez notre communauté</p>

          <form class="auth-form" (ngSubmit)="handleSignup()">
            <div class="form-row">
              <div class="form-group">
                <label for="signup-firstname">Prénom</label>
                <input
                  type="text"
                  id="signup-firstname"
                  [(ngModel)]="signupData.firstname"
                  name="firstname"
                  placeholder="Prénom"
                  required>
              </div>

              <div class="form-group">
                <label for="signup-lastname">Nom</label>
                <input
                  type="text"
                  id="signup-lastname"
                  [(ngModel)]="signupData.lastname"
                  name="lastname"
                  placeholder="Nom"
                  required>
              </div>
            </div>

            <div class="form-group">
              <label for="signup-email">Email</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  id="signup-email"
                  [(ngModel)]="signupData.email"
                  name="email"
                  placeholder="votre@email.com"
                  required>
              </div>
            </div>

            <div class="form-group">
              <label for="signup-phone">Téléphone</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <input
                  type="tel"
                  id="signup-phone"
                  [(ngModel)]="signupData.phone"
                  name="phone"
                  placeholder="+216 XX XXX XXX"
                  required>
              </div>
            </div>

            <div class="form-group">
              <label for="signup-password">Mot de passe</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  id="signup-password"
                  [(ngModel)]="signupData.password"
                  name="password"
                  placeholder="••••••••"
                  required>
                <button
                  type="button"
                  class="toggle-password"
                  (click)="showPassword.set(!showPassword())">
                  <svg *ngIf="!showPassword()" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg *ngIf="showPassword()" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="signup-confirm-password">Confirmer le mot de passe</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  [type]="showConfirmPassword() ? 'text' : 'password'"
                  id="signup-confirm-password"
                  [(ngModel)]="signupData.confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  required>
                <button
                  type="button"
                  class="toggle-password"
                  (click)="showConfirmPassword.set(!showConfirmPassword())">
                  <svg *ngIf="!showConfirmPassword()" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg *ngIf="showConfirmPassword()" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" class="submit-btn">
              <span>S'inscrire</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </form>

          <div class="form-switch">
            <p>Vous avez déjà un compte?
              <a href="javascript:void(0)" (click)="isLogin.set(true)">Se connecter</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #FFF5F7 0%, #FFE4E9 50%, #FFF0F3 100%);
      padding: 2rem 1rem;
      position: relative;
      overflow: hidden;
    }

    .background-decoration {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: 0;
    }

    .gradient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.3;
      animation: float-orb 20s ease-in-out infinite;
    }

    .orb-1 {
      width: 400px;
      height: 400px;
      background: linear-gradient(135deg, #E91E63, #F06292);
      top: -100px;
      right: -100px;
      animation-delay: 0s;
    }

    .orb-2 {
      width: 350px;
      height: 350px;
      background: linear-gradient(135deg, #4CAF50, #81C784);
      bottom: -80px;
      left: -80px;
      animation-delay: 7s;
    }

    .orb-3 {
      width: 300px;
      height: 300px;
      background: linear-gradient(135deg, #FF6B9D, #FFC1E3);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation-delay: 14s;
    }

    .auth-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 3rem 2.5rem;
      width: 100%;
      max-width: 480px;
      box-shadow:
        0 20px 80px rgba(233, 30, 99, 0.15),
        0 0 0 1px rgba(255, 255, 255, 0.5);
      animation: fadeInUp 0.6s ease-out;
      position: relative;
      z-index: 1;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .logo-wrapper {
      display: flex;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .logo-circle {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #FFF0F3, #FFE4E9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 10px 30px rgba(233, 30, 99, 0.2),
        0 0 0 6px rgba(255, 255, 255, 0.8),
        0 0 0 8px rgba(233, 30, 99, 0.1);
      animation: pulse-logo 3s ease-in-out infinite;
    }

    .flower-icon {
      width: 50px;
      height: 50px;
      filter: drop-shadow(0 2px 4px rgba(233, 30, 99, 0.2));
    }

    .app-title {
      font-size: 1.8rem;
      font-weight: 300;
      color: #C2185B;
      margin: 0;
      letter-spacing: 0.03em;
      font-family: 'Georgia', serif;
    }

    .form-container {
      animation: fadeIn 0.5s ease-out;
    }

    .form-title {
      font-size: 1.6rem;
      font-weight: 400;
      color: #C2185B;
      margin: 0 0 0.5rem 0;
      text-align: center;
    }

    .form-subtitle {
      text-align: center;
      color: #E91E63;
      margin-bottom: 2rem;
      font-size: 0.95rem;
    }

    .auth-form {
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
      color: #C2185B;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      color: #E91E63;
      stroke-width: 2;
      pointer-events: none;
      z-index: 1;
    }

    .form-group input,
    .input-wrapper input {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid rgba(233, 30, 99, 0.2);
      border-radius: 12px;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      background: rgba(255, 255, 255, 0.9);
      color: #333;
    }

    .input-wrapper input {
      padding-left: 2.75rem;
    }

    .form-group input:focus,
    .input-wrapper input:focus {
      outline: none;
      border-color: #E91E63;
      background: white;
      box-shadow: 0 0 0 4px rgba(233, 30, 99, 0.1);
    }

    .form-group input::placeholder,
    .input-wrapper input::placeholder {
      color: #bbb;
    }

    .toggle-password {
      position: absolute;
      right: 1rem;
      background: none;
      border: none;
      color: #E91E63;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      transition: all 0.3s ease;
      z-index: 1;
    }

    .toggle-password:hover {
      color: #C2185B;
      transform: scale(1.1);
    }

    .form-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
      cursor: pointer;
      user-select: none;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #E91E63;
    }

    .forgot-link {
      color: #E91E63;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .forgot-link:hover {
      color: #C2185B;
      text-decoration: underline;
    }

    .submit-btn {
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #E91E63 0%, #F06292 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(233, 30, 99, 0.3);
      margin-top: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 30px rgba(233, 30, 99, 0.4);
    }

    .submit-btn:active {
      transform: translateY(0);
    }

    .submit-btn svg {
      transition: transform 0.3s ease;
    }

    .submit-btn:hover svg {
      transform: translateX(4px);
    }

    .form-switch {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(233, 30, 99, 0.1);
    }

    .form-switch p {
      color: #666;
      font-size: 0.9rem;
      margin: 0;
    }

    .form-switch a {
      color: #E91E63;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .form-switch a:hover {
      color: #C2185B;
      text-decoration: underline;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes float-orb {
      0%, 100% {
        transform: translate(0, 0) scale(1);
      }
      33% {
        transform: translate(30px, -30px) scale(1.1);
      }
      66% {
        transform: translate(-20px, 20px) scale(0.9);
      }
    }

    @keyframes pulse-logo {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }

    @media (max-width: 768px) {
      .auth-card {
        padding: 2.5rem 1.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .logo-circle {
        width: 70px;
        height: 70px;
      }

      .flower-icon {
        width: 45px;
        height: 45px;
      }

      .app-title {
        font-size: 1.5rem;
      }

      .form-title {
        font-size: 1.4rem;
      }

      .gradient-orb {
        filter: blur(60px);
      }
    }
  `]
})
export class AuthComponent {
  isLogin = signal(true);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  rememberMe = false;

  loginData = {
    email: '',
    password: ''
  };

  signupData = {
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  };

  constructor(private router: Router) {}

  handleLogin() {
    console.log('Login:', this.loginData);
    // Add authentication logic here
  }

  handleSignup() {
    if (this.signupData.password !== this.signupData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    console.log('Signup:', this.signupData);
    // Add registration logic here
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}
