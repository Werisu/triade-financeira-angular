import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BankAccountService } from '../../../services/bank-account.service';
import { BankAccount } from '../../../types';
import { BankAccountFormComponent } from '../bank-account-form/bank-account-form.component';

@Component({
  selector: 'app-bank-accounts-manager',
  standalone: true,
  imports: [CommonModule, BankAccountFormComponent],
  templateUrl: './bank-accounts-manager.component.html',
  styleUrls: ['./bank-accounts-manager.component.css'],
})
export class BankAccountsManagerComponent implements OnInit {
  @Input() userId?: string;
  @Output() close = new EventEmitter<void>();

  bankAccounts: BankAccount[] = [];
  loading = false;
  showForm = false;

  constructor(private bankAccountService: BankAccountService) {}

  ngOnInit() {
    this.loadBankAccounts();
  }

  async loadBankAccounts() {
    this.loading = true;
    try {
      this.bankAccounts = await this.bankAccountService.getBankAccounts();
    } catch (error) {
      console.error('Erro ao carregar contas bancárias:', error);
    } finally {
      this.loading = false;
    }
  }

  onBankAccountCreated(bankAccount: BankAccount) {
    this.bankAccounts.push(bankAccount);
    this.showForm = false;
  }

  async deleteBankAccount(id: string) {
    if (confirm('Tem certeza que deseja excluir esta conta bancária?')) {
      try {
        await this.bankAccountService.deleteBankAccount(id);
        this.bankAccounts = this.bankAccounts.filter((account) => account.id !== id);
      } catch (error) {
        console.error('Erro ao excluir conta bancária:', error);
      }
    }
  }

  formatBalance(balance: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(balance);
  }

  getAccountTypeLabel(type: string): string {
    const types = {
      checking: 'Conta Corrente',
      savings: 'Poupança',
      investment: 'Investimento',
    };
    return types[type as keyof typeof types] || type;
  }

  getBalanceColor(balance: number): string {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  closeModal() {
    this.close.emit();
  }
}
