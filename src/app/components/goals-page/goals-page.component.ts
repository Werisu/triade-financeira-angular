import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { GoalService } from '../../../services/goal.service';
import { Goal } from '../../../types';
import { GoalFormComponent } from '../goal-form/goal-form.component';

@Component({
  selector: 'app-goals-page',
  standalone: true,
  imports: [CommonModule, GoalFormComponent],
  templateUrl: './goals-page.component.html',
  styleUrls: ['./goals-page.component.css'],
})
export class GoalsPageComponent implements OnInit {
  private goalService = inject(GoalService);
  private authService = inject(AuthService);

  goals: Goal[] = [];
  loading = false;
  showForm = false;
  selectedGoal: Goal | null = null;

  // Propriedades computadas para evitar loops infinitos
  completedGoalsCount = 0;
  totalInvestedValue = 0;
  overallProgress = 0;
  totalCurrentValue = 0;
  totalTargetValue = 0;
  goalsByType: { type: string; count: number; percentage: number }[] = [];
  progressDistribution: { range: string; count: number; color: string }[] = [];

  ngOnInit() {
    this.loadGoals();
  }

  async loadGoals() {
    this.loading = true;
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        console.error('Usuário não autenticado');
        return;
      }

      await this.goalService.loadGoals(currentUser.id);
      this.goals = this.goalService.getGoals();
      this.updateComputedProperties();
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
      this.goals = [];
    } finally {
      this.loading = false;
    }
  }

  onGoalSaved() {
    this.loadGoals();
    this.showForm = false;
    this.selectedGoal = null;
  }

  onGoalFormClosed() {
    this.showForm = false;
    this.selectedGoal = null;
  }

  editGoal(goal: Goal) {
    this.selectedGoal = goal;
    this.showForm = true;
  }

  async deleteGoal(goal: Goal) {
    if (confirm(`Tem certeza que deseja excluir a meta "${goal.name}"?`)) {
      try {
        const result = await this.goalService.deleteGoal(goal.id);
        if (result.success) {
          await this.loadGoals();
        } else {
          alert('Erro ao excluir meta: ' + result.error);
        }
      } catch (error) {
        console.error('Erro ao excluir meta:', error);
        alert('Erro ao excluir meta');
      }
    }
  }

  getProgressPercentage(goal: Goal): number {
    if (goal.target <= 0) return 0;
    return Math.min((goal.current / goal.target) * 100, 100);
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  }

  getGoalTypeIcon(type: string): string {
    switch (type) {
      case 'emergency':
        return '🚨';
      case 'investment':
        return '📈';
      case 'recovery':
        return '💊';
      case 'custom':
        return '🎯';
      default:
        return '🎯';
    }
  }

  getGoalTypeLabel(type: string): string {
    switch (type) {
      case 'emergency':
        return 'Fundo de Emergência';
      case 'investment':
        return 'Investimento';
      case 'recovery':
        return 'Recuperação';
      case 'custom':
        return 'Personalizada';
      default:
        return 'Personalizada';
    }
  }

  private updateComputedProperties() {
    this.completedGoalsCount = this.getCompletedGoalsCount();
    this.totalInvestedValue = this.getTotalInvestedValue();
    this.overallProgress = this.getOverallProgress();
    this.totalCurrentValue = this.getTotalCurrentValue();
    this.totalTargetValue = this.getTotalTargetValue();
    this.goalsByType = this.getGoalsByType();
    this.progressDistribution = this.getProgressDistribution();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  }

  getRemainingAmount(goal: Goal): number {
    return Math.max(goal.target - goal.current, 0);
  }

  getDaysRemaining(goal: Goal): number {
    // Simulação - em um sistema real, você teria uma data alvo
    const createdDate = new Date(goal.created_at);
    const now = new Date();
    const daysSinceCreation = Math.floor(
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Estimativa baseada no progresso atual
    if (goal.current === 0) return 365; // 1 ano se não começou

    const progressRate = goal.current / daysSinceCreation;
    const remainingAmount = this.getRemainingAmount(goal);

    return Math.ceil(remainingAmount / progressRate);
  }

  getProgressStatus(goal: Goal): string {
    const percentage = this.getProgressPercentage(goal);
    if (percentage >= 100) return 'Concluída';
    if (percentage >= 75) return 'Quase lá';
    if (percentage >= 50) return 'No caminho';
    if (percentage >= 25) return 'Começando';
    return 'Iniciando';
  }

  getProgressStatusColor(goal: Goal): string {
    const percentage = this.getProgressPercentage(goal);
    if (percentage >= 100) return 'text-green-600 bg-green-100';
    if (percentage >= 75) return 'text-blue-600 bg-blue-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 25) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  }

  getMonthlyContribution(goal: Goal): number {
    const createdDate = new Date(goal.created_at);
    const now = new Date();
    const monthsSinceCreation = Math.max(
      1,
      Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    );

    return goal.current / monthsSinceCreation;
  }

  getEstimatedCompletionDate(goal: Goal): string {
    const monthlyContribution = this.getMonthlyContribution(goal);
    if (monthlyContribution <= 0) return 'Indefinido';

    const remainingAmount = this.getRemainingAmount(goal);
    const monthsRemaining = Math.ceil(remainingAmount / monthlyContribution);

    const completionDate = new Date();
    completionDate.setMonth(completionDate.getMonth() + monthsRemaining);

    return completionDate.toLocaleDateString('pt-BR', {
      month: 'short',
      year: 'numeric',
    });
  }

  getGoalPriority(goal: Goal): string {
    switch (goal.type) {
      case 'emergency':
        return 'Alta';
      case 'investment':
        return 'Média';
      case 'recovery':
        return 'Alta';
      case 'custom':
        return 'Baixa';
      default:
        return 'Média';
    }
  }

  getGoalPriorityColor(goal: Goal): string {
    switch (goal.type) {
      case 'emergency':
        return 'text-red-600 bg-red-100';
      case 'investment':
        return 'text-yellow-600 bg-yellow-100';
      case 'recovery':
        return 'text-red-600 bg-red-100';
      case 'custom':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  // Métodos para gráficos
  getGoalsByType(): { type: string; count: number; percentage: number }[] {
    const typeCounts = this.goals.reduce((acc, goal) => {
      acc[goal.type] = (acc[goal.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = this.goals.length;
    return Object.entries(typeCounts).map(([type, count]) => ({
      type: this.getGoalTypeLabel(type),
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));
  }

  getProgressDistribution(): { range: string; count: number; color: string }[] {
    const ranges = [
      { min: 0, max: 25, label: '0-25%', color: 'bg-red-500' },
      { min: 25, max: 50, label: '25-50%', color: 'bg-orange-500' },
      { min: 50, max: 75, label: '50-75%', color: 'bg-yellow-500' },
      { min: 75, max: 100, label: '75-100%', color: 'bg-green-500' },
    ];

    return ranges.map((range) => {
      const count = this.goals.filter((goal) => {
        const percentage = this.getProgressPercentage(goal);
        return percentage >= range.min && percentage < range.max;
      }).length;

      return {
        range: range.label,
        count,
        color: range.color,
      };
    });
  }

  getTotalTargetValue(): number {
    return this.goals.reduce((sum, goal) => sum + goal.target, 0);
  }

  getTotalCurrentValue(): number {
    return this.goals.reduce((sum, goal) => sum + goal.current, 0);
  }

  getOverallProgress(): number {
    const totalTarget = this.getTotalTargetValue();
    if (totalTarget === 0) return 0;
    return (this.getTotalCurrentValue() / totalTarget) * 100;
  }

  getGoalTypeColor(type: string): string {
    switch (type) {
      case 'Fundo de Emergência':
        return 'bg-red-500';
      case 'Investimento':
        return 'bg-green-500';
      case 'Recuperação':
        return 'bg-orange-500';
      case 'Personalizada':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  }

  getCompletedGoalsCount(): number {
    return this.goals.filter((g) => this.getProgressPercentage(g) >= 100).length;
  }

  getTotalInvestedValue(): number {
    return this.goals.reduce((sum, goal) => sum + goal.current, 0);
  }
}
