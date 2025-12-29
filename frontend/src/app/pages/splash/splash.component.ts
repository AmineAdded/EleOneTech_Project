import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="splash-container">
      <div class="splash-content">
        <div class="logo-container">
          <div class="logo-circle">
            <svg class="flower-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <!-- Pétales roses -->
              <circle cx="50" cy="25" r="12" fill="#E91E63"/>
              <circle cx="75" cy="50" r="12" fill="#E91E63"/>
              <circle cx="50" cy="75" r="12" fill="#E91E63"/>
              <circle cx="25" cy="50" r="12" fill="#E91E63"/>

              <!-- Pétales secondaires -->
              <circle cx="65" cy="35" r="9" fill="#F06292"/>
              <circle cx="65" cy="65" r="9" fill="#F06292"/>
              <circle cx="35" cy="65" r="9" fill="#F06292"/>
              <circle cx="35" cy="35" r="9" fill="#F06292"/>

              <!-- Centre de la fleur -->
              <circle cx="50" cy="50" r="15" fill="#4CAF50"/>
              <circle cx="50" cy="50" r="10" fill="#81C784"/>
            </svg>
          </div>
        </div>
        <h1 class="app-name">Flower & Flower</h1>
        <p class="tagline">L'art de la décoration florale</p>
      </div>

      <!-- Particules décoratives -->
      <div class="particles">
        <div class="particle" *ngFor="let p of particles" [style]="getParticleStyle(p)"></div>
      </div>
    </div>
  `,
  styles: [`
    .splash-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background: linear-gradient(135deg, #FFF5F7 0%, #FFE4E9 50%, #FFF0F3 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      overflow: hidden;
    }

    .splash-content {
      text-align: center;
      animation: fadeInUp 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
      z-index: 2;
    }

    .logo-container {
      margin-bottom: 2.5rem;
      display: flex;
      justify-content: center;
    }

    .logo-circle {
      width: 140px;
      height: 140px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 20px 60px rgba(233, 30, 99, 0.2),
        0 0 0 12px rgba(255, 255, 255, 0.8),
        0 0 0 16px rgba(233, 30, 99, 0.1);
      animation: float 3s ease-in-out infinite, pulse 2s ease-in-out infinite;
      position: relative;
    }

    .logo-circle::before {
      content: '';
      position: absolute;
      width: 160px;
      height: 160px;
      border-radius: 50%;
      border: 2px solid rgba(233, 30, 99, 0.2);
      animation: ripple 2s ease-out infinite;
    }

    .flower-icon {
      width: 85px;
      height: 85px;
      filter: drop-shadow(0 4px 8px rgba(233, 30, 99, 0.3));
    }

    .app-name {
      font-size: 3rem;
      font-weight: 300;
      color: #C2185B;
      margin: 0;
      letter-spacing: 0.03em;
      font-family: 'Georgia', serif;
      animation: fadeInText 1s ease-out 0.3s backwards;
    }

    .tagline {
      font-size: 1.1rem;
      color: #E91E63;
      margin-top: 0.75rem;
      font-style: italic;
      font-weight: 300;
      letter-spacing: 0.02em;
      animation: fadeInText 1s ease-out 0.5s backwards;
    }

    .particles {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      z-index: 1;
      pointer-events: none;
    }

    .particle {
      position: absolute;
      width: 8px;
      height: 8px;
      background: radial-gradient(circle, rgba(233, 30, 99, 0.6), transparent);
      border-radius: 50%;
      animation: float-particle 6s ease-in-out infinite;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-12px);
      }
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }

    @keyframes ripple {
      0% {
        transform: scale(1);
        opacity: 0.8;
      }
      100% {
        transform: scale(1.3);
        opacity: 0;
      }
    }

    @keyframes fadeInText {
      from {
        opacity: 0;
        transform: translateY(15px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes float-particle {
      0%, 100% {
        transform: translateY(0) translateX(0);
        opacity: 0;
      }
      10% {
        opacity: 0.6;
      }
      90% {
        opacity: 0.6;
      }
      50% {
        transform: translateY(-100px) translateX(20px);
        opacity: 0.8;
      }
    }

    @media (max-width: 768px) {
      .logo-circle {
        width: 110px;
        height: 110px;
      }

      .flower-icon {
        width: 65px;
        height: 65px;
      }

      .app-name {
        font-size: 2.2rem;
      }

      .tagline {
        font-size: 0.95rem;
      }
    }
  `]
})
export class SplashComponent implements OnInit {
  particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 4,
    duration: 4 + Math.random() * 4
  }));

  constructor(private router: Router) {}

  ngOnInit() {
    setTimeout(() => {
      this.router.navigate(['/auth']);
    }, 2200);
  }

  getParticleStyle(particle: any) {
    return {
      left: `${particle.left}%`,
      bottom: '0',
      'animation-delay': `${particle.delay}s`,
      'animation-duration': `${particle.duration}s`
    };
  }
}
