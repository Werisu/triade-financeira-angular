import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CreditCardExpenseService } from '../../../services/credit-card-expense.service';
import { CreditCardService } from '../../../services/credit-card.service';
import { CreditCard, CreditCardExpense } from '../../../types';

@Component({
  selector: 'app-credit-card-expense-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './credit-card-expense-form.component.html',
  styleUrls: ['./credit-card-expense-form.component.css'],
})
export class CreditCardExpenseFormComponent implements OnInit {
  @Input() selectedCreditCardId?: string;
  @Output() expenseCreated = new EventEmitter<CreditCardExpense>();
  @Output() close = new EventEmitter<void>();

  expense: Partial<CreditCardExpense> = {
    description: '',
    amount: 0,
    category: '',
    tags: [],
    installment_number: undefined,
    total_installments: undefined,
    date: new Date().toISOString().split('T')[0],
    payment_status: 'pending',
  };

  creditCards: CreditCard[] = [];
  newTag = '';
  loading = false;

  categories = [
    'Alimentação',
    'Transporte',
    'Saúde',
    'Educação',
    'Lazer',
    'Vestuário',
    'Casa',
    'Tecnologia',
    'Serviços',
    'Outros',
  ];

  constructor(
    private expenseService: CreditCardExpenseService,
    private creditCardService: CreditCardService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await this.loadCreditCards();
    if (this.selectedCreditCardId) {
      this.expense.credit_card_id = this.selectedCreditCardId;
    }
  }

  async loadCreditCards() {
    try {
      this.creditCards = await this.creditCardService.getCreditCards();
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
    }
  }

  addTag() {
    if (this.newTag.trim() && !this.expense.tags?.includes(this.newTag.trim())) {
      if (!this.expense.tags) this.expense.tags = [];
      this.expense.tags.push(this.newTag.trim());
      this.newTag = '';
    }
  }

  removeTag(tag: string) {
    if (this.expense.tags) {
      this.expense.tags = this.expense.tags.filter((t) => t !== tag);
    }
  }

  async onSubmit() {
    if (!this.expense.description || !this.expense.amount || !this.expense.credit_card_id) {
      return;
    }

    this.loading = true;
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      const newExpense = await this.expenseService.createCreditCardExpense({
        ...this.expense,
        user_id: currentUser.id,
      } as Omit<CreditCardExpense, 'id' | 'created_at'>);

      this.expenseCreated.emit(newExpense);
      this.resetForm();
    } catch (error) {
      console.error('Erro ao criar gasto:', error);
    } finally {
      this.loading = false;
    }
  }

  resetForm() {
    this.expense = {
      description: '',
      amount: 0,
      category: '',
      tags: [],
      installment_number: undefined,
      total_installments: undefined,
      date: new Date().toISOString().split('T')[0],
      payment_status: 'pending',
    };
    if (this.selectedCreditCardId) {
      this.expense.credit_card_id = this.selectedCreditCardId;
    }
  }

  get isInstallment() {
    return this.expense.total_installments && this.expense.total_installments > 1;
  }
}
