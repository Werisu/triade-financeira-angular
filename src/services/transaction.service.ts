import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Transaction } from '../types';
import { AuthService } from './auth.service';
import { BankAccountService } from './bank-account.service';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public transactions$ = this.transactionsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService,
    private bankAccountService: BankAccountService
  ) {}

  async loadTransactions(userId: string): Promise<void> {
    this.loadingSubject.next(true);
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('transactions')
        .select(
          `
          *,
          bank_account:bank_accounts(
            name,
            bank_name,
            color
          )
        `
        )
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      this.transactionsSubject.next(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      this.transactionsSubject.next([]);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async addTransaction(
    transaction: Omit<Transaction, 'id' | 'created_at'>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Se for uma receita com conta bancária vinculada, atualiza o saldo
      if (transaction.type === 'income' && transaction.bank_account_id) {
        const bankAccount = await this.bankAccountService.getBankAccount(
          transaction.bank_account_id
        );
        if (bankAccount) {
          const newBalance = bankAccount.current_balance + transaction.amount;
          await this.bankAccountService.updateBalance(transaction.bank_account_id, newBalance);
        }
      }

      const { data, error } = await this.supabaseService
        .getClient()
        .from('transactions')
        .insert(transaction as any)
        .select(
          `
          *,
          bank_account:bank_accounts(
            name,
            bank_name,
            color
          )
        `
        )
        .single();

      if (error) throw error;

      const currentTransactions = this.transactionsSubject.value;
      this.transactionsSubject.next([data, ...currentTransactions]);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateTransaction(
    id: string,
    transaction: Partial<Omit<Transaction, 'id' | 'created_at' | 'user_id'>>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Busca a transação atual para comparar valores
      const currentTransaction = this.transactionsSubject.value.find((t) => t.id === id);

      // Se for uma receita com conta bancária vinculada, atualiza o saldo
      if (transaction.type === 'income' && transaction.bank_account_id) {
        const bankAccount = await this.bankAccountService.getBankAccount(
          transaction.bank_account_id
        );
        if (bankAccount && currentTransaction) {
          // Remove o valor antigo e adiciona o novo
          const oldAmount = currentTransaction.type === 'income' ? currentTransaction.amount : 0;
          const newAmount = transaction.amount || 0;
          const balanceDifference = newAmount - oldAmount;

          if (balanceDifference !== 0) {
            const newBalance = bankAccount.current_balance + balanceDifference;
            await this.bankAccountService.updateBalance(transaction.bank_account_id, newBalance);
          }
        }
      }

      const { data, error } = await this.supabaseService
        .getClient()
        .from('transactions')
        .update(transaction as any)
        .eq('id', id)
        .select(
          `
          *,
          bank_account:bank_accounts(
            name,
            bank_name,
            color
          )
        `
        )
        .single();

      if (error) throw error;

      const currentTransactions = this.transactionsSubject.value;
      const updatedTransactions = currentTransactions.map((t) =>
        t.id === id ? { ...t, ...data } : t
      );
      this.transactionsSubject.next(updatedTransactions);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteTransaction(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Busca a transação atual para reverter o saldo se necessário
      const currentTransaction = this.transactionsSubject.value.find((t) => t.id === id);

      // Se for uma receita com conta bancária vinculada, reverte o saldo
      if (currentTransaction?.type === 'income' && currentTransaction.bank_account_id) {
        const bankAccount = await this.bankAccountService.getBankAccount(
          currentTransaction.bank_account_id
        );
        if (bankAccount) {
          const newBalance = bankAccount.current_balance - currentTransaction.amount;
          await this.bankAccountService.updateBalance(
            currentTransaction.bank_account_id,
            newBalance
          );
        }
      }

      const { error } = await this.supabaseService
        .getClient()
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const currentTransactions = this.transactionsSubject.value;
      this.transactionsSubject.next(currentTransactions.filter((t) => t.id !== id));

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async markAsPaid(id: string): Promise<{ success: boolean; error?: string }> {
    return this.updateTransaction(id, { payment_status: 'paid' });
  }

  async markAsPending(id: string): Promise<{ success: boolean; error?: string }> {
    return this.updateTransaction(id, { payment_status: 'pending' });
  }

  getTransactions(): Transaction[] {
    return this.transactionsSubject.value;
  }

  async getTransactionsAsync(): Promise<Transaction[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('Usuário não autenticado');
      return [];
    }

    // Se não há transações carregadas, carrega do banco
    if (this.transactionsSubject.value.length === 0) {
      await this.loadTransactions(currentUser.id);
    }

    return this.transactionsSubject.value;
  }

  getPendingTransactions(): Transaction[] {
    return this.transactionsSubject.value.filter((t) => t.payment_status === 'pending');
  }

  getPaidTransactions(): Transaction[] {
    return this.transactionsSubject.value.filter((t) => t.payment_status === 'paid');
  }
}
