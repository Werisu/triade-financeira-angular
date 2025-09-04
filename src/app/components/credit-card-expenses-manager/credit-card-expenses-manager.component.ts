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

  // Propriedade computada para evitar loops infinitos
  filteredExpenses: CreditCardExpense[] = [];

  // Propriedades computadas para evitar loops infinitos
  availableMonths: { value: number; label: string }[] = [];
  availableYears: { value: number; label: string }[] = [];
  currentMonthLabel: string = '';
  totalExpenses: number = 0;

  // Estado dos modais
  showExpenseForm = false;
  showImportModal = false;
  editingExpense: CreditCardExpense | null = null;

  // Filtros e ordenação
  filterCreditCard = '';
  filterCategory = '';
  filterMonth = new Date().getMonth() + 1; // Mês atual
  filterYear = new Date().getFullYear(); // Ano atual
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
    console.log('ngOnInit');
    this.initializeComputedProperties();
    if (this.userId) {
      this.loadData();
    }
  }

  ngOnDestroy() {
    console.log('ngOnDestroy');
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadData() {
    console.log('Carregando dados - userId:', this.userId);
    this.loading = true;
    this.error = '';

    try {
      console.log('Chamando serviços...');
      // Carregar cartões e despesas em paralelo
      const [expenses, creditCards] = await Promise.all([
        this.expenseService.getCreditCardExpenses(),
        this.creditCardService.getCreditCards(),
      ]);

      console.log(
        'Dados recebidos - expenses:',
        expenses.length,
        'creditCards:',
        creditCards.length
      );
      this.expenses = expenses;
      this.creditCards = creditCards;
      this.updateFilteredExpenses();
      console.log('Dados carregados com sucesso');
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      this.error = error.message || 'Erro ao carregar dados';
    } finally {
      this.loading = false;
    }
  }

  private updateFilteredExpenses() {
    console.log('updateFilteredExpenses - Iniciando filtro');
    let filtered = [...this.expenses];

    // Filtrar por cartão
    if (this.filterCreditCard) {
      filtered = filtered.filter((e) => e.credit_card_id === this.filterCreditCard);
    }

    // Filtrar por categoria
    if (this.filterCategory) {
      filtered = filtered.filter((e) => e.category === this.filterCategory);
    }

    // Filtrar por mês e ano
    filtered = filtered.filter((e) => {
      const expenseDate = new Date(e.date);
      const expenseMonth = expenseDate.getMonth() + 1;
      const expenseYear = expenseDate.getFullYear();
      return expenseMonth === this.filterMonth && expenseYear === this.filterYear;
    });

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

    this.filteredExpenses = filtered;
    this.updateComputedProperties();
    console.log('updateFilteredExpenses - Filtro concluído, total:', filtered.length);
  }

  onAddExpense() {
    console.log('onAddExpense');
    this.editingExpense = null;
    this.showExpenseForm = true;
  }

  onEditExpense(expense: CreditCardExpense) {
    console.log('onEditExpense', expense.id);
    this.editingExpense = expense;
    this.showExpenseForm = true;
  }

  async onDeleteExpense(expense: CreditCardExpense) {
    console.log('onDeleteExpense', expense.id);
    if (!confirm(`Tem certeza que deseja excluir a despesa "${expense.description}"?`)) {
      return;
    }

    try {
      await this.expenseService.deleteCreditCardExpense(expense.id);
      this.expenses = this.expenses.filter((e) => e.id !== expense.id);
      this.updateFilteredExpenses();
      console.log('onDeleteExpense - Despesa excluída com sucesso');
    } catch (error: any) {
      this.error = error.message || 'Erro ao excluir despesa';
      console.error('onDeleteExpense - Erro:', error);
    }
  }

  onExpenseSaved(expense: CreditCardExpense) {
    console.log('onExpenseSaved', expense.id);
    this.showExpenseForm = false;
    this.editingExpense = null;
    // Recarregar dados para incluir a nova despesa
    this.loadData();
  }

  onCloseExpenseForm() {
    console.log('onCloseExpenseForm');
    this.showExpenseForm = false;
    this.editingExpense = null;
  }

  onImportExpenses() {
    console.log('onImportExpenses');
    this.showImportModal = true;
  }

  onImportCompleted(importedExpenses: CreditCardExpense[]) {
    console.log('onImportCompleted', importedExpenses.length, 'despesas importadas');
    this.showImportModal = false;
    // Recarregar dados para incluir as despesas importadas
    this.loadData();
  }

  onCloseImportModal() {
    console.log('onCloseImportModal');
    this.showImportModal = false;
  }

  clearFilters() {
    console.log('clearFilters');
    this.filterCreditCard = '';
    this.filterCategory = '';
    this.searchTerm = '';
    this.updateFilteredExpenses();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  }

  // Métodos para gerenciar propriedades computadas
  private initializeComputedProperties() {
    console.log('initializeComputedProperties');
    this.availableMonths = [
      { value: 1, label: 'Janeiro' },
      { value: 2, label: 'Fevereiro' },
      { value: 3, label: 'Março' },
      { value: 4, label: 'Abril' },
      { value: 5, label: 'Maio' },
      { value: 6, label: 'Junho' },
      { value: 7, label: 'Julho' },
      { value: 8, label: 'Agosto' },
      { value: 9, label: 'Setembro' },
      { value: 10, label: 'Outubro' },
      { value: 11, label: 'Novembro' },
      { value: 12, label: 'Dezembro' },
    ];

    const currentYear = new Date().getFullYear();
    this.availableYears = [];
    for (let year = currentYear; year >= currentYear - 5; year--) {
      this.availableYears.push({ value: year, label: year.toString() });
    }

    this.updateComputedProperties();
  }

  private updateComputedProperties() {
    console.log('updateComputedProperties');
    // Atualizar currentMonthLabel
    const month = this.availableMonths.find((m) => m.value === this.filterMonth);
    this.currentMonthLabel = month ? month.label : '';

    // Atualizar totalExpenses
    this.totalExpenses = this.filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  // Métodos para filtros de data (agora são propriedades, não getters)

  // Métodos de navegação
  goToPreviousMonth() {
    console.log('goToPreviousMonth');
    if (this.filterMonth === 1) {
      this.filterMonth = 12;
      this.filterYear--;
    } else {
      this.filterMonth--;
    }
    this.updateFilteredExpenses();
  }

  goToNextMonth() {
    console.log('goToNextMonth');
    if (this.filterMonth === 12) {
      this.filterMonth = 1;
      this.filterYear++;
    } else {
      this.filterMonth++;
    }
    this.updateFilteredExpenses();
  }

  goToCurrentMonth() {
    console.log('goToCurrentMonth');
    const now = new Date();
    this.filterMonth = now.getMonth() + 1;
    this.filterYear = now.getFullYear();
    this.updateFilteredExpenses();
  }

  // Métodos para atualizar filtros
  onFilterChange() {
    console.log('onFilterChange');
    this.updateFilteredExpenses();
  }

  onSearchChange() {
    console.log('onSearchChange');
    this.updateFilteredExpenses();
  }

  onSortChange() {
    console.log('onSortChange');
    this.updateFilteredExpenses();
  }

  formatDate(date: string): string {
    console.log('formatDate', date);
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getCreditCardName(creditCardId: string): string {
    console.log('getCreditCardName', creditCardId);
    const card = this.creditCards.find((c) => c.id === creditCardId);
    return card ? card.name : 'Cartão não encontrado';
  }

  getCreditCardColor(creditCardId: string): string {
    console.log('getCreditCardColor', creditCardId);
    const card = this.creditCards.find((c) => c.id === creditCardId);
    return card ? card.color : '#6b7280';
  }

  getInstallmentText(expense: CreditCardExpense): string {
    console.log('getInstallmentText', expense.id);
    if (expense.total_installments && expense.total_installments > 1) {
      const installment = expense.installment_number || 1;
      return `${installment}/${expense.total_installments}`;
    }
    return 'À vista';
  }

  // getTotalExpenses agora é uma propriedade (totalExpenses)

  trackByExpense(index: number, expense: CreditCardExpense): string {
    console.log('trackByExpense', expense.id);
    return expense.id || index.toString();
  }
}
