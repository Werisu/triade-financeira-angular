import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ResetFinancialDataService } from '../../../services/reset-financial-data.service';

interface FinancialDataStats {
  bankAccounts: number;
  creditCards: number;
  transactions: number;
  creditCardExpenses: number;
  creditCardPayments: number;
  bankTransfers: number;
  bankMovements: number;
  goals: number;
}

@Component({
  selector: 'app-reset-financial-data',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-financial-data.component.html',
  styleUrls: ['./reset-financial-data.component.css'],
})
export class ResetFinancialDataComponent implements OnInit {
  stats: FinancialDataStats | null = null;
  loading = false;
  resetting = false;
  error: string | null = null;
  success = false;

  // Confirmação de segurança
  confirmationText = '';
  requiredConfirmationText = 'ZERAR TODOS OS DADOS';
  isConfirmationValid = false;

  constructor(private resetService: ResetFinancialDataService, private router: Router) {}

  ngOnInit(): void {
    this.loadStats();
  }

  async loadStats(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      this.stats = await this.resetService.getFinancialDataStats();
    } catch (error: any) {
      this.error = `Erro ao carregar estatísticas: ${error.message}`;
    } finally {
      this.loading = false;
    }
  }

  onConfirmationTextChange(): void {
    this.isConfirmationValid = this.confirmationText === this.requiredConfirmationText;
  }

  async resetAllData(): Promise<void> {
    if (!this.isConfirmationValid) {
      this.error = 'Por favor, digite exatamente o texto de confirmação.';
      return;
    }

    this.resetting = true;
    this.error = null;
    this.success = false;

    try {
      const result = await this.resetService.resetAllFinancialData();

      if (result.success) {
        this.success = true;
        // Recarregar estatísticas após o reset
        await this.loadStats();
        // Limpar confirmação
        this.confirmationText = '';
        this.isConfirmationValid = false;
      } else {
        this.error = result.error || 'Erro desconhecido ao resetar dados.';
      }
    } catch (error: any) {
      this.error = `Erro ao resetar dados: ${error.message}`;
    } finally {
      this.resetting = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  getTotalItems(): number {
    if (!this.stats) return 0;

    return (
      this.stats.bankAccounts +
      this.stats.creditCards +
      this.stats.transactions +
      this.stats.creditCardExpenses +
      this.stats.creditCardPayments +
      this.stats.bankTransfers +
      this.stats.bankMovements +
      this.stats.goals
    );
  }
}
