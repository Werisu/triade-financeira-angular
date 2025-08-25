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
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-card w-full max-w-md rounded-lg shadow-lg border">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-foreground">
              {{ goal ? 'Editar Meta' : 'Nova Meta' }}
            </h2>
            <button
              (click)="close.emit()"
              class="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Nome da Meta -->
            <div>
              <label for="name" class="block text-sm font-medium text-foreground mb-2">
                Nome da Meta
              </label>
              <input
                id="name"
                type="text"
                [(ngModel)]="goalData.name"
                name="name"
                required
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: Viagem para Europa"
              />
            </div>

            <!-- Tipo da Meta -->
            <div>
              <label for="type" class="block text-sm font-medium text-foreground mb-2">
                Tipo
              </label>
              <select
                id="type"
                [(ngModel)]="goalData.type"
                name="type"
                required
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecione o tipo</option>
                <option value="emergency">🚨 Fundo de Emergência</option>
                <option value="investment">📈 Investimento</option>
                <option value="recovery">💊 Recuperação</option>
                <option value="custom">🎯 Personalizada</option>
              </select>
            </div>

            <!-- Valor Alvo -->
            <div>
              <label for="target" class="block text-sm font-medium text-foreground mb-2">
                Valor Alvo
              </label>
              <input
                id="target"
                type="number"
                [(ngModel)]="goalData.target"
                name="target"
                required
                min="0.01"
                step="0.01"
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0,00"
              />
            </div>

            <!-- Valor Atual -->
            <div>
              <label for="current" class="block text-sm font-medium text-foreground mb-2">
                Valor Atual
              </label>
              <input
                id="current"
                type="number"
                [(ngModel)]="goalData.current"
                name="current"
                required
                min="0"
                step="0.01"
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0,00"
              />
            </div>

            <!-- Mensagens de Erro/Sucesso -->
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

            <!-- Botões -->
            <div class="flex space-x-3 pt-4">
              <button
                type="button"
                (click)="close.emit()"
                class="flex-1 bg-muted text-muted-foreground py-2 px-4 rounded-md hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="loading || !isFormValid()"
                class="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <span *ngIf="loading" class="inline-block animate-spin mr-2">⟳</span>
                {{ goal ? 'Atualizar' : 'Adicionar' }}
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
