import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { GoalService } from '../../../services/goal.service';
import { TransactionService } from '../../../services/transaction.service';
import { Goal, Transaction, User } from '../../../types';
import { GoalFormComponent } from '../goal-form/goal-form.component';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TransactionFormComponent, GoalFormComponent],
  template: `
    <div class="min-h-screen bg-background p-4 lg:p-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Tríade Financeira</h1>
          <p *ngIf="currentUser" class="text-muted-foreground mt-1">
            Bem-vindo, {{ currentUser.email }}
          </p>
        </div>
        <button
          (click)="signOut()"
          class="flex items-center space-x-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90 transition-colors"
        >
          <span>Sair</span>
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="!loading" class="space-y-8">
        <!-- Financial Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold text-foreground">Transações Recentes</h2>
                <button
                  (click)="showTransactionForm = true"
                  class="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm"
                >
                  + Nova Transação
                </button>
              </div>

              <div *ngIf="transactions.length === 0" class="text-center py-8 text-muted-foreground">
                <p>Nenhuma transação encontrada</p>
                <p class="text-sm">Comece adicionando sua primeira transação</p>
              </div>

              <div *ngIf="transactions.length > 0" class="space-y-3">
                <div
                  *ngFor="let transaction of transactions"
                  class="flex items-center justify-between p-3 bg-muted rounded-md"
                >
                  <div class="flex items-center space-x-3">
                    <span
                      [class]="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'"
                    >
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
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold text-foreground">Metas Financeiras</h2>
                <button
                  (click)="showGoalForm = true"
                  class="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors text-sm"
                >
                  + Nova Meta
                </button>
              </div>

              <div *ngIf="goals.length === 0" class="text-center py-8 text-muted-foreground">
                <p>Nenhuma meta encontrada</p>
                <p class="text-sm">Comece criando sua primeira meta financeira</p>
              </div>

              <div *ngIf="goals.length > 0" class="space-y-4">
                <div *ngFor="let goal of goals" class="p-4 bg-muted rounded-md">
                  <div class="flex justify-between items-start mb-2">
                    <h3 class="font-medium text-foreground">{{ goal.name }}</h3>
                    <span class="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">{{
                      goal.type
                    }}</span>
                  </div>
                  <div class="mb-2">
                    <div class="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>Progresso</span>
                      <span
                        >{{ formatCurrency(goal.current) }} /
                        {{ formatCurrency(goal.target) }}</span
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

            <!-- Quick Stats -->
            <div class="bg-card p-6 rounded-lg border shadow-sm">
              <h2 class="text-xl font-semibold text-foreground mb-4">Estatísticas Rápidas</h2>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Total de Transações</span>
                  <span class="font-medium">{{ transactions.length }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Metas Completadas</span>
                  <span class="font-medium">{{ completedGoals }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Média Mensal</span>
                  <span class="font-medium">{{ formatCurrency(averageMonthly) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transaction Form Modal -->
      <app-transaction-form
        *ngIf="showTransactionForm"
        [userId]="currentUser?.id || ''"
        (close)="showTransactionForm = false"
        (saved)="onTransactionSaved($event)"
      />

      <!-- Goal Form Modal -->
      <app-goal-form
        *ngIf="showGoalForm"
        [userId]="currentUser?.id || ''"
        (close)="showGoalForm = false"
        (saved)="onGoalSaved($event)"
      />
    </div>
  `,
  styles: [],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private transactionService = inject(TransactionService);
  private goalService = inject(GoalService);

  private destroy$ = new Subject<void>();

  currentUser: User | null = null;
  loading = true;

  // Dados reais
  transactions: Transaction[] = [];
  goals: Goal[] = [];

  // Dados calculados
  balance = 0;
  monthlyIncome = 0;
  monthlyExpenses = 0;
  activeGoals = 0;
  completedGoals = 0;
  averageMonthly = 0;

  // Estado dos modais
  showTransactionForm = false;
  showGoalForm = false;

  ngOnInit() {
    this.initializeDashboard();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async initializeDashboard() {
    try {
      // Observar mudanças no usuário atual
      this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(async (user) => {
        this.currentUser = user;
        if (user) {
          await this.loadUserData(user.id);
        }
        this.loading = false;
      });
    } catch (error) {
      console.error('Erro ao inicializar dashboard:', error);
      this.loading = false;
    }
  }

  private async loadUserData(userId: string) {
    try {
      // Carregar transações e metas em paralelo
      await Promise.all([this.loadTransactions(userId), this.loadGoals(userId)]);

      // Calcular estatísticas
      this.calculateStats();
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  }

  private async loadTransactions(userId: string) {
    try {
      await this.transactionService.loadTransactions(userId);
      this.transactionService.transactions$
        .pipe(takeUntil(this.destroy$))
        .subscribe((transactions) => {
          this.transactions = transactions;
          this.calculateStats();
        });
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    }
  }

  private async loadGoals(userId: string) {
    try {
      await this.goalService.loadGoals(userId);
      this.goalService.goals$.pipe(takeUntil(this.destroy$)).subscribe((goals) => {
        this.goals = goals;
        this.calculateStats();
      });
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    }
  }

  private calculateStats() {
    if (!this.transactions.length) return;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calcular receitas e despesas do mês atual
    const monthlyTransactions = this.transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
      );
    });

    this.monthlyIncome = monthlyTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    this.monthlyExpenses = monthlyTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calcular saldo total
    this.balance =
      this.transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) -
      this.transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // Calcular estatísticas das metas
    this.activeGoals = this.goals.length;
    this.completedGoals = this.goals.filter((g) => g.current >= g.target).length;

    // Calcular média mensal (últimos 3 meses)
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const recentTransactions = this.transactions.filter((t) => new Date(t.date) >= threeMonthsAgo);

    if (recentTransactions.length > 0) {
      const totalRecent =
        recentTransactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0) -
        recentTransactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

      this.averageMonthly = totalRecent / 3;
    }
  }

  async signOut() {
    try {
      await this.authService.signOut();
      this.router.navigate(['/auth']);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  onTransactionSaved(transaction: Transaction) {
    // A transação já foi salva pelo serviço, apenas fechar o modal
    this.showTransactionForm = false;
  }

  onGoalSaved(goal: Goal) {
    // A meta já foi salva pelo serviço, apenas fechar o modal
    this.showGoalForm = false;
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

  getGoalProgress(goal: Goal): number {
    return Math.min((goal.current / goal.target) * 100, 100);
  }
}
