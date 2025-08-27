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
    <div
      class="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50"
    >
      <!-- Background Elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div
          class="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
        ></div>
        <div
          class="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
          style="animation-delay: -3s;"
        ></div>
        <div
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-success-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse-gentle"
        ></div>
      </div>

      <!-- Main Content -->
      <div class="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div class="w-full max-w-md space-y-8">
          <!-- Header -->
          <div class="text-center space-y-4">
            <div
              class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl shadow-glow mb-4"
            >
              <span class="text-3xl">💰</span>
            </div>
            <h1
              class="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
            >
              FinWell
            </h1>
            <p class="text-lg text-muted-foreground font-medium">
              Controle suas finanças pessoais com inteligência
            </p>
          </div>

          <!-- Auth Card -->
          <div
            class="backdrop-blur-xl bg-white/80 rounded-3xl shadow-large border border-white/20 p-8"
          >
            <!-- Mode Tabs -->
            <div class="flex bg-muted/50 rounded-2xl p-1 mb-8">
              <button
                (click)="setMode('signin')"
                [class]="
                  mode === 'signin'
                    ? 'bg-white text-primary-600 shadow-soft transform scale-105'
                    : 'text-muted-foreground hover:text-foreground'
                "
                class="flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ease-out"
              >
                Entrar
              </button>
              <button
                (click)="setMode('signup')"
                [class]="
                  mode === 'signup'
                    ? 'bg-white text-primary-600 shadow-soft transform scale-105'
                    : 'text-muted-foreground hover:text-foreground'
                "
                class="flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ease-out"
              >
                Cadastrar
              </button>
            </div>

            <!-- Form -->
            <form (ngSubmit)="onSubmit()" class="space-y-6">
              <!-- Email Field -->
              <div class="space-y-2">
                <label for="email" class="block text-sm font-semibold text-foreground">
                  Email
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      class="h-5 w-5 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    [(ngModel)]="email"
                    name="email"
                    required
                    class="w-full pl-12 pr-4 py-4 bg-white/60 border border-white/30 rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white/80 transition-all duration-300 backdrop-blur-sm"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <!-- Password Field -->
              <div class="space-y-2">
                <label for="password" class="block text-sm font-semibold text-foreground">
                  Senha
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      class="h-5 w-5 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    [(ngModel)]="password"
                    name="password"
                    required
                    minlength="6"
                    class="w-full pl-12 pr-4 py-4 bg-white/60 border border-white/30 rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white/80 transition-all duration-300 backdrop-blur-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <!-- Error Message -->
              <div
                *ngIf="error"
                class="animate-slide-down bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-2xl text-sm font-medium"
              >
                <div class="flex items-center space-x-2">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>{{ error }}</span>
                </div>
              </div>

              <!-- Success Message -->
              <div
                *ngIf="success"
                class="animate-slide-down bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-2xl text-sm font-medium"
              >
                <div class="flex items-center space-x-2">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>{{ success }}</span>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="loading || !email || !password || password.length < 6"
                class="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-soft hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div class="flex items-center justify-center space-x-2">
                  <div
                    *ngIf="loading"
                    class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"
                  ></div>
                  <span>{{ mode === 'signin' ? 'Entrar na Conta' : 'Criar Conta' }}</span>
                </div>
              </button>
            </form>

            <!-- Additional Info -->
            <div class="mt-8 text-center">
              <p class="text-sm text-muted-foreground">
                {{ mode === 'signin' ? 'Não tem uma conta?' : 'Já tem uma conta?' }}
                <button
                  (click)="setMode(mode === 'signin' ? 'signup' : 'signin')"
                  class="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                >
                  {{ mode === 'signin' ? 'Cadastre-se' : 'Faça login' }}
                </button>
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="text-center text-sm text-muted-foreground">
            <p>© 2025 FinWell. Todos os direitos reservados.</p>
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
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        } else {
          this.success = 'Login realizado com sucesso!';
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
