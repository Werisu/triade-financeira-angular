import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CreditCardsPageComponent } from './components/credit-cards-page/credit-cards-page.component';
import { DashboardSimpleComponent } from './components/dashboard-simple/dashboard-simple.component';
import { HeaderComponent } from './components/header/header.component';
import { TransactionsPageComponent } from './components/transactions-page/transactions-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    HeaderComponent,
    DashboardSimpleComponent,
    TransactionsPageComponent,
    CreditCardsPageComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('triade-financeira-angular');
  currentView = 'dashboard';

  constructor(public authService: AuthService) {}

  onNavigate(view: string) {
    this.currentView = view;
  }

  onBackToDashboard() {
    this.currentView = 'dashboard';
  }
}
