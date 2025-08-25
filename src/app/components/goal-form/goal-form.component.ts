import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoalService } from '../../../services/goal.service';
import { Goal } from '../../../types';

@Component({
  selector: 'app-goal-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './goal-form.component.html',
  styleUrls: ['./goal-form.component.css'],
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
