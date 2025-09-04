import { Injectable } from '@angular/core';
import { BankAccount } from '../types';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class BankAccountService {
  constructor(private supabase: SupabaseService, private authService: AuthService) {}

  async getBankAccounts(): Promise<BankAccount[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase
      .getClient()
      .from('bank_accounts')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getBankAccountsAsync(): Promise<BankAccount[]> {
    return this.getBankAccounts();
  }

  async createBankAccount(
    bankAccount: Omit<BankAccount, 'id' | 'created_at'>
  ): Promise<BankAccount> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase
      .getClient()
      .from('bank_accounts')
      .insert({
        ...bankAccount,
        user_id: currentUser.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateBankAccount(id: string, updates: Partial<BankAccount>): Promise<BankAccount> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase
      .getClient()
      .from('bank_accounts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', currentUser.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteBankAccount(id: string): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    const { error } = await this.supabase
      .getClient()
      .from('bank_accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUser.id);

    if (error) throw error;
  }

  async updateBalance(id: string, newBalance: number): Promise<BankAccount> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase
      .getClient()
      .from('bank_accounts')
      .update({ current_balance: newBalance })
      .eq('id', id)
      .eq('user_id', currentUser.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
