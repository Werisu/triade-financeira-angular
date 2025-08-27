import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { CreditCardExpenseService } from '../../../services/credit-card-expense.service';
import { CreditCardExpense } from '../../../types';

@Component({
  selector: 'app-credit-card-expenses-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './credit-card-expenses-list.component.html',
  styleUrls: ['./credit-card-expenses-list.component.css'],
})
export class CreditCardExpensesListComponent implements OnInit {
  @Input() creditCardId?: string;
  @Input() showCreditCardName = true;

  expenses: CreditCardExpense[] = [];
  loading = false;
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  constructor(private expenseService: CreditCardExpenseService) {}

  ngOnInit() {
    this.loadExpenses();
  }

  async loadExpenses() {
    this.loading = true;
    try {
      if (this.creditCardId) {
        this.expenses = await this.expenseService.getCreditCardExpenses(this.creditCardId);
      } else {
        this.expenses = await this.expenseService.getExpensesByMonth(
          this.currentYear,
          this.currentMonth
        );
      }
    } catch (error) {
      console.error('Erro ao carregar gastos:', error);
    } finally {
      this.loading = false;
    }
  }

  formatDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  }

  getInstallmentText(expense: CreditCardExpense): string {
    if (expense.total_installments && expense.total_installments > 1) {
      const installment = expense.installment_number || 1;
      return ` - Parcela ${installment}/${expense.total_installments}`;
    }
    return '';
  }

  getPaymentMethod(expense: CreditCardExpense): string {
    if (expense.total_installments && expense.total_installments > 1) {
      return 'Pg';
    }
    return 'Mp';
  }

  getTagsDisplay(tags: string[]): string {
    if (!tags || tags.length === 0) return '';
    return tags.join(', ');
  }

  getTotalExpenses(): number {
    return this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }
}
