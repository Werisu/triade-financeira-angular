import { Component, OnInit } from '@angular/core';
import { BankAccountService } from '../../../services/bank-account.service';
import { BankAccount } from '../../../types';
import { BankAccountFormComponent } from '../bank-account-form/bank-account-form.component';
import { BankAccountsManagerComponent } from '../bank-accounts-manager/bank-accounts-manager.component';

@Component({
  selector: 'app-bank-accounts-page',
  standalone: true,
  imports: [BankAccountFormComponent, BankAccountsManagerComponent],
  templateUrl: './bank-accounts-page.component.html',
  styleUrls: ['./bank-accounts-page.component.css'],
})
export class BankAccountsPageComponent implements OnInit {
  bankAccounts: BankAccount[] = [];
  loading = false;
  showForm = false;
  showManager = false;

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

  onBankAccountSaved() {
    this.loadBankAccounts();
    this.showForm = false;
  }

  onBankAccountsManagerClosed() {
    this.showManager = false;
    this.loadBankAccounts();
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

  getTotalBalance(): number {
    return this.bankAccounts.reduce((sum, account) => sum + account.current_balance, 0);
  }

  getPositiveBalanceAccountsCount(): number {
    return this.bankAccounts.filter((account) => account.current_balance > 0).length;
  }
}
