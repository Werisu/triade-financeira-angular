import { Injectable } from '@angular/core';
import { CreditCard } from '../types';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class CreditCardService {
  constructor(private supabase: SupabaseService, private authService: AuthService) {}

  async getCreditCards(): Promise<CreditCard[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase
      .getClient()
      .from('credit_cards')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async createCreditCard(creditCard: Omit<CreditCard, 'id' | 'created_at'>): Promise<CreditCard> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase
      .getClient()
      .from('credit_cards')
      .insert({
        ...creditCard,
        user_id: currentUser.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCreditCard(id: string, updates: Partial<CreditCard>): Promise<CreditCard> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase
      .getClient()
      .from('credit_cards')
      .update(updates)
      .eq('id', id)
      .eq('user_id', currentUser.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCreditCard(id: string): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    const { error } = await this.supabase
      .getClient()
      .from('credit_cards')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUser.id);

    if (error) throw error;
  }
}
