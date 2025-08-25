import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoalService } from '../../../services/goal.service';
import { Goal } from '../../../types';

@Component({
  selector: 'app-goal-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
    >
      <div
        class="backdrop-blur-xl bg-white/90 rounded-3xl shadow-large border border-white/20 w-full max-w-md animate-scale-in"
      >
        <div class="p-8">
          <!-- Header -->
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-2xl font-bold text-foreground">
              {{ goal ? 'Editar Meta' : 'Nova Meta' }}
            </h2>
            <button
              (click)="close.emit()"
              class="w-10 h-10 rounded-full bg-muted/50 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center justify-center group hover:scale-110"
            >
              <svg
                class="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Nome da Meta -->
            <div class="space-y-3">
              <label for="name" class="block text-sm font-semibold text-foreground">
                Nome da Meta
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <input
                  id="name"
                  type="text"
                  [(ngModel)]="goalData.name"
                  name="name"
                  required
                  class="w-full pl-12 pr-4 py-4 bg-white/60 border border-white/30 rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white/80 transition-all duration-300 backdrop-blur-sm"
                  placeholder="Ex: Viagem para Europa"
                />
              </div>
            </div>

            <!-- Tipo da Meta -->
            <div class="space-y-3">
              <label for="type" class="block text-sm font-semibold text-foreground"> Tipo </label>
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
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <select
                  id="type"
                  [(ngModel)]="goalData.type"
                  name="type"
                  required
                  class="w-full pl-12 pr-4 py-4 bg-white/60 border border-white/30 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white/80 transition-all duration-300 backdrop-blur-sm appearance-none"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="emergency">🚨 Fundo de Emergência</option>
                  <option value="investment">📈 Investimento</option>
                  <option value="recovery">💊 Recuperação</option>
                  <option value="custom">🎯 Personalizada</option>
                </select>
                <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Valor Alvo -->
            <div class="space-y-3">
              <label for="target" class="block text-sm font-semibold text-foreground">
                Valor Alvo
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <input
                  id="target"
                  type="number"
                  [(ngModel)]="goalData.target"
                  name="target"
                  required
                  min="0.01"
                  step="0.01"
                  class="w-full pl-12 pr-4 py-4 bg-white/60 border border-white/30 rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white/80 transition-all duration-300 backdrop-blur-sm"
                  placeholder="0,00"
                />
              </div>
            </div>

            <!-- Valor Atual -->
            <div class="space-y-3">
              <label for="current" class="block text-sm font-semibold text-foreground">
                Valor Atual
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
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  id="current"
                  type="number"
                  [(ngModel)]="goalData.current"
                  name="current"
                  required
                  min="0"
                  step="0.01"
                  class="w-full pl-12 pr-4 py-4 bg-white/60 border border-white/30 rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white/80 transition-all duration-300 backdrop-blur-sm"
                  placeholder="0,00"
                />
              </div>
            </div>

            <!-- Progress Bar Preview -->
            <div *ngIf="goalData.target > 0" class="space-y-3">
              <div class="flex justify-between text-sm text-muted-foreground">
                <span>Progresso</span>
                <span class="font-medium">{{ getProgressPercentage() }}%</span>
              </div>
              <div class="w-full bg-muted/50 rounded-full h-3 overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-1000 ease-out"
                  [style.width.%]="getProgressPercentage()"
                ></div>
              </div>
              <div class="text-center text-sm text-muted-foreground">
                {{ formatCurrency(goalData.current) }} / {{ formatCurrency(goalData.target) }}
              </div>
            </div>

            <!-- Mensagens de Erro/Sucesso -->
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

            <!-- Botões -->
            <div class="flex space-x-4 pt-6">
              <button
                type="button"
                (click)="close.emit()"
                class="flex-1 bg-muted/50 text-muted-foreground py-4 px-6 rounded-2xl font-semibold hover:bg-muted/80 hover:text-foreground transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="loading || !isFormValid()"
                class="flex-1 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white py-4 px-6 rounded-2xl font-semibold shadow-soft hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <div class="flex items-center justify-center space-x-2">
                  <div
                    *ngIf="loading"
                    class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"
                  ></div>
                  <span>{{ goal ? 'Atualizar' : 'Adicionar' }}</span>
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class GoalFormComponent {
  @Input() goal: Goal | null = null;
  @Input() userId: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Goal>();

  private goalService = inject(GoalService);

  loading = false;
  error = '';
  success = '';

  goalData = {
    name: '',
    type: 'custom' as 'emergency' | 'investment' | 'recovery' | 'custom',
    target: 0,
    current: 0,
  };

  ngOnInit() {
    if (this.goal) {
      // Modo edição
      this.goalData = {
        name: this.goal.name,
        type: this.goal.type,
        target: this.goal.target,
        current: this.goal.current,
      };
    }
  }

  isFormValid(): boolean {
    return (
      this.goalData.name.trim() !== '' &&
      this.goalData.type &&
      this.goalData.target > 0 &&
      this.goalData.current >= 0 &&
      this.goalData.current <= this.goalData.target
    );
  }

  getProgressPercentage(): number {
    if (this.goalData.target <= 0) return 0;
    return Math.min((this.goalData.current / this.goalData.target) * 100, 100);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  }

  async onSubmit() {
    if (!this.isFormValid()) {
      this.error = 'Por favor, preencha todos os campos corretamente';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      const goalData = {
        user_id: this.userId,
        name: this.goalData.name,
        type: this.goalData.type,
        target: this.goalData.target,
        current: this.goalData.current,
      };

      if (this.goal) {
        // TODO: Implementar atualização de meta
        console.log('Atualizar meta:', goalData);
      } else {
        const result = await this.goalService.addGoal(goalData);

        if (result.success) {
          this.success = 'Meta adicionada com sucesso!';
          setTimeout(() => {
            this.close.emit();
          }, 1500);
        } else {
          this.error = result.error || 'Erro ao adicionar meta';
        }
      }
    } catch (error: any) {
      this.error = error.message || 'Erro inesperado';
    } finally {
      this.loading = false;
    }
  }
}
