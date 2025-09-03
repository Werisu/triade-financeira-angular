import { Injectable } from '@angular/core';
import { CreditCardExpense } from '../types';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class CreditCardExpenseService {
  constructor(private supabase: SupabaseService, private authService: AuthService) {}

  async getCreditCardExpenses(creditCardId?: string): Promise<CreditCardExpense[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    let query = this.supabase
      .getClient()
      .from('credit_card_expenses')
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
      .order('date', { ascending: false });

    if (creditCardId) {
      query = query.eq('credit_card_id', creditCardId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async createCreditCardExpense(
    expense: Omit<CreditCardExpense, 'id' | 'created_at'>
  ): Promise<CreditCardExpense> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    // Validar se a data é válida antes de inserir
    const date = new Date(expense.date);
    if (isNaN(date.getTime())) {
      throw new Error(`Data inválida: ${expense.date}`);
    }

    console.log(`Criando despesa com data: ${expense.date}`);

    const { data, error } = await this.supabase
      .getClient()
      .from('credit_card_expenses')
      .insert({
        ...expense,
        user_id: currentUser.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCreditCardExpense(
    id: string,
    updates: Partial<CreditCardExpense>
  ): Promise<CreditCardExpense> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase
      .getClient()
      .from('credit_card_expenses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', currentUser.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCreditCardExpense(id: string): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    const { error } = await this.supabase
      .getClient()
      .from('credit_card_expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUser.id);

    if (error) throw error;
  }

  async getExpensesByMonth(year: number, month: number): Promise<CreditCardExpense[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;

    // Calcular o último dia do mês corretamente
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDayOfMonth
      .toString()
      .padStart(2, '0')}`;

    console.log(`Consultando gastos de ${startDate} até ${endDate}`);

    const { data, error } = await this.supabase
      .getClient()
      .from('credit_card_expenses')
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
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
