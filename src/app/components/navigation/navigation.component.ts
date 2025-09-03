import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
})
export class NavigationComponent {
  @Output() navigate = new EventEmitter<string>();

  menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      description: 'Visão geral financeira',
    },
    {
      id: 'transactions',
      label: 'Transações',
      icon: '💳',
      description: 'Receitas e despesas',
    },
    {
      id: 'credit-cards',
      label: 'Cartões de Crédito',
      icon: '💳',
      description: 'Gerenciar cartões e gastos',
    },
    {
      id: 'bank-accounts',
      label: 'Contas Bancárias',
      icon: '🏦',
      description: 'Saldo em conta',
    },
    {
      id: 'goals',
      label: 'Metas',
      icon: '🎯',
      description: 'Objetivos financeiros',
    },
    {
      id: 'payments',
      label: 'Pagamentos',
      icon: '✅',
      description: 'Gerenciar pagamentos',
    },
  ];

  onNavigate(itemId: string) {
    this.navigate.emit(itemId);
  }
}
