import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { BankAccountService } from '../../../services/bank-account.service';
import { CreditCardExpenseService } from '../../../services/credit-card-expense.service';
import { CreditCardPaymentService } from '../../../services/credit-card-payment.service';
import { CreditCardService } from '../../../services/credit-card.service';
import { TransactionService } from '../../../services/transaction.service';
import {
  BankAccount,
  CreditCard,
  CreditCardExpense,
  CreditCardPayment,
  Transaction,
} from '../../../types';

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
  bankAccounts: BankAccount[] = [];
  loading = false;
  activeTab: 'transactions' | 'credit-cards' | 'payments' | 'invoice-payment' = 'transactions';

  // Formulário para pagamento de fatura
  invoicePaymentForm = {
    creditCardId: '',
    bankAccountId: '',
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    description: 'Pagamento de fatura completa',
  };

  constructor(
    private transactionService: TransactionService,
    private creditCardExpenseService: CreditCardExpenseService,
    private creditCardPaymentService: CreditCardPaymentService,
    private creditCardService: CreditCardService,
    private bankAccountService: BankAccountService,
    private authService: AuthService
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
        this.loadBankAccounts(),
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

  async loadBankAccounts() {
    try {
      this.bankAccounts = await this.bankAccountService.getBankAccountsAsync();
    } catch (error) {
      console.error('Erro ao carregar contas bancárias:', error);
    }
  }

  async markTransactionAsPaid(transaction: Transaction) {
    // Para transações, vamos apenas marcar como pago sem desconto de conta
    // pois transações não estão vinculadas a contas bancárias específicas
    try {
      await this.transactionService.markAsPaid(transaction.id);
      await this.loadPendingTransactions();
    } catch (error) {
      console.error('Erro ao marcar transação como paga:', error);
    }
  }

  async markCreditCardExpenseAsPaid(expense: CreditCardExpense) {
    // Para gastos individuais, vamos apenas marcar como pago
    // O desconto da conta bancária deve ser feito através do pagamento da fatura completa
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

        // Selecionar automaticamente a conta bancária vinculada ao cartão
        const selectedCard = this.creditCards.find(
          (card) => card.id === this.invoicePaymentForm.creditCardId
        );
        if (selectedCard?.bank_account_id) {
          this.invoicePaymentForm.bankAccountId = selectedCard.bank_account_id;
        }
      } catch (error) {
        console.error('Erro ao calcular valor da fatura:', error);
      }
    }
  }

  async payFullInvoice() {
    if (
      !this.invoicePaymentForm.creditCardId ||
      !this.invoicePaymentForm.bankAccountId ||
      this.invoicePaymentForm.amount <= 0
    ) {
      alert('Por favor, selecione um cartão e uma conta bancária.');
      return;
    }

    // Validar se a conta tem saldo suficiente
    const selectedAccount = this.bankAccounts.find(
      (account) => account.id === this.invoicePaymentForm.bankAccountId
    );
    if (!selectedAccount) {
      alert('Conta bancária não encontrada.');
      return;
    }

    if (selectedAccount.current_balance < this.invoicePaymentForm.amount) {
      alert(
        `Saldo insuficiente. Saldo atual: ${this.formatCurrency(selectedAccount.current_balance)}`
      );
      return;
    }

    this.loading = true;
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      // 1. Criar o pagamento da fatura
      await this.creditCardPaymentService.createCreditCardPayment({
        user_id: currentUser.id,
        credit_card_id: this.invoicePaymentForm.creditCardId,
        amount: this.invoicePaymentForm.amount,
        payment_date: this.invoicePaymentForm.paymentDate,
        description: this.invoicePaymentForm.description,
      });

      // 2. Marcar todos os gastos pendentes do cartão como pagos
      await this.creditCardExpenseService.markAllExpensesAsPaid(
        this.invoicePaymentForm.creditCardId
      );

      // 3. Atualizar o saldo da conta bancária
      const newBalance = selectedAccount.current_balance - this.invoicePaymentForm.amount;
      await this.bankAccountService.updateBalance(selectedAccount.id, newBalance);

      // 4. Recarregar dados
      await this.loadData();

      // 5. Resetar formulário
      this.invoicePaymentForm = {
        creditCardId: '',
        bankAccountId: '',
        amount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        description: 'Pagamento de fatura completa',
      };

      alert('Fatura paga com sucesso! O saldo da conta foi atualizado.');
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

  getSelectedBankAccount(): BankAccount | undefined {
    return this.bankAccounts.find(
      (account) => account.id === this.invoicePaymentForm.bankAccountId
    );
  }

  canPayInvoice(): boolean {
    const selectedAccount = this.getSelectedBankAccount();
    return !!(
      this.invoicePaymentForm.creditCardId &&
      this.invoicePaymentForm.bankAccountId &&
      this.invoicePaymentForm.amount > 0 &&
      selectedAccount &&
      selectedAccount.current_balance >= this.invoicePaymentForm.amount
    );
  }
}
