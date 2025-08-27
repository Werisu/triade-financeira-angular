import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div *ngIf="authService.loading$ | async" class="loading-screen">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Carregando...</p>
      </div>
    </div>
    <router-outlet *ngIf="!(authService.loading$ | async)"></router-outlet>
  `,
  styles: [
    `
      .loading-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #f8fafc;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }

      .loading-spinner {
        text-align: center;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e2e8f0;
        border-top: 4px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      p {
        color: #64748b;
        font-size: 14px;
        margin: 0;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  title = 'FinWell';

  constructor(public authService: AuthService) {}

  ngOnInit() {
    // O AuthService já inicializa automaticamente no construtor
  }
}
