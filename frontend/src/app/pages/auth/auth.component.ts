import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, SignupRequest, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  isLogin = signal(true);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  rememberMe = false;
  isLoading = signal(false);
  errorMessage = signal('');

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

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  handleLogin() {
    this.errorMessage.set('');
    this.isLoading.set(true);

    const loginRequest: LoginRequest = {
      email: this.loginData.email,
      password: this.loginData.password
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        console.log('Connexion réussie:', response);
        this.isLoading.set(false);
        // Rediriger vers le dashboard ou la page d'accueil
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Erreur de connexion:', error);
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Email ou mot de passe incorrect');
      }
    });
  }

  handleSignup() {
    this.errorMessage.set('');

    if (this.signupData.password !== this.signupData.confirmPassword) {
      this.errorMessage.set('Les mots de passe ne correspondent pas');
      return;
    }

    if (this.signupData.password.length < 6) {
      this.errorMessage.set('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    this.isLoading.set(true);

    const signupRequest: SignupRequest = {
      firstname: this.signupData.firstname,
      lastname: this.signupData.lastname,
      email: this.signupData.email,
      phone: this.signupData.phone,
      password: this.signupData.password
    };

    this.authService.signup(signupRequest).subscribe({
      next: (response) => {
        console.log('Inscription réussie:', response);
        this.isLoading.set(false);
        // Rediriger vers le dashboard ou la page d'accueil
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Erreur d\'inscription:', error);
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Une erreur s\'est produite lors de l\'inscription');
      }
    });
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  switchMode() {
    this.isLogin.set(!this.isLogin());
    this.errorMessage.set('');
  }
}
