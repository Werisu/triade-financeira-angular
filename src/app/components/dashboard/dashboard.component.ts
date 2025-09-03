import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { CreditCardExpenseService } from '../../../services/credit-card-expense.service';
import { GoalService } from '../../../services/goal.service';
import { TransactionService } from '../../../services/transaction.service';
import { CreditCard, CreditCardExpense, Goal, Transaction, User } from '../../../types';
import { CreditCardExpenseFormComponent } from '../credit-card-expense-form/credit-card-expense-form.component';
import { CreditCardExpensesListComponent } from '../credit-card-expenses-list/credit-card-expenses-list.component';
import { CreditCardExpensesManagerComponent } from '../credit-card-expenses-manager/credit-card-expenses-manager.component';
import { CreditCardFormComponent } from '../credit-card-form/credit-card-form.component';
import { CreditCardsManagerComponent } from '../credit-cards-manager/credit-cards-manager.component';
import { GoalFormComponent } from '../goal-form/goal-form.component';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';
import { TransactionsManagerComponent } from '../transactions-manager/transactions-manager.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TransactionFormComponent,
    TransactionsManagerComponent,
    GoalFormComponent,
    CreditCardFormComponent,
    CreditCardExpenseFormComponent,
    CreditCardsManagerComponent,
    CreditCardExpensesListComponent,
    CreditCardExpensesManagerComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private transactionService = inject(TransactionService);
  private goalService = inject(GoalService);
  private creditCardExpenseService = inject(CreditCardExpenseService);

  private destroy$ = new Subject<void>();

  currentUser: User | null = null;
  loading = true;

  // Dados reais
  transactions: Transaction[] = [];
  goals: Goal[] = [];
  creditCardExpenses: CreditCardExpense[] = [];

  // Dados calculados
  balance = 0;
  monthlyIncome = 0;
  monthlyExpenses = 0;
  activeGoals = 0;
  completedGoals = 0;
  averageMonthly = 0;

  // Estado dos modais
  showTransactionForm = false;
  showTransactionsManager = false;
  showGoalForm = false;
  showCreditCardForm = false;
  showCreditCardExpenseForm = false;
  showCreditCardExpensesManager = false;

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
      // Carregar transações, metas e gastos dos cartões em paralelo
      await Promise.all([
        this.loadTransactions(userId),
        this.loadGoals(userId),
        this.loadCreditCardExpenses(userId),
      ]);

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

  private async loadCreditCardExpenses(userId: string) {
    try {
      this.creditCardExpenses = await this.creditCardExpenseService.getCreditCardExpenses();
      this.calculateStats();
    } catch (error) {
      console.error('Erro ao carregar gastos dos cartões:', error);
    }
  }

  private calculateStats() {
    // Calcular receitas e despesas totais (todos os meses)
    this.monthlyIncome = this.transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calcular despesas das transações normais
    const transactionExpenses = this.transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calcular despesas dos cartões de crédito
    const creditCardExpenses = this.creditCardExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Total de despesas (transações + cartões)
    this.monthlyExpenses = transactionExpenses + creditCardExpenses;

    // Calcular saldo total
    this.balance = this.monthlyIncome - this.monthlyExpenses;

    // Calcular estatísticas das metas
    this.activeGoals = this.goals.length;
    this.completedGoals = this.goals.filter((g) => g.current >= g.target).length;

    // Calcular média mensal (últimos 3 meses)
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const recentTransactions = this.transactions.filter((t) => new Date(t.date) >= threeMonthsAgo);
    const recentCreditCardExpenses = this.creditCardExpenses.filter(
      (e) => new Date(e.date) >= threeMonthsAgo
    );

    if (recentTransactions.length > 0 || recentCreditCardExpenses.length > 0) {
      const recentIncome = recentTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const recentTransactionExpenses = recentTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const recentCreditExpenses = recentCreditCardExpenses.reduce((sum, e) => sum + e.amount, 0);

      const totalRecent = recentIncome - (recentTransactionExpenses + recentCreditExpenses);
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

  onTransactionsManagerClosed() {
    this.showTransactionsManager = false;
  }

  onGoalSaved(goal: Goal) {
    // A meta já foi salva pelo serviço, apenas fechar o modal
    this.showGoalForm = false;
  }

  onCreditCardCreated(creditCard: CreditCard) {
    // O cartão foi criado, fechar o modal
    this.showCreditCardForm = false;
  }

  onCreditCardExpenseCreated(expense: CreditCardExpense) {
    // O gasto foi criado, fechar o modal e recarregar dados
    this.showCreditCardExpenseForm = false;
    if (this.currentUser) {
      this.loadCreditCardExpenses(this.currentUser.id);
    }
  }

  onCreditCardExpensesManagerClosed() {
    this.showCreditCardExpensesManager = false;
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

  getBalanceProgress(): number {
    return Math.min((Math.abs(this.balance) / 1000) * 100, 100);
  }

  getIncomeProgress(): number {
    return Math.min((this.monthlyIncome / 5000) * 100, 100);
  }

  getExpensesProgress(): number {
    return Math.min((this.monthlyExpenses / 5000) * 100, 100);
  }

  getGoalsProgress(): number {
    return Math.min((this.activeGoals / 5) * 100, 100);
  }

  trackByTransaction(index: number, transaction: Transaction): string {
    return transaction.id || index.toString();
  }

  trackByGoal(index: number, goal: Goal): string {
    return goal.id || index.toString();
  }
}
