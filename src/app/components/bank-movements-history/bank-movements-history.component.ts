import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BankTransferService } from '../../../services/bank-transfer.service';
import { BankMovement, BankTransfer } from '../../../types';

@Component({
  selector: 'app-bank-movements-history',
  standalone: true,
  imports: [],
  templateUrl: './bank-movements-history.component.html',
  styleUrls: ['./bank-movements-history.component.css'],
})
export class BankMovementsHistoryComponent implements OnInit {
  @Input() accountId?: string; // Se fornecido, mostra apenas movimentações desta conta
  @Output() close = new EventEmitter<void>();

  movements: BankMovement[] = [];
  transfers: BankTransfer[] = [];
  loading = false;
  selectedTab: 'movements' | 'transfers' = 'movements';

  constructor(private bankTransferService: BankTransferService) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      if (this.accountId) {
        // Carregar movimentações de uma conta específica
        this.movements = await this.bankTransferService.getMovementsByAccount(this.accountId);
        // Carregar transferências relacionadas a esta conta
        const allTransfers = await this.bankTransferService.getTransfersAsync();
        this.transfers = allTransfers.filter(
          (t) => t.from_account_id === this.accountId || t.to_account_id === this.accountId
        );
      } else {
        // Carregar todas as movimentações e transferências
        this.movements = await this.bankTransferService.getMovementsAsync();
        this.transfers = await this.bankTransferService.getTransfersAsync();
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      this.loading = false;
    }
  }

  getMovementIcon(type: string): string {
    const icons = {
      deposit: '💰',
      withdrawal: '💸',
      transfer_in: '📥',
      transfer_out: '📤',
    };
    return icons[type as keyof typeof icons] || '💳';
  }

  getMovementTypeLabel(type: string): string {
    const labels = {
      deposit: 'Depósito',
      withdrawal: 'Saque',
      transfer_in: 'Transferência Recebida',
      transfer_out: 'Transferência Enviada',
    };
    return labels[type as keyof typeof labels] || type;
  }

  getMovementColor(type: string): string {
    const colors = {
      deposit: 'text-success-600',
      withdrawal: 'text-destructive-600',
      transfer_in: 'text-primary-600',
      transfer_out: 'text-warning-600',
    };
    return colors[type as keyof typeof colors] || 'text-muted-foreground';
  }

  getAmountSign(type: string): string {
    return type === 'deposit' || type === 'transfer_in' ? '+' : '-';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async deleteTransfer(transferId: string) {
    if (confirm('Tem certeza que deseja excluir esta transferência?')) {
      try {
        await this.bankTransferService.deleteTransfer(transferId);
        await this.loadData();
      } catch (error) {
        console.error('Erro ao deletar transferência:', error);
        alert('Erro ao deletar transferência. Tente novamente.');
      }
    }
  }

  async deleteMovement(movementId: string) {
    if (confirm('Tem certeza que deseja excluir esta movimentação?')) {
      try {
        await this.bankTransferService.deleteMovement(movementId);
        await this.loadData();
      } catch (error) {
        console.error('Erro ao deletar movimentação:', error);
        alert('Erro ao deletar movimentação. Tente novamente.');
      }
    }
  }

  getFilteredMovements(): BankMovement[] {
    return this.movements.filter((movement) => {
      // Se não é uma transferência, mostrar sempre
      if (movement.type === 'deposit' || movement.type === 'withdrawal') {
        return true;
      }
      // Se é uma transferência e não temos accountId específico, mostrar sempre
      if (!this.accountId) {
        return true;
      }
      // Se é uma transferência e temos accountId específico, mostrar apenas se for desta conta
      return movement.bank_account_id === this.accountId;
    });
  }

  getFilteredTransfers(): BankTransfer[] {
    if (!this.accountId) {
      return this.transfers;
    }
    return this.transfers.filter(
      (t) => t.from_account_id === this.accountId || t.to_account_id === this.accountId
    );
  }
}
