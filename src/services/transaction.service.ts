import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Transaction } from '../types';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public transactions$ = this.transactionsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private supabaseService: SupabaseService, private authService: AuthService) {}

  async loadTransactions(userId: string): Promise<void> {
    this.loadingSubject.next(true);
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('transactions')
        .select('*')
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
      const { data, error } = await this.supabaseService
        .getClient()
        .from('transactions')
        .insert(transaction as any)
        .select()
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
      const { data, error } = await this.supabaseService
        .getClient()
        .from('transactions')
        .update(transaction as any)
        .eq('id', id)
        .select()
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
