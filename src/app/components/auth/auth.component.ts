import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-background p-4">
      <div class="w-full max-w-md space-y-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-foreground">Tríade Financeira</h1>
          <p class="mt-2 text-muted-foreground">Controle suas finanças pessoais</p>
        </div>

        <div class="bg-card p-8 rounded-lg shadow-lg border">
          <div class="flex space-x-4 mb-6">
            <button
              (click)="setMode('signin')"
              [class.bg-primary]="mode === 'signin'"
              [class.text-primary-foreground]="mode === 'signin'"
              class="flex-1 py-2 px-4 rounded-md transition-colors"
            >
              Entrar
            </button>
            <button
              (click)="setMode('signup')"
              [class.bg-primary]="mode === 'signup'"
              [class.text-primary-foreground]="mode === 'signup'"
              class="flex-1 py-2 px-4 rounded-md transition-colors"
            >
              Cadastrar
            </button>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-foreground mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>

            <div *ngIf="error" class="text-destructive text-sm text-center">
              {{ error }}
            </div>

            <button
              type="submit"
              [disabled]="loading"
              class="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <span *ngIf="loading" class="inline-block animate-spin mr-2">⟳</span>
              {{ mode === 'signin' ? 'Entrar' : 'Cadastrar' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class AuthComponent {
  private router = inject(Router);

  mode: 'signin' | 'signup' = 'signin';
  email = '';
  password = '';
  loading = false;
  error = '';

  setMode(mode: 'signin' | 'signup') {
    this.mode = mode;
    this.error = '';
  }

  async onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Por favor, preencha todos os campos';
      return;
    }

    this.loading = true;
    this.error = '';

    // Simular autenticação por enquanto
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/']);
    }, 1000);
  }
}
