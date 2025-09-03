import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { BankAccountService } from '../../../services/bank-account.service';
import { BankAccount } from '../../../types';

@Component({
  selector: 'app-bank-account-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bank-account-form.component.html',
  styleUrls: ['./bank-account-form.component.css'],
})
export class BankAccountFormComponent {
  @Output() bankAccountCreated = new EventEmitter<BankAccount>();

  bankAccount: Partial<BankAccount> = {
    name: '',
    bank_name: '',
    account_type: 'checking',
    current_balance: 0,
    color: '#3B82F6',
  };

  colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  bankNames = [
    'Banco do Brasil',
    'Caixa Econômica Federal',
    'Bradesco',
    'Itaú',
    'Santander',
    'Nubank',
    'Inter',
    'PicPay',
    'C6 Bank',
    'BTG Pactual',
    'XP Investimentos',
    'Rico',
    'Clear',
    'Avenue',
    'Outro',
  ];

  accountTypes = [
    { value: 'checking', label: 'Conta Corrente' },
    { value: 'savings', label: 'Poupança' },
    { value: 'investment', label: 'Investimento' },
  ];

  loading = false;

  constructor(private bankAccountService: BankAccountService, private authService: AuthService) {}

  async onSubmit() {
    if (!this.bankAccount.name || !this.bankAccount.bank_name) {
      return;
    }

    this.loading = true;
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      const newBankAccount = await this.bankAccountService.createBankAccount({
        ...this.bankAccount,
        user_id: currentUser.id,
      } as Omit<BankAccount, 'id' | 'created_at'>);

      this.bankAccountCreated.emit(newBankAccount);
      this.resetForm();
    } catch (error) {
      console.error('Erro ao criar conta bancária:', error);
    } finally {
      this.loading = false;
    }
  }

  resetForm() {
    this.bankAccount = {
      name: '',
      bank_name: '',
      account_type: 'checking',
      current_balance: 0,
      color: '#3B82F6',
    };
  }

  selectColor(color: string) {
    this.bankAccount.color = color;
  }
}
