import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
})
export class NavigationComponent {
  menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      description: 'Visão geral financeira',
      route: '/',
    },
    {
      id: 'transactions',
      label: 'Transações',
      icon: '💳',
      description: 'Receitas e despesas',
      route: '/transactions',
    },
    {
      id: 'credit-cards',
      label: 'Cartões de Crédito',
      icon: '💳',
      description: 'Gerenciar cartões e gastos',
      route: '/credit-cards',
    },
    {
      id: 'bank-accounts',
      label: 'Contas Bancárias',
      icon: '🏦',
      description: 'Saldo em conta',
      route: '/bank-accounts',
    },
    {
      id: 'goals',
      label: 'Metas',
      icon: '🎯',
      description: 'Objetivos financeiros',
      route: '/goals',
    },
    {
      id: 'payments',
      label: 'Pagamentos',
      icon: '✅',
      description: 'Gerenciar pagamentos',
      route: '/payments',
    },
    {
      id: 'reset-data',
      label: 'Reset de Dados',
      icon: '⚠️',
      description: 'Zerar todos os dados financeiros',
      route: '/reset-data',
      isDangerous: true,
    },
  ];
}
