import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BankAccountService } from '../../../services/bank-account.service';
import { BankTransferService } from '../../../services/bank-transfer.service';
import { BankAccount } from '../../../types';

@Component({
  selector: 'app-bank-transfer-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './bank-transfer-form.component.html',
  styleUrls: ['./bank-transfer-form.component.css'],
})
export class BankTransferFormComponent implements OnInit {
  @Output() transferCreated = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  bankAccounts: BankAccount[] = [];
  fromAccountId = '';
  toAccountId = '';
  amount = 0;
  description = '';
  transferDate = new Date().toISOString().split('T')[0];
  loading = false;

  constructor(
    private bankAccountService: BankAccountService,
    private bankTransferService: BankTransferService
  ) {}

  async ngOnInit() {
    await this.loadBankAccounts();
  }

  async loadBankAccounts() {
    try {
      this.bankAccounts = await this.bankAccountService.getBankAccountsAsync();
    } catch (error) {
      console.error('Erro ao carregar contas bancárias:', error);
    }
  }

  getAvailableToAccounts(): BankAccount[] {
    return this.bankAccounts.filter((account) => account.id !== this.fromAccountId);
  }

  getFromAccount(): BankAccount | undefined {
    return this.bankAccounts.find((account) => account.id === this.fromAccountId);
  }

  canTransfer(): boolean {
    const fromAccount = this.getFromAccount();
    return !!(
      this.fromAccountId &&
      this.toAccountId &&
      this.amount > 0 &&
      fromAccount &&
      fromAccount.current_balance >= this.amount
    );
  }

  async onSubmit() {
    if (!this.canTransfer()) {
      return;
    }

    this.loading = true;
    try {
      await this.bankTransferService.createTransfer(
        this.fromAccountId,
        this.toAccountId,
        this.amount,
        this.description || undefined,
        this.transferDate
      );

      this.transferCreated.emit();
      this.resetForm();
    } catch (error) {
      console.error('Erro ao criar transferência:', error);
      alert('Erro ao criar transferência. Tente novamente.');
    } finally {
      this.loading = false;
    }
  }

  resetForm() {
    this.fromAccountId = '';
    this.toAccountId = '';
    this.amount = 0;
    this.description = '';
    this.transferDate = new Date().toISOString().split('T')[0];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  }
}
