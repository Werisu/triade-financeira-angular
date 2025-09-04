import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { BankAccountService } from '../../../services/bank-account.service';
import { CreditCardExpenseService } from '../../../services/credit-card-expense.service';
import { GoalService } from '../../../services/goal.service';
import { TransactionService } from '../../../services/transaction.service';
import { BankAccount, CreditCardExpense, Goal, Transaction, User } from '../../../types';
import { NavigationComponent } from '../navigation/navigation.component';
import { PaymentManagerComponent } from '../payment-manager/payment-manager.component';

@Component({
  selector: 'app-dashboard-simple',
  standalone: true,
  imports: [NavigationComponent, PaymentManagerComponent, RouterLink],
  templateUrl: './dashboard-simple.component.html',
  styleUrls: ['./dashboard-simple.component.css'],
})
export class DashboardSimpleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);
  private transactionService = inject(TransactionService);
  private creditCardExpenseService = inject(CreditCardExpenseService);
  private goalService = inject(GoalService);
  private bankAccountService = inject(BankAccountService);

  currentUser: User | null = null;
  loading = false;

  // Dados financeiros
  transactions: Transaction[] = [];
  creditCardExpenses: CreditCardExpense[] = [];
  goals: Goal[] = [];
  bankAccounts: BankAccount[] = [];

  // Estatísticas
  balance = 0;
  monthlyIncome = 0;
  monthlyExpenses = 0;
  activeGoals = 0;
  completedGoals = 0;
  averageMonthly = 0;

  // Modais
  showPaymentManager = false;

  ngOnInit() {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: User | null) => {
      this.currentUser = user;
      if (user) {
        this.loadUserData(user.id);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadUserData(userId: string) {
    this.loading = true;
    try {
      await Promise.all([
        this.loadTransactions(userId),
        this.loadCreditCardExpenses(userId),
        this.loadGoals(userId),
        this.loadBankAccounts(userId),
      ]);
      this.calculateStats();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      this.loading = false;
    }
  }

  private async loadTransactions(userId: string) {
    try {
      this.transactions = await this.transactionService.getTransactions();
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    }
  }

  private async loadCreditCardExpenses(userId: string) {
    try {
      this.creditCardExpenses = await this.creditCardExpenseService.getCreditCardExpenses();
    } catch (error) {
      console.error('Erro ao carregar gastos:', error);
    }
  }

  private async loadGoals(userId: string) {
    try {
      this.goals = await this.goalService.getGoals();
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    }
  }

  private async loadBankAccounts(userId: string) {
    try {
      this.bankAccounts = await this.bankAccountService.getBankAccounts();
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
  }

  private calculateStats() {
    // Filtrar apenas transações pagas
    const paidTransactions = this.transactions.filter((t) => t.payment_status === 'paid');
    const paidCreditCardExpenses = this.creditCardExpenses.filter(
      (e) => e.payment_status === 'paid'
    );

    // Calcular receitas e despesas
    this.monthlyIncome = paidTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const transactionExpenses = paidTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const creditCardExpenses = paidCreditCardExpenses.reduce((sum, e) => sum + e.amount, 0);

    this.monthlyExpenses = transactionExpenses + creditCardExpenses;

    // Calcular saldo das contas bancárias
    const bankAccountBalance = this.bankAccounts.reduce(
      (sum, account) => sum + account.current_balance,
      0
    );

    // Saldo total
    this.balance = this.monthlyIncome - this.monthlyExpenses + bankAccountBalance;

    // Metas
    this.activeGoals = this.goals.length;
    this.completedGoals = this.goals.filter((g) => g.current >= g.target).length;

    // Média mensal (simplificada)
    this.averageMonthly = this.monthlyIncome - this.monthlyExpenses;
  }

  onPaymentManagerClosed() {
    this.showPaymentManager = false;
    if (this.currentUser) {
      this.loadUserData(this.currentUser.id);
    }
  }

  signOut() {
    this.authService.signOut();
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

  getBalanceProgress(): number {
    const max = Math.max(Math.abs(this.monthlyIncome), Math.abs(this.monthlyExpenses));
    return max > 0 ? Math.min((this.balance / max) * 100, 100) : 0;
  }

  getIncomeProgress(): number {
    const max = Math.max(this.monthlyIncome, this.monthlyExpenses);
    return max > 0 ? (this.monthlyIncome / max) * 100 : 0;
  }

  getExpensesProgress(): number {
    const max = Math.max(this.monthlyIncome, this.monthlyExpenses);
    return max > 0 ? (this.monthlyExpenses / max) * 100 : 0;
  }

  getGoalsProgress(): number {
    return this.activeGoals > 0 ? (this.completedGoals / this.activeGoals) * 100 : 0;
  }
}
