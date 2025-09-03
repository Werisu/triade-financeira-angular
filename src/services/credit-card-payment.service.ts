import { Injectable } from '@angular/core';
import { CreditCardPayment } from '../types';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class CreditCardPaymentService {
  constructor(private supabase: SupabaseService, private authService: AuthService) {}

  async getCreditCardPayments(creditCardId?: string): Promise<CreditCardPayment[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    let query = this.supabase
      .getClient()
      .from('credit_card_payments')
      .select(
        `
        *,
        credit_cards (
          name,
          color
        )
      `
      )
      .eq('user_id', currentUser.id)
      .order('payment_date', { ascending: false });

    if (creditCardId) {
      query = query.eq('credit_card_id', creditCardId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async createCreditCardPayment(
    payment: Omit<CreditCardPayment, 'id' | 'created_at'>
  ): Promise<CreditCardPayment> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase
      .getClient()
      .from('credit_card_payments')
      .insert({
        ...payment,
        user_id: currentUser.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCreditCardPayment(
    id: string,
    updates: Partial<CreditCardPayment>
  ): Promise<CreditCardPayment> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase
      .getClient()
      .from('credit_card_payments')
      .update(updates)
      .eq('id', id)
      .eq('user_id', currentUser.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCreditCardPayment(id: string): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    const { error } = await this.supabase
      .getClient()
      .from('credit_card_payments')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUser.id);

    if (error) throw error;
  }

  async getPaymentsByMonth(year: number, month: number): Promise<CreditCardPayment[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDayOfMonth
      .toString()
      .padStart(2, '0')}`;

    const { data, error } = await this.supabase
      .getClient()
      .from('credit_card_payments')
      .select(
        `
        *,
        credit_cards (
          name,
          color
        )
      `
      )
      .eq('user_id', currentUser.id)
      .gte('payment_date', startDate)
      .lte('payment_date', endDate)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async payFullInvoice(
    creditCardId: string,
    amount: number,
    paymentDate: string,
    description: string
  ): Promise<CreditCardPayment> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase
      .getClient()
      .from('credit_card_payments')
      .insert({
        user_id: currentUser.id,
        credit_card_id: creditCardId,
        amount: amount,
        payment_date: paymentDate,
        description: description,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
