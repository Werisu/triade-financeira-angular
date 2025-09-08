import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class ResetFinancialDataService {
  constructor(private supabase: SupabaseService, private authService: AuthService) {}

  /**
   * Zera todos os dados financeiros do usuário atual
   * ATENÇÃO: Esta operação é irreversível!
   */
  async resetAllFinancialData(): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      const userId = currentUser.id;

      // Ordem de exclusão respeitando as dependências das foreign keys
      // 1. Primeiro, excluir movimentações bancárias (dependem de transferências)
      await this.deleteBankMovements(userId);

      // 2. Excluir transferências bancárias
      await this.deleteBankTransfers(userId);

      // 3. Excluir pagamentos de cartão de crédito
      await this.deleteCreditCardPayments(userId);

      // 4. Excluir despesas de cartão de crédito
      await this.deleteCreditCardExpenses(userId);

      // 5. Excluir transações
      await this.deleteTransactions(userId);

      // 6. Excluir metas
      await this.deleteGoals(userId);

      // 7. Excluir cartões de crédito
      await this.deleteCreditCards(userId);

      // 8. Por último, zerar saldos das contas bancárias (não excluir as contas)
      await this.resetBankAccountBalances(userId);

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao resetar dados financeiros:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Exclui todas as movimentações bancárias do usuário
   */
  private async deleteBankMovements(userId: string): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .from('bank_movements')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Erro ao excluir movimentações bancárias: ${error.message}`);
    }
  }

  /**
   * Exclui todas as transferências bancárias do usuário
   */
  private async deleteBankTransfers(userId: string): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .from('bank_transfers')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Erro ao excluir transferências bancárias: ${error.message}`);
    }
  }

  /**
   * Exclui todos os pagamentos de cartão de crédito do usuário
   */
  private async deleteCreditCardPayments(userId: string): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .from('credit_card_payments')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Erro ao excluir pagamentos de cartão: ${error.message}`);
    }
  }

  /**
   * Exclui todas as despesas de cartão de crédito do usuário
   */
  private async deleteCreditCardExpenses(userId: string): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .from('credit_card_expenses')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Erro ao excluir despesas de cartão: ${error.message}`);
    }
  }

  /**
   * Exclui todas as transações do usuário
   */
  private async deleteTransactions(userId: string): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .from('transactions')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Erro ao excluir transações: ${error.message}`);
    }
  }

  /**
   * Exclui todas as metas do usuário
   */
  private async deleteGoals(userId: string): Promise<void> {
    const { error } = await this.supabase.getClient().from('goals').delete().eq('user_id', userId);

    if (error) {
      throw new Error(`Erro ao excluir metas: ${error.message}`);
    }
  }

  /**
   * Exclui todos os cartões de crédito do usuário
   */
  private async deleteCreditCards(userId: string): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .from('credit_cards')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Erro ao excluir cartões de crédito: ${error.message}`);
    }
  }

  /**
   * Zera os saldos de todas as contas bancárias do usuário
   */
  private async resetBankAccountBalances(userId: string): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .from('bank_accounts')
      .update({ current_balance: 0 })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Erro ao zerar saldos das contas: ${error.message}`);
    }
  }

  /**
   * Obtém estatísticas dos dados financeiros antes do reset
   */
  async getFinancialDataStats(): Promise<{
    bankAccounts: number;
    creditCards: number;
    transactions: number;
    creditCardExpenses: number;
    creditCardPayments: number;
    bankTransfers: number;
    bankMovements: number;
    goals: number;
  }> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      const userId = currentUser.id;

      // Executar todas as consultas em paralelo
      const [
        bankAccountsResult,
        creditCardsResult,
        transactionsResult,
        creditCardExpensesResult,
        creditCardPaymentsResult,
        bankTransfersResult,
        bankMovementsResult,
        goalsResult,
      ] = await Promise.all([
        this.supabase
          .getClient()
          .from('bank_accounts')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        this.supabase
          .getClient()
          .from('credit_cards')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        this.supabase
          .getClient()
          .from('transactions')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        this.supabase
          .getClient()
          .from('credit_card_expenses')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        this.supabase
          .getClient()
          .from('credit_card_payments')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        this.supabase
          .getClient()
          .from('bank_transfers')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        this.supabase
          .getClient()
          .from('bank_movements')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        this.supabase
          .getClient()
          .from('goals')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
      ]);

      return {
        bankAccounts: bankAccountsResult.count || 0,
        creditCards: creditCardsResult.count || 0,
        transactions: transactionsResult.count || 0,
        creditCardExpenses: creditCardExpensesResult.count || 0,
        creditCardPayments: creditCardPaymentsResult.count || 0,
        bankTransfers: bankTransfersResult.count || 0,
        bankMovements: bankMovementsResult.count || 0,
        goals: goalsResult.count || 0,
      };
    } catch (error: any) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }
}
