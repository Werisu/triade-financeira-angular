import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../services/transaction.service';
import { Transaction } from '../../../types';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css'],
})
export class TransactionFormComponent {
  @Input() transaction: Transaction | null = null;
  @Input() userId: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Transaction>();

  private transactionService = inject(TransactionService);

  loading = false;
  error = '';
  success = '';

  transactionData = {
    type: 'expense' as 'income' | 'expense',
    amount: 0,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  };

  categories = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Trabalho',
    'Investimentos',
    'Outros',
  ];

  ngOnInit() {
    if (this.transaction) {
      // Modo edição
      this.transactionData = {
        type: this.transaction.type,
        amount: this.transaction.amount,
        category: this.transaction.category,
        description: this.transaction.description || '',
        date: this.transaction.date,
      };
    }
  }

  isFormValid(): boolean {
    return (
      this.transactionData.amount > 0 &&
      this.transactionData.category.trim() !== '' &&
      this.transactionData.description.trim() !== '' &&
      this.transactionData.date !== ''
    );
  }

  async onSubmit() {
    if (!this.isFormValid()) {
      this.error = 'Por favor, preencha todos os campos corretamente';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      const transactionData = {
        user_id: this.userId,
        type: this.transactionData.type,
        amount: this.transactionData.amount,
        category: this.transactionData.category,
        description: this.transactionData.description,
        date: this.transactionData.date,
      };

      if (this.transaction) {
        // TODO: Implementar atualização de transação
        console.log('Atualizar transação:', transactionData);
      } else {
        const result = await this.transactionService.addTransaction(transactionData);

        if (result.success) {
          this.success = 'Transação adicionada com sucesso!';
          setTimeout(() => {
            this.close.emit();
          }, 1500);
        } else {
          this.error = result.error || 'Erro ao adicionar transação';
        }
      }
    } catch (error: any) {
      this.error = error.message || 'Erro inesperado';
    } finally {
      this.loading = false;
    }
  }
}
