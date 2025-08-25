import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../services/transaction.service';
import { Transaction } from '../../../types';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-card w-full max-w-md rounded-lg shadow-lg border">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-foreground">
              {{ transaction ? 'Editar Transação' : 'Nova Transação' }}
            </h2>
            <button
              (click)="close.emit()"
              class="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Tipo de Transação -->
            <div>
              <label class="block text-sm font-medium text-foreground mb-2"> Tipo </label>
              <div class="flex space-x-2">
                <button
                  type="button"
                  (click)="transactionData.type = 'income'"
                  [class.bg-green-500]="transactionData.type === 'income'"
                  [class.bg-muted]="transactionData.type !== 'income'"
                  class="flex-1 py-2 px-4 rounded-md transition-colors"
                >
                  💰 Receita
                </button>
                <button
                  type="button"
                  (click)="transactionData.type = 'expense'"
                  [class.bg-red-500]="transactionData.type === 'expense'"
                  [class.bg-muted]="transactionData.type !== 'expense'"
                  class="flex-1 py-2 px-4 rounded-md transition-colors"
                >
                  💸 Despesa
                </button>
              </div>
            </div>

            <!-- Valor -->
            <div>
              <label for="amount" class="block text-sm font-medium text-foreground mb-2">
                Valor
              </label>
              <input
                id="amount"
                type="number"
                [(ngModel)]="transactionData.amount"
                name="amount"
                required
                min="0.01"
                step="0.01"
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0,00"
              />
            </div>

            <!-- Categoria -->
            <div>
              <label for="category" class="block text-sm font-medium text-foreground mb-2">
                Categoria
              </label>
              <select
                id="category"
                [(ngModel)]="transactionData.category"
                name="category"
                required
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecione uma categoria</option>
                <option *ngFor="let cat of categories" [value]="cat">
                  {{ cat }}
                </option>
              </select>
            </div>

            <!-- Descrição -->
            <div>
              <label for="description" class="block text-sm font-medium text-foreground mb-2">
                Descrição
              </label>
              <input
                id="description"
                type="text"
                [(ngModel)]="transactionData.description"
                name="description"
                required
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Descrição da transação"
              />
            </div>

            <!-- Data -->
            <div>
              <label for="date" class="block text-sm font-medium text-foreground mb-2">
                Data
              </label>
              <input
                id="date"
                type="date"
                [(ngModel)]="transactionData.date"
                name="date"
                required
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <!-- Mensagens de Erro/Sucesso -->
            <div
              *ngIf="error"
              class="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-md"
            >
              {{ error }}
            </div>

            <div
              *ngIf="success"
              class="text-green-600 text-sm text-center bg-green-100 p-3 rounded-md"
            >
              {{ success }}
            </div>

            <!-- Botões -->
            <div class="flex space-x-3 pt-4">
              <button
                type="button"
                (click)="close.emit()"
                class="flex-1 bg-muted text-muted-foreground py-2 px-4 rounded-md hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="loading || !isFormValid()"
                class="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <span *ngIf="loading" class="inline-block animate-spin mr-2">⟳</span>
                {{ transaction ? 'Atualizar' : 'Adicionar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [],
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
