import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BankMovement, BankTransfer } from '../types';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class BankTransferService {
  private transfersSubject = new BehaviorSubject<BankTransfer[]>([]);
  private movementsSubject = new BehaviorSubject<BankMovement[]>([]);

  public transfers$ = this.transfersSubject.asObservable();
  public movements$ = this.movementsSubject.asObservable();

  constructor(private supabaseService: SupabaseService, private authService: AuthService) {}

  // Transferências
  async createTransfer(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description?: string,
    transferDate?: string
  ): Promise<BankTransfer> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('bank_transfers')
      .insert({
        user_id: currentUser.id,
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        amount,
        description,
        transfer_date: transferDate || new Date().toISOString().split('T')[0],
      })
      .select(
        `
        *,
        from_account:bank_accounts!from_account_id(name, bank_name, color),
        to_account:bank_accounts!to_account_id(name, bank_name, color)
      `
      )
      .single();

    if (error) {
      console.error('Erro ao criar transferência:', error);
      throw error;
    }

    // Atualizar lista local
    await this.loadTransfers(currentUser.id);
    await this.loadMovements(currentUser.id);

    return data;
  }

  async loadTransfers(userId: string): Promise<void> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('bank_transfers')
      .select(
        `
        *,
        from_account:bank_accounts!from_account_id(name, bank_name, color),
        to_account:bank_accounts!to_account_id(name, bank_name, color)
      `
      )
      .eq('user_id', userId)
      .order('transfer_date', { ascending: false });

    if (error) {
      console.error('Erro ao carregar transferências:', error);
      throw error;
    }

    this.transfersSubject.next(data || []);
  }

  getTransfers(): BankTransfer[] {
    return this.transfersSubject.value;
  }

  async getTransfersAsync(): Promise<BankTransfer[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('Usuário não autenticado');
      return [];
    }

    // Se não há transferências carregadas, carrega do banco
    if (this.transfersSubject.value.length === 0) {
      await this.loadTransfers(currentUser.id);
    }

    return this.transfersSubject.value;
  }

  // Movimentações
  async createMovement(
    bankAccountId: string,
    type: 'deposit' | 'withdrawal',
    amount: number,
    description?: string,
    movementDate?: string
  ): Promise<BankMovement> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('bank_movements')
      .insert({
        user_id: currentUser.id,
        bank_account_id: bankAccountId,
        type,
        amount,
        description,
        movement_date: movementDate || new Date().toISOString().split('T')[0],
      })
      .select(
        `
        *,
        bank_account:bank_accounts(name, bank_name, color)
      `
      )
      .single();

    if (error) {
      console.error('Erro ao criar movimentação:', error);
      throw error;
    }

    // Atualizar lista local
    await this.loadMovements(currentUser.id);

    return data;
  }

  async loadMovements(userId: string): Promise<void> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('bank_movements')
      .select(
        `
        *,
        bank_account:bank_accounts(name, bank_name, color),
        transfer:bank_transfers(
          from_account:bank_accounts!from_account_id(name, bank_name),
          to_account:bank_accounts!to_account_id(name, bank_name)
        )
      `
      )
      .eq('user_id', userId)
      .order('movement_date', { ascending: false });

    if (error) {
      console.error('Erro ao carregar movimentações:', error);
      throw error;
    }

    this.movementsSubject.next(data || []);
  }

  getMovements(): BankMovement[] {
    return this.movementsSubject.value;
  }

  async getMovementsAsync(): Promise<BankMovement[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('Usuário não autenticado');
      return [];
    }

    // Se não há movimentações carregadas, carrega do banco
    if (this.movementsSubject.value.length === 0) {
      await this.loadMovements(currentUser.id);
    }

    return this.movementsSubject.value;
  }

  async getMovementsByAccount(accountId: string): Promise<BankMovement[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('Usuário não autenticado');
      return [];
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('bank_movements')
      .select(
        `
        *,
        bank_account:bank_accounts(name, bank_name, color),
        transfer:bank_transfers(
          from_account:bank_accounts!from_account_id(name, bank_name),
          to_account:bank_accounts!to_account_id(name, bank_name)
        )
      `
      )
      .eq('user_id', currentUser.id)
      .eq('bank_account_id', accountId)
      .order('movement_date', { ascending: false });

    if (error) {
      console.error('Erro ao carregar movimentações da conta:', error);
      throw error;
    }

    return data || [];
  }

  async deleteTransfer(transferId: string): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    const { error } = await this.supabaseService
      .getClient()
      .from('bank_transfers')
      .delete()
      .eq('id', transferId)
      .eq('user_id', currentUser.id);

    if (error) {
      console.error('Erro ao deletar transferência:', error);
      throw error;
    }

    // Recarregar dados
    await this.loadTransfers(currentUser.id);
    await this.loadMovements(currentUser.id);
  }

  async deleteMovement(movementId: string): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    const { error } = await this.supabaseService
      .getClient()
      .from('bank_movements')
      .delete()
      .eq('id', movementId)
      .eq('user_id', currentUser.id);

    if (error) {
      console.error('Erro ao deletar movimentação:', error);
      throw error;
    }

    // Recarregar dados
    await this.loadMovements(currentUser.id);
  }

  // Estatísticas
  getTransferStats(): {
    totalTransfers: number;
    totalAmount: number;
    thisMonth: number;
    lastTransfer: BankTransfer | null;
  } {
    const transfers = this.getTransfers();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthTransfers = transfers.filter((transfer) => {
      const transferDate = new Date(transfer.transfer_date);
      return transferDate.getMonth() === currentMonth && transferDate.getFullYear() === currentYear;
    });

    return {
      totalTransfers: transfers.length,
      totalAmount: transfers.reduce((sum, transfer) => sum + transfer.amount, 0),
      thisMonth: thisMonthTransfers.length,
      lastTransfer: transfers[0] || null,
    };
  }

  getMovementStats(): {
    totalMovements: number;
    totalDeposits: number;
    totalWithdrawals: number;
    thisMonth: number;
    lastMovement: BankMovement | null;
  } {
    const movements = this.getMovements();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthMovements = movements.filter((movement) => {
      const movementDate = new Date(movement.movement_date);
      return movementDate.getMonth() === currentMonth && movementDate.getFullYear() === currentYear;
    });

    const deposits = movements.filter((m) => m.type === 'deposit' || m.type === 'transfer_in');
    const withdrawals = movements.filter(
      (m) => m.type === 'withdrawal' || m.type === 'transfer_out'
    );

    return {
      totalMovements: movements.length,
      totalDeposits: deposits.reduce((sum, m) => sum + m.amount, 0),
      totalWithdrawals: withdrawals.reduce((sum, m) => sum + m.amount, 0),
      thisMonth: thisMonthMovements.length,
      lastMovement: movements[0] || null,
    };
  }
}
