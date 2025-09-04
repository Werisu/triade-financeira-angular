import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Subject } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { CreditCardExpenseService } from '../../../services/credit-card-expense.service';
import { GoalService } from '../../../services/goal.service';
import { TransactionService } from '../../../services/transaction.service';
import { CreditCardExpense, Goal, Transaction } from '../../../types';

// Registrar todos os controladores do Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-charts',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard-charts.component.html',
  styleUrls: ['./dashboard-charts.component.css'],
})
export class DashboardChartsComponent implements OnInit, OnDestroy {
  private transactionService = inject(TransactionService);
  private creditCardExpenseService = inject(CreditCardExpenseService);
  private goalService = inject(GoalService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  transactions: Transaction[] = [];
  creditCardExpenses: CreditCardExpense[] = [];
  goals: Goal[] = [];
  loading = true;

  // Gráfico de Pizza - Categorias de Gastos
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const total =
              context.dataset.data.reduce((a: number, b: any) => {
                const numA = typeof a === 'number' ? a : 0;
                const numB = typeof b === 'number' ? b : 0;
                return numA + numB;
              }, 0) || 1;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: R$ ${value.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })} (${percentage}%)`;
          },
        },
      },
    },
  };

  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF',
          '#4BC0C0',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  public pieChartType: ChartType = 'pie';

  // Gráfico de Linha - Evolução Temporal
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Mês',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Valor (R$)',
        },
        ticks: {
          callback: function (value) {
            return 'R$ ' + value.toLocaleString('pt-BR');
          },
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
          },
        },
      },
    },
  };

  public lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Receitas',
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        data: [],
        label: 'Despesas',
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  public lineChartType: ChartType = 'line';

  // Gráfico de Barras - Comparativo Mensal
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Mês',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Valor (R$)',
        },
        ticks: {
          callback: function (value) {
            return 'R$ ' + value.toLocaleString('pt-BR');
          },
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
          },
        },
      },
    },
  };

  public barChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Saldo Mensal',
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3B82F6',
        borderWidth: 1,
      },
    ],
  };

  public barChartType: ChartType = 'bar';

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadData() {
    this.loading = true;
    try {
      // Carregar dados
      this.transactions = await this.transactionService.getTransactionsAsync();
      this.creditCardExpenses = await this.creditCardExpenseService.getCreditCardExpenses();

      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        await this.goalService.loadGoals(currentUser.id);
        this.goals = this.goalService.getGoals();
      }

      // Atualizar gráficos
      this.updatePieChart();
      this.updateLineChart();
      this.updateBarChart();
    } catch (error) {
      console.error('Erro ao carregar dados para gráficos:', error);
    } finally {
      this.loading = false;
    }
  }

  private updatePieChart() {
    const categoryTotals = new Map<string, number>();

    // Processar transações
    const expenseTransactions = this.transactions.filter((t) => t.type === 'expense');

    expenseTransactions.forEach((transaction) => {
      const current = categoryTotals.get(transaction.category) || 0;
      categoryTotals.set(transaction.category, current + transaction.amount);
    });

    // Processar despesas de cartão de crédito (incluir todas, não apenas não pagas)

    this.creditCardExpenses.forEach((expense) => {
      const current = categoryTotals.get(expense.category) || 0;
      categoryTotals.set(expense.category, current + expense.amount);
    });

    // Converter para arrays
    const labels = Array.from(categoryTotals.keys());
    const data = Array.from(categoryTotals.values());

    this.pieChartData = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#FF6384',
            '#C9CBCF',
            '#4BC0C0',
          ].slice(0, labels.length),
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    };
  }

  private updateLineChart() {
    const last6Months = this.getLast6Months();
    const monthlyData = new Map<string, { income: number; expense: number }>();

    // Inicializar dados mensais
    last6Months.forEach((month) => {
      monthlyData.set(month, { income: 0, expense: 0 });
    });

    // Processar transações
    this.transactions.forEach((transaction) => {
      const month = this.getMonthKey(transaction.date);
      if (monthlyData.has(month)) {
        const data = monthlyData.get(month)!;
        if (transaction.type === 'income') {
          data.income += transaction.amount;
        } else {
          data.expense += transaction.amount;
        }
        monthlyData.set(month, data);
      }
    });

    // Processar despesas de cartão de crédito
    this.creditCardExpenses
      .filter((expense) => expense.payment_status !== 'paid')
      .forEach((expense) => {
        const month = this.getMonthKey(expense.date);
        if (monthlyData.has(month)) {
          const data = monthlyData.get(month)!;
          data.expense += expense.amount;
          monthlyData.set(month, data);
        }
      });

    // Converter para arrays
    const labels = last6Months.map((month) => this.formatMonthLabel(month));
    const incomeData = last6Months.map((month) => monthlyData.get(month)!.income);
    const expenseData = last6Months.map((month) => monthlyData.get(month)!.expense);

    this.lineChartData = {
      labels,
      datasets: [
        {
          data: incomeData,
          label: 'Receitas',
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          data: expenseData,
          label: 'Despesas',
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }

  private updateBarChart() {
    const last6Months = this.getLast6Months();
    const monthlyBalance = new Map<string, number>();

    // Inicializar saldos mensais
    last6Months.forEach((month) => {
      monthlyBalance.set(month, 0);
    });

    // Calcular saldo mensal (receitas - despesas)
    this.transactions.forEach((transaction) => {
      const month = this.getMonthKey(transaction.date);
      if (monthlyBalance.has(month)) {
        const current = monthlyBalance.get(month)!;
        const amount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
        monthlyBalance.set(month, current + amount);
      }
    });

    // Subtrair despesas de cartão de crédito
    this.creditCardExpenses
      .filter((expense) => expense.payment_status !== 'paid')
      .forEach((expense) => {
        const month = this.getMonthKey(expense.date);
        if (monthlyBalance.has(month)) {
          const current = monthlyBalance.get(month)!;
          monthlyBalance.set(month, current - expense.amount);
        }
      });

    // Converter para arrays
    const labels = last6Months.map((month) => this.formatMonthLabel(month));
    const balanceData = last6Months.map((month) => monthlyBalance.get(month)!);

    this.barChartData = {
      labels,
      datasets: [
        {
          data: balanceData,
          label: 'Saldo Mensal',
          backgroundColor: balanceData.map((value) =>
            value >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
          ),
          borderColor: balanceData.map((value) => (value >= 0 ? '#10B981' : '#EF4444')),
          borderWidth: 1,
        },
      ],
    };
  }

  private getLast6Months(): string[] {
    const months: string[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    }

    return months;
  }

  private getMonthKey(dateString: string): string {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private formatMonthLabel(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  }
}
