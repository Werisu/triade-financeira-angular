import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { BankAccountService } from '../../../services/bank-account.service';
import { TransactionService } from '../../../services/transaction.service';
import { BankAccount, Transaction } from '../../../types';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css'],
})
export class TransactionFormComponent {
  @Input() transaction: Transaction | null = null;
  @Input() userId: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Transaction>();

  private transactionService = inject(TransactionService);
  private bankAccountService = inject(BankAccountService);
  private authService = inject(AuthService);

  loading = false;
  error = '';
  success = '';
  bankAccounts: BankAccount[] = [];

  transactionData = {
    type: 'expense' as 'income' | 'expense',
    amount: 0,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    payment_status: 'pending' as 'pending' | 'paid',
    bank_account_id: null as string | null,
  };

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

  async ngOnInit() {
    // Carrega as contas bancárias
    await this.loadBankAccounts();

    if (this.transaction) {
      // Modo edição
      this.transactionData = {
        type: this.transaction.type,
        amount: this.transaction.amount,
        category: this.transaction.category,
        description: this.transaction.description || '',
        date: this.transaction.date,
        payment_status: this.transaction.payment_status || 'pending',
        bank_account_id: this.transaction.bank_account_id || null,
      };
    }
  }

  async loadBankAccounts() {
    try {
      this.bankAccounts = await this.bankAccountService.getBankAccountsAsync();
    } catch (error) {
      console.error('Erro ao carregar contas bancárias:', error);
      this.bankAccounts = [];
    }
  }

  isFormValid(): boolean {
    const basicValidation =
      this.transactionData.amount > 0 &&
      this.transactionData.category.trim() !== '' &&
      this.transactionData.description.trim() !== '' &&
      this.transactionData.date !== '';

    // Para receitas, é obrigatório selecionar uma conta bancária
    if (this.transactionData.type === 'income') {
      return basicValidation && this.transactionData.bank_account_id !== null;
    }

    return basicValidation;
  }

  async onSubmit() {
    if (!this.isFormValid()) {
      this.error = 'Por favor, preencha todos os campos corretamente';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      // Obter userId do AuthService se não foi fornecido via @Input
      const userId = this.userId || this.authService.getCurrentUser()?.id;

      if (!userId) {
        this.error = 'Usuário não autenticado';
        return;
      }

      const transactionData = {
        user_id: userId,
        type: this.transactionData.type,
        amount: this.transactionData.amount,
        category: this.transactionData.category,
        description: this.transactionData.description,
        date: this.transactionData.date,
        payment_status: this.transactionData.payment_status,
        bank_account_id: this.transactionData.bank_account_id,
      };

      if (this.transaction) {
        // Modo edição
        const result = await this.transactionService.updateTransaction(this.transaction.id, {
          type: this.transactionData.type,
          amount: this.transactionData.amount,
          category: this.transactionData.category,
          description: this.transactionData.description,
          date: this.transactionData.date,
          payment_status: this.transactionData.payment_status,
          bank_account_id: this.transactionData.bank_account_id,
        });

        if (result.success) {
          this.success = 'Transação atualizada com sucesso!';
          setTimeout(() => {
            this.close.emit();
          }, 1500);
        } else {
          this.error = result.error || 'Erro ao atualizar transação';
        }
      } else {
        // Modo criação
        const result = await this.transactionService.addTransaction(transactionData);

        if (result.success) {
          this.success = 'Transação adicionada com sucesso!';
          setTimeout(() => {
            this.close.emit();
          }, 1500);
        } else {
          this.error = result.error || 'Erro ao adicionar transação';
        }
      }
    } catch (error: any) {
      this.error = error.message || 'Erro inesperado';
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
}
