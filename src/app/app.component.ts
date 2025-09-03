import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  styleUrls: ['./app.css'],
})
export class AppComponent implements OnInit {
  title = 'FinWell';
  currentView = 'dashboard';

  constructor(public authService: AuthService) {}

  ngOnInit() {
    // O AuthService já inicializa automaticamente no construtor
  }

  onNavigate(view: string) {
    this.currentView = view;
  }

  onBackToDashboard() {
    this.currentView = 'dashboard';
  }
}
