import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreditCardExpenseService } from '../../../services/credit-card-expense.service';
import { CreditCardPaymentService } from '../../../services/credit-card-payment.service';
import { CreditCardService } from '../../../services/credit-card.service';
import { TransactionService } from '../../../services/transaction.service';
import { CreditCard, CreditCardExpense, CreditCardPayment, Transaction } from '../../../types';

@Component({
  selector: 'app-payment-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-manager.component.html',
  styleUrls: ['./payment-manager.component.css'],
})
export class PaymentManagerComponent implements OnInit {
  @Input() userId?: string;
  @Output() close = new EventEmitter<void>();

  pendingTransactions: Transaction[] = [];
  pendingCreditCardExpenses: CreditCardExpense[] = [];
  creditCardPayments: CreditCardPayment[] = [];
  creditCards: CreditCard[] = [];
  loading = false;
  activeTab: 'transactions' | 'credit-cards' | 'payments' | 'invoice-payment' = 'transactions';

  // Formulário para pagamento de fatura
  invoicePaymentForm = {
    creditCardId: '',
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    description: 'Pagamento de fatura completa',
  };

  constructor(
    private transactionService: TransactionService,
    private creditCardExpenseService: CreditCardExpenseService,
    private creditCardPaymentService: CreditCardPaymentService,
    private creditCardService: CreditCardService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      await Promise.all([
        this.loadPendingTransactions(),
        this.loadPendingCreditCardExpenses(),
        this.loadCreditCardPayments(),
        this.loadCreditCards(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados de pagamento:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadPendingTransactions() {
    try {
      this.pendingTransactions = this.transactionService.getPendingTransactions();
    } catch (error) {
      console.error('Erro ao carregar transações pendentes:', error);
    }
  }

  async loadPendingCreditCardExpenses() {
    try {
      this.pendingCreditCardExpenses = await this.creditCardExpenseService.getPendingExpenses();
    } catch (error) {
      console.error('Erro ao carregar gastos pendentes:', error);
    }
  }

  async loadCreditCardPayments() {
    try {
      this.creditCardPayments = await this.creditCardPaymentService.getCreditCardPayments();
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    }
  }

  async loadCreditCards() {
    try {
      this.creditCards = await this.creditCardService.getCreditCards();
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
    }
  }

  async markTransactionAsPaid(transaction: Transaction) {
    try {
      await this.transactionService.markAsPaid(transaction.id);
      await this.loadPendingTransactions();
    } catch (error) {
      console.error('Erro ao marcar transação como paga:', error);
    }
  }

  async markCreditCardExpenseAsPaid(expense: CreditCardExpense) {
    try {
      await this.creditCardExpenseService.markExpenseAsPaid(expense.id);
      await this.loadPendingCreditCardExpenses();
    } catch (error) {
      console.error('Erro ao marcar gasto como pago:', error);
    }
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

  closeModal() {
    this.close.emit();
  }

  setActiveTab(tab: 'transactions' | 'credit-cards' | 'payments' | 'invoice-payment') {
    this.activeTab = tab;
  }

  async onCreditCardChange() {
    if (this.invoicePaymentForm.creditCardId) {
      try {
        const pendingExpenses = await this.creditCardExpenseService.getPendingExpensesByCard(
          this.invoicePaymentForm.creditCardId
        );
        this.invoicePaymentForm.amount = pendingExpenses.reduce(
          (sum, expense) => sum + expense.amount,
          0
        );
      } catch (error) {
        console.error('Erro ao calcular valor da fatura:', error);
      }
    }
  }

  async payFullInvoice() {
    if (!this.invoicePaymentForm.creditCardId || this.invoicePaymentForm.amount <= 0) {
      return;
    }

    this.loading = true;
    try {
      // 1. Criar o pagamento da fatura
      await this.creditCardPaymentService.payFullInvoice(
        this.invoicePaymentForm.creditCardId,
        this.invoicePaymentForm.amount,
        this.invoicePaymentForm.paymentDate,
        this.invoicePaymentForm.description
      );

      // 2. Marcar todos os gastos pendentes do cartão como pagos
      await this.creditCardExpenseService.markAllExpensesAsPaid(
        this.invoicePaymentForm.creditCardId
      );

      // 3. Recarregar dados
      await this.loadData();

      // 4. Resetar formulário
      this.invoicePaymentForm = {
        creditCardId: '',
        amount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        description: 'Pagamento de fatura completa',
      };

      alert('Fatura paga com sucesso!');
    } catch (error) {
      console.error('Erro ao pagar fatura:', error);
      alert('Erro ao pagar fatura. Tente novamente.');
    } finally {
      this.loading = false;
    }
  }

  getCreditCardName(creditCardId: string): string {
    const card = this.creditCards.find((c) => c.id === creditCardId);
    return card ? card.name : '';
  }
}
