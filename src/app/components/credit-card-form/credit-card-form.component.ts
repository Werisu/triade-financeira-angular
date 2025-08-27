import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CreditCardService } from '../../../services/credit-card.service';
import { CreditCard } from '../../../types';

@Component({
  selector: 'app-credit-card-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './credit-card-form.component.html',
  styleUrls: ['./credit-card-form.component.css'],
})
export class CreditCardFormComponent {
  @Output() creditCardCreated = new EventEmitter<CreditCard>();

  creditCard: Partial<CreditCard> = {
    name: '',
    limit: 0,
    closing_day: 1,
    due_day: 1,
    color: '#3B82F6',
  };

  colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  loading = false;

  constructor(private creditCardService: CreditCardService, private authService: AuthService) {}

  async onSubmit() {
    if (!this.creditCard.name || !this.creditCard.limit) {
      return;
    }

    this.loading = true;
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      const newCreditCard = await this.creditCardService.createCreditCard({
        ...this.creditCard,
        user_id: currentUser.id,
      } as Omit<CreditCard, 'id' | 'created_at'>);

      this.creditCardCreated.emit(newCreditCard);
      this.resetForm();
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
    } finally {
      this.loading = false;
    }
  }

  resetForm() {
    this.creditCard = {
      name: '',
      limit: 0,
      closing_day: 1,
      due_day: 1,
      color: '#3B82F6',
    };
  }

  selectColor(color: string) {
    this.creditCard.color = color;
  }
}
