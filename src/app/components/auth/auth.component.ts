import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

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
                minlength="6"
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>

            <div
              *ngIf="error"
              class="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-md"
            >
              {{ error }}
            </div>

            <div
              *ngIf="success"
              class="text-green-600 text-sm text-center bg-green-100 p-3 rounded-md"
            >
              {{ success }}
            </div>

            <button
              type="submit"
              [disabled]="loading || !email || !password || password.length < 6"
              class="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <span *ngIf="loading" class="inline-block animate-spin mr-2">⟳</span>
              {{ mode === 'signin' ? 'Entrar' : 'Cadastrar' }}
            </button>
          </form>

          <!-- Debug Info -->
          <div class="mt-6 p-4 bg-muted rounded-md text-xs text-muted-foreground">
            <p><strong>Debug:</strong></p>
            <p>Email: {{ email }}</p>
            <p>Password length: {{ password.length }}</p>
            <p>Mode: {{ mode }}</p>
            <p>Loading: {{ loading }}</p>
            <p>Error: {{ error || 'none' }}</p>
            <p>Success: {{ success || 'none' }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class AuthComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  mode: 'signin' | 'signup' = 'signin';
  email = '';
  password = '';
  loading = false;
  error = '';
  success = '';

  setMode(mode: 'signin' | 'signup') {
    this.mode = mode;
    this.error = '';
    this.success = '';
  }

  async onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Por favor, preencha todos os campos';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'A senha deve ter pelo menos 6 caracteres';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      console.log(`Tentando ${this.mode} com:`, {
        email: this.email,
        passwordLength: this.password.length,
      });

      let result;

      if (this.mode === 'signin') {
        result = await this.authService.signIn(this.email, this.password);
        console.log('Resultado do signIn:', result);
      } else {
        result = await this.authService.signUp(this.email, this.password);
        console.log('Resultado do signUp:', result);
      }

      if (result.success) {
        if (this.mode === 'signup') {
          this.success = 'Conta criada com sucesso! Verifique seu email para confirmar.';
          // Aguardar um pouco antes de redirecionar
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        } else {
          this.success = 'Login realizado com sucesso!';
          // Redirecionar imediatamente após login
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1000);
        }
      } else {
        this.error = result.error || 'Erro na autenticação';
        console.error('Erro na autenticação:', result.error);
      }
    } catch (error: any) {
      console.error('Exceção capturada:', error);
      this.error = error.message || 'Erro inesperado';
    } finally {
      this.loading = false;
    }
  }
}
