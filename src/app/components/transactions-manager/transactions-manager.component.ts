import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TransactionService } from '../../../services/transaction.service';
import { Transaction } from '../../../types';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';

@Component({
  selector: 'app-transactions-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, TransactionFormComponent],
  templateUrl: './transactions-manager.component.html',
  styleUrls: ['./transactions-manager.component.css'],
})
export class TransactionsManagerComponent implements OnInit, OnDestroy {
  @Input() userId: string = '';
  @Output() close = new EventEmitter<void>();

  private transactionService = inject(TransactionService);
  private destroy$ = new Subject<void>();

  transactions: Transaction[] = [];
  loading = false;
  error = '';

  // Estado dos modais
  showTransactionForm = false;
  editingTransaction: Transaction | null = null;

  // Filtros e ordenação
  filterType: 'all' | 'income' | 'expense' = 'all';
  filterCategory = '';
  sortBy: 'date' | 'amount' | 'description' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';
  searchTerm = '';

  // Categorias disponíveis
  categories = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Trabalho',
    'Investimentos',
    'Outros',
  ];

  ngOnInit() {
    if (this.userId) {
      this.loadTransactions();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadTransactions() {
    this.loading = true;
    this.error = '';

    try {
      await this.transactionService.loadTransactions(this.userId);
      this.transactionService.transactions$
        .pipe(takeUntil(this.destroy$))
        .subscribe((transactions) => {
          this.transactions = transactions;
          this.loading = false;
        });
    } catch (error: any) {
      this.error = error.message || 'Erro ao carregar transações';
      this.loading = false;
    }
  }

  get filteredTransactions(): Transaction[] {
    let filtered = [...this.transactions];

    // Filtrar por tipo
    if (this.filterType !== 'all') {
      filtered = filtered.filter((t) => t.type === this.filterType);
    }

    // Filtrar por categoria
    if (this.filterCategory) {
      filtered = filtered.filter((t) => t.category === this.filterCategory);
    }

    // Filtrar por termo de busca
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description?.toLowerCase().includes(term) || t.category.toLowerCase().includes(term)
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

  onAddTransaction() {
    this.editingTransaction = null;
    this.showTransactionForm = true;
  }

  onEditTransaction(transaction: Transaction) {
    this.editingTransaction = transaction;
    this.showTransactionForm = true;
  }

  async onDeleteTransaction(transaction: Transaction) {
    if (!confirm(`Tem certeza que deseja excluir a transação "${transaction.description}"?`)) {
      return;
    }

    try {
      const result = await this.transactionService.deleteTransaction(transaction.id);
      if (!result.success) {
        this.error = result.error || 'Erro ao excluir transação';
      }
    } catch (error: any) {
      this.error = error.message || 'Erro ao excluir transação';
    }
  }

  onTransactionSaved(transaction: Transaction) {
    this.showTransactionForm = false;
    this.editingTransaction = null;
  }

  onCloseTransactionForm() {
    this.showTransactionForm = false;
    this.editingTransaction = null;
  }

  clearFilters() {
    this.filterType = 'all';
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

  trackByTransaction(index: number, transaction: Transaction): string {
    return transaction.id || index.toString();
  }
}
