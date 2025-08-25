import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-background p-4 lg:p-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-foreground">Tríade Financeira</h1>
        <button
          (click)="signOut()"
          class="flex items-center space-x-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90 transition-colors"
        >
          <span>Sair</span>
        </button>
      </div>

      <!-- Financial Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-card p-6 rounded-lg border shadow-sm">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-green-100 rounded-full">
              <span class="text-green-600 text-xl">💰</span>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Saldo Total</p>
              <p class="text-2xl font-bold text-foreground">{{ formatCurrency(balance) }}</p>
            </div>
          </div>
        </div>

        <div class="bg-card p-6 rounded-lg border shadow-sm">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-100 rounded-full">
              <span class="text-blue-600 text-xl">📈</span>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Receitas do Mês</p>
              <p class="text-2xl font-bold text-foreground text-green-600">
                {{ formatCurrency(monthlyIncome) }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-card p-6 rounded-lg border shadow-sm">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-red-100 rounded-full">
              <span class="text-red-600 text-xl">📉</span>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Despesas do Mês</p>
              <p class="text-2xl font-bold text-foreground text-red-600">
                {{ formatCurrency(monthlyExpenses) }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-card p-6 rounded-lg border shadow-sm">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-purple-100 rounded-full">
              <span class="text-purple-600 text-xl">🎯</span>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Metas Ativas</p>
              <p class="text-2xl font-bold text-foreground">{{ activeGoals }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Transactions Section -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-card p-6 rounded-lg border shadow-sm">
            <h2 class="text-xl font-semibold text-foreground mb-4">Transações Recentes</h2>
            <div class="space-y-3">
              <div
                *ngFor="let transaction of recentTransactions"
                class="flex items-center justify-between p-3 bg-muted rounded-md"
              >
                <div class="flex items-center space-x-3">
                  <span [class]="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'">
                    {{ transaction.type === 'income' ? '💰' : '💸' }}
                  </span>
                  <div>
                    <p class="font-medium text-foreground">{{ transaction.description }}</p>
                    <p class="text-sm text-muted-foreground">{{ transaction.category }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p
                    [class]="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'"
                    class="font-semibold"
                  >
                    {{ transaction.type === 'income' ? '+' : '-'
                    }}{{ formatCurrency(transaction.amount) }}
                  </p>
                  <p class="text-sm text-muted-foreground">{{ formatDate(transaction.date) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Financial Chart Placeholder -->
          <div class="bg-card p-6 rounded-lg border shadow-sm">
            <h2 class="text-xl font-semibold text-foreground mb-4">Gráfico Financeiro</h2>
            <div class="h-64 bg-muted rounded-md flex items-center justify-center">
              <p class="text-muted-foreground">Gráfico será implementado aqui</p>
            </div>
          </div>
        </div>

        <!-- Goals Section -->
        <div class="space-y-6">
          <div class="bg-card p-6 rounded-lg border shadow-sm">
            <h2 class="text-xl font-semibold text-foreground mb-4">Metas Financeiras</h2>
            <div class="space-y-4">
              <div *ngFor="let goal of goals" class="p-4 bg-muted rounded-md">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="font-medium text-foreground">{{ goal.title }}</h3>
                  <span class="text-sm text-muted-foreground">{{ formatDate(goal.deadline) }}</span>
                </div>
                <div class="mb-2">
                  <div class="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Progresso</span>
                    <span
                      >{{ formatCurrency(goal.current_amount) }} /
                      {{ formatCurrency(goal.target_amount) }}</span
                    >
                  </div>
                  <div class="w-full bg-background rounded-full h-2">
                    <div
                      class="bg-primary h-2 rounded-full transition-all duration-300"
                      [style.width.%]="getGoalProgress(goal)"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-card p-6 rounded-lg border shadow-sm">
            <h2 class="text-xl font-semibold text-foreground mb-4">Ações Rápidas</h2>
            <div class="space-y-3">
              <button
                class="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
              >
                + Nova Transação
              </button>
              <button
                class="w-full bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/90 transition-colors"
              >
                + Nova Meta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);

  // Dados simulados
  balance = 12500;
  monthlyIncome = 8500;
  monthlyExpenses = 3200;
  activeGoals = 3;

  recentTransactions = [
    {
      id: '1',
      description: 'Salário',
      amount: 8500,
      type: 'income' as const,
      category: 'Trabalho',
      date: new Date().toISOString(),
    },
    {
      id: '2',
      description: 'Supermercado',
      amount: 450,
      type: 'expense' as const,
      category: 'Alimentação',
      date: new Date().toISOString(),
    },
    {
      id: '3',
      description: 'Freelance',
      amount: 1200,
      type: 'income' as const,
      category: 'Trabalho',
      date: new Date().toISOString(),
    },
  ];

  goals = [
    {
      id: '1',
      title: 'Viagem para Europa',
      target_amount: 15000,
      current_amount: 8500,
      deadline: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      title: 'Entrada do Apartamento',
      target_amount: 50000,
      current_amount: 25000,
      deadline: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      title: 'Fundo de Emergência',
      target_amount: 10000,
      current_amount: 10000,
      deadline: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  ngOnInit() {
    // Carregar dados reais aqui
  }

  signOut() {
    this.router.navigate(['/auth']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getGoalProgress(goal: any): number {
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  }
}
