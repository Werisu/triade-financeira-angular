import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { BankAccountService } from '../../../services/bank-account.service';
import { CreditCardExpenseService } from '../../../services/credit-card-expense.service';
import { CreditCardPaymentService } from '../../../services/credit-card-payment.service';
import { BankAccount, CreditCard, CreditCardExpense } from '../../../types';

@Component({
  selector: 'app-credit-card-payment-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './credit-card-payment-form.component.html',
  styleUrls: ['./credit-card-payment-form.component.css'],
})
export class CreditCardPaymentFormComponent implements OnInit {
  @Input() creditCard!: CreditCard;
  @Output() paymentCreated = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  bankAccounts: BankAccount[] = [];
  pendingExpenses: CreditCardExpense[] = [];
  selectedBankAccountId = '';
  paymentAmount = 0;
  paymentDate = new Date().toISOString().split('T')[0];
  description = '';
  loading = false;
  loadingExpenses = false;

  constructor(
    private bankAccountService: BankAccountService,
    private creditCardExpenseService: CreditCardExpenseService,
    private creditCardPaymentService: CreditCardPaymentService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await Promise.all([this.loadBankAccounts(), this.loadPendingExpenses()]);
    this.calculateTotalAmount();
  }

  async loadBankAccounts() {
    try {
      this.bankAccounts = await this.bankAccountService.getBankAccountsAsync();
      // Se o cartão tem uma conta vinculada, selecionar automaticamente
      if (this.creditCard.bank_account_id) {
        this.selectedBankAccountId = this.creditCard.bank_account_id;
      }
    } catch (error) {
      console.error('Erro ao carregar contas bancárias:', error);
    }
  }

  async loadPendingExpenses() {
    this.loadingExpenses = true;
    try {
      this.pendingExpenses = await this.creditCardExpenseService.getPendingExpensesByCard(
        this.creditCard.id
      );
    } catch (error) {
      console.error('Erro ao carregar gastos pendentes:', error);
    } finally {
      this.loadingExpenses = false;
    }
  }

  calculateTotalAmount() {
    this.paymentAmount = this.pendingExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  getSelectedBankAccount(): BankAccount | undefined {
    return this.bankAccounts.find((account) => account.id === this.selectedBankAccountId);
  }

  canPay(): boolean {
    const selectedAccount = this.getSelectedBankAccount();
    return !!(
      this.selectedBankAccountId &&
      this.paymentAmount > 0 &&
      selectedAccount &&
      selectedAccount.current_balance >= this.paymentAmount
    );
  }

  async onSubmit() {
    if (!this.canPay()) {
      return;
    }

    this.loading = true;
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      // Criar o pagamento
      await this.creditCardPaymentService.createCreditCardPayment({
        user_id: currentUser.id,
        credit_card_id: this.creditCard.id,
        amount: this.paymentAmount,
        payment_date: this.paymentDate,
        description: this.description || `Pagamento da fatura - ${this.creditCard.name}`,
      });

      // Marcar todos os gastos como pagos
      await this.creditCardExpenseService.markAllExpensesAsPaid(this.creditCard.id);

      // Atualizar o saldo da conta bancária
      const selectedAccount = this.getSelectedBankAccount();
      if (selectedAccount) {
        const newBalance = selectedAccount.current_balance - this.paymentAmount;
        await this.bankAccountService.updateBalance(selectedAccount.id, newBalance);
      }

      this.paymentCreated.emit();
      this.close.emit();
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      this.loading = false;
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
}
