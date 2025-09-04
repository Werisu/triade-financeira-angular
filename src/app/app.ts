import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent, AsyncPipe],
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
