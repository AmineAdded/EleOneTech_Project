import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PasswordResetService } from '../../services/password-reset.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  currentStep = signal<'email' | 'otp' | 'password' | 'success'>('email');
  email = '';
  otpCode = ['', '', '', '', '', ''];
  newPassword = '';
  confirmPassword = '';
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private router: Router,
    private passwordResetService: PasswordResetService
  ) {}

  // Étape 1: Envoyer l'email
  handleSendOtp() {
    if (!this.email) {
      this.errorMessage.set('Veuillez entrer votre email');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.passwordResetService.sendOtpCode(this.email).subscribe({
      next: (response) => {
        console.log('OTP envoyé:', response);
        this.isLoading.set(false);
        this.currentStep.set('otp');
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Erreur lors de l\'envoi du code');
      }
    });
  }

  // Étape 2: Vérifier l'OTP
  handleVerifyOtp() {
    const otpString = this.otpCode.join('');

    if (otpString.length !== 6) {
      this.errorMessage.set('Veuillez entrer le code complet');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.passwordResetService.verifyOtp(this.email, otpString).subscribe({
      next: (response) => {
        console.log('OTP vérifié:', response);
        this.isLoading.set(false);
        this.currentStep.set('password');
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Code invalide ou expiré');
      }
    });
  }

  // Étape 3: Réinitialiser le mot de passe
  handleResetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Les mots de passe ne correspondent pas');
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage.set('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    const otpString = this.otpCode.join('');
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.passwordResetService.resetPassword(this.email, otpString, this.newPassword).subscribe({
      next: (response) => {
        console.log('Mot de passe réinitialisé:', response);
        this.isLoading.set(false);
        this.currentStep.set('success');

        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/auth']);
        }, 3000);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Erreur lors de la réinitialisation');
      }
    });
  }

  // Gestion de l'input OTP
  onOtpInput(event: any, index: number) {
    const input = event.target;
    const value = input.value;

    if (value && index < 5) {
      const nextInput = input.nextElementSibling;
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
  }

  onOtpKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.otpCode[index] && index > 0) {
      const prevInput = (event.target as HTMLElement).previousElementSibling;
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
      }
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);

    for (let i = 0; i < digits.length; i++) {
      this.otpCode[i] = digits[i];
    }
  }

  resendOtp() {
    this.handleSendOtp();
  }

  goBack() {
    if (this.currentStep() === 'email') {
      this.router.navigate(['/auth']);
    } else {
      this.currentStep.set('email');
      this.otpCode = ['', '', '', '', '', ''];
      this.newPassword = '';
      this.confirmPassword = '';
      this.errorMessage.set('');
    }
  }
}
