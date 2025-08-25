import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Transaction } from '../types';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public transactions$ = this.transactionsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {}

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
        .insert([transaction])
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

  getTransactions(): Transaction[] {
    return this.transactionsSubject.value;
  }
}
