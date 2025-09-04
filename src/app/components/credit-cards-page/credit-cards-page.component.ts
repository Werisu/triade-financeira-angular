import { Component, OnInit } from '@angular/core';
import { CreditCardExpenseService } from '../../../services/credit-card-expense.service';
import { CreditCardService } from '../../../services/credit-card.service';
import { CreditCard } from '../../../types';
import { CreditCardExpenseFormComponent } from '../credit-card-expense-form/credit-card-expense-form.component';
import { CreditCardExpensesListComponent } from '../credit-card-expenses-list/credit-card-expenses-list.component';
import { CreditCardExpensesManagerComponent } from '../credit-card-expenses-manager/credit-card-expenses-manager.component';
import { CreditCardFormComponent } from '../credit-card-form/credit-card-form.component';
import { CreditCardPaymentFormComponent } from '../credit-card-payment-form/credit-card-payment-form.component';
import { CreditCardsManagerComponent } from '../credit-cards-manager/credit-cards-manager.component';

@Component({
  selector: 'app-credit-cards-page',
  standalone: true,
  imports: [
    CreditCardFormComponent,
    CreditCardsManagerComponent,
    CreditCardExpenseFormComponent,
    CreditCardExpensesListComponent,
    CreditCardExpensesManagerComponent,
    CreditCardPaymentFormComponent,
  ],
  templateUrl: './credit-cards-page.component.html',
  styleUrls: ['./credit-cards-page.component.css'],
})
export class CreditCardsPageComponent implements OnInit {
  creditCards: CreditCard[] = [];
  loading = false;
  showCardForm = false;
  showCardsManager = false;
  showExpenseForm = false;
  showExpensesManager = false;
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

  onCreditCardCreated() {
    this.loadCreditCards();
    this.showCardForm = false;
  }

  onCardFormClosed() {
    this.showCardForm = false;
  }

  onCreditCardExpenseCreated() {
    this.showExpenseForm = false;
  }

  onExpenseFormClosed() {
    this.showExpenseForm = false;
  }

  onCardsManagerClosed() {
    this.showCardsManager = false;
    this.loadCreditCards();
  }

  onExpensesManagerClosed() {
    this.showExpensesManager = false;
  }

  formatLimit(credit_limit: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(credit_limit);
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
}
