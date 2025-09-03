import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { CreditCardExpenseService } from '../../../services/credit-card-expense.service';
import { CreditCardService } from '../../../services/credit-card.service';
import { CreditCard, CreditCardExpense } from '../../../types';
import { CreditCardExpenseFormComponent } from '../credit-card-expense-form/credit-card-expense-form.component';
import { CreditCardExpenseImportComponent } from '../credit-card-expense-import/credit-card-expense-import.component';

@Component({
  selector: 'app-credit-card-expenses-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CreditCardExpenseFormComponent,
    CreditCardExpenseImportComponent,
  ],
  templateUrl: './credit-card-expenses-manager.component.html',
  styleUrls: ['./credit-card-expenses-manager.component.css'],
})
export class CreditCardExpensesManagerComponent implements OnInit, OnDestroy {
  @Input() userId: string = '';
  @Output() close = new EventEmitter<void>();

  private expenseService = inject(CreditCardExpenseService);
  private creditCardService = inject(CreditCardService);
  private destroy$ = new Subject<void>();

  expenses: CreditCardExpense[] = [];
  creditCards: CreditCard[] = [];
  loading = false;
  error = '';

  // Estado dos modais
  showExpenseForm = false;
  showImportModal = false;
  editingExpense: CreditCardExpense | null = null;

  // Filtros e ordenação
  filterCreditCard = '';
  filterCategory = '';
  sortBy: 'date' | 'amount' | 'description' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';
  searchTerm = '';

  // Categorias disponíveis
  categories = [
    'Alimentação',
    'Transporte',
    'Saúde',
    'Educação',
    'Lazer',
    'Vestuário',
    'Casa',
    'Tecnologia',
    'Serviços',
    'Outros',
  ];

  ngOnInit() {
    if (this.userId) {
      this.loadData();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadData() {
    this.loading = true;
    this.error = '';

    try {
      // Carregar cartões e despesas em paralelo
      const [expenses, creditCards] = await Promise.all([
        this.expenseService.getCreditCardExpenses(),
        this.creditCardService.getCreditCards(),
      ]);

      this.expenses = expenses;
      this.creditCards = creditCards;
    } catch (error: any) {
      this.error = error.message || 'Erro ao carregar dados';
    } finally {
      this.loading = false;
    }
  }

  get filteredExpenses(): CreditCardExpense[] {
    let filtered = [...this.expenses];

    // Filtrar por cartão
    if (this.filterCreditCard) {
      filtered = filtered.filter((e) => e.credit_card_id === this.filterCreditCard);
    }

    // Filtrar por categoria
    if (this.filterCategory) {
      filtered = filtered.filter((e) => e.category === this.filterCategory);
    }

    // Filtrar por termo de busca
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.description?.toLowerCase().includes(term) || e.category.toLowerCase().includes(term)
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'description':
          comparison = (a.description || '').localeCompare(b.description || '');
          break;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }

  onAddExpense() {
    this.editingExpense = null;
    this.showExpenseForm = true;
  }

  onEditExpense(expense: CreditCardExpense) {
    this.editingExpense = expense;
    this.showExpenseForm = true;
  }

  async onDeleteExpense(expense: CreditCardExpense) {
    if (!confirm(`Tem certeza que deseja excluir a despesa "${expense.description}"?`)) {
      return;
    }

    try {
      await this.expenseService.deleteCreditCardExpense(expense.id);
      this.expenses = this.expenses.filter((e) => e.id !== expense.id);
    } catch (error: any) {
      this.error = error.message || 'Erro ao excluir despesa';
    }
  }

  onExpenseSaved(expense: CreditCardExpense) {
    this.showExpenseForm = false;
    this.editingExpense = null;
    // Recarregar dados para incluir a nova despesa
    this.loadData();
  }

  onCloseExpenseForm() {
    this.showExpenseForm = false;
    this.editingExpense = null;
  }

  onImportExpenses() {
    this.showImportModal = true;
  }

  onImportCompleted(importedExpenses: CreditCardExpense[]) {
    this.showImportModal = false;
    // Recarregar dados para incluir as despesas importadas
    this.loadData();
  }

  onCloseImportModal() {
    this.showImportModal = false;
  }

  clearFilters() {
    this.filterCreditCard = '';
    this.filterCategory = '';
    this.searchTerm = '';
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

  getCreditCardName(creditCardId: string): string {
    const card = this.creditCards.find((c) => c.id === creditCardId);
    return card ? card.name : 'Cartão não encontrado';
  }

  getCreditCardColor(creditCardId: string): string {
    const card = this.creditCards.find((c) => c.id === creditCardId);
    return card ? card.color : '#6b7280';
  }

  getInstallmentText(expense: CreditCardExpense): string {
    if (expense.total_installments && expense.total_installments > 1) {
      const installment = expense.installment_number || 1;
      return `${installment}/${expense.total_installments}`;
    }
    return 'À vista';
  }

  getTotalExpenses(): number {
    return this.filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  trackByExpense(index: number, expense: CreditCardExpense): string {
    return expense.id || index.toString();
  }
}
