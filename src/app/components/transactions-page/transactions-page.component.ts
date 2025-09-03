import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TransactionService } from '../../../services/transaction.service';
import { Transaction } from '../../../types';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';
import { TransactionsManagerComponent } from '../transactions-manager/transactions-manager.component';

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [TransactionFormComponent, TransactionsManagerComponent],
  templateUrl: './transactions-page.component.html',
  styleUrls: ['./transactions-page.component.css'],
})
export class TransactionsPageComponent implements OnInit {
  @Input() userId?: string;
  @Output() backToDashboard = new EventEmitter<void>();

  transactions: Transaction[] = [];
  loading = false;
  showForm = false;
  showManager = false;

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.loadTransactions();
  }

  async loadTransactions() {
    this.loading = true;
    try {
      this.transactions = await this.transactionService.getTransactions();
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      this.loading = false;
    }
  }

  onTransactionSaved() {
    this.loadTransactions();
    this.showForm = false;
  }

  onTransactionsManagerClosed() {
    this.showManager = false;
    this.loadTransactions();
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

  goBack() {
    this.backToDashboard.emit();
  }
}
