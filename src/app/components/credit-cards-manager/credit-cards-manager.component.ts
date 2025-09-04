import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CreditCardExpenseService } from '../../../services/credit-card-expense.service';
import { CreditCardService } from '../../../services/credit-card.service';
import { CreditCard } from '../../../types';
import { CreditCardFormComponent } from '../credit-card-form/credit-card-form.component';
import { CreditCardPaymentFormComponent } from '../credit-card-payment-form/credit-card-payment-form.component';

@Component({
  selector: 'app-credit-cards-manager',
  standalone: true,
  imports: [CommonModule, CreditCardFormComponent, CreditCardPaymentFormComponent],
  templateUrl: './credit-cards-manager.component.html',
  styleUrls: ['./credit-cards-manager.component.css'],
})
export class CreditCardsManagerComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  creditCards: CreditCard[] = [];
  loading = false;
  showForm = false;
  showPaymentForm = false;
  selectedCardForPayment?: CreditCard;

  constructor(
    private creditCardService: CreditCardService,
    private creditCardExpenseService: CreditCardExpenseService
  ) {}

  ngOnInit() {
    this.loadCreditCards();
  }

  async loadCreditCards() {
    this.loading = true;
    try {
      this.creditCards = await this.creditCardService.getCreditCards();
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
    } finally {
      this.loading = false;
    }
  }

  onCreditCardCreated(creditCard: CreditCard) {
    this.creditCards.push(creditCard);
    this.showForm = false;
  }

  async deleteCreditCard(id: string) {
    if (confirm('Tem certeza que deseja excluir este cartão?')) {
      try {
        await this.creditCardService.deleteCreditCard(id);
        this.creditCards = this.creditCards.filter((card) => card.id !== id);
      } catch (error) {
        console.error('Erro ao excluir cartão:', error);
      }
    }
  }

  formatLimit(credit_limit: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(credit_limit);
  }

  getDaysUntilClosing(creditCard: CreditCard): number {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let closingDate = new Date(currentYear, currentMonth, creditCard.closing_day);

    if (closingDate < today) {
      closingDate = new Date(currentYear, currentMonth + 1, creditCard.closing_day);
    }

    const diffTime = closingDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysUntilDue(creditCard: CreditCard): number {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let dueDate = new Date(currentYear, currentMonth, creditCard.due_day);

    if (dueDate < today) {
      dueDate = new Date(currentYear, currentMonth + 1, creditCard.due_day);
    }

    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getStatusColor(creditCard: CreditCard): string {
    const daysUntilClosing = this.getDaysUntilClosing(creditCard);
    const daysUntilDue = this.getDaysUntilDue(creditCard);

    if (daysUntilClosing <= 3 || daysUntilDue <= 3) {
      return 'text-red-600';
    } else if (daysUntilClosing <= 7 || daysUntilDue <= 7) {
      return 'text-yellow-600';
    }
    return 'text-green-600';
  }

  async payInvoice(creditCard: CreditCard) {
    this.selectedCardForPayment = creditCard;
    this.showPaymentForm = true;
  }

  onPaymentCreated() {
    this.showPaymentForm = false;
    this.selectedCardForPayment = undefined;
    this.loadCreditCards();
  }

  onPaymentFormClosed() {
    this.showPaymentForm = false;
    this.selectedCardForPayment = undefined;
  }

  async getPendingExpensesTotal(creditCardId: string): Promise<number> {
    try {
      const pendingExpenses = await this.creditCardExpenseService.getPendingExpensesByCard(
        creditCardId
      );
      return pendingExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    } catch (error) {
      console.error('Erro ao calcular total de gastos pendentes:', error);
      return 0;
    }
  }
}
