import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/dashboard-simple/dashboard-simple.component').then(
        (m) => m.DashboardSimpleComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'auth',
    component: AuthComponent,
    canActivate: [NoAuthGuard],
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./components/transactions-page/transactions-page.component').then(
        (m) => m.TransactionsPageComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'credit-cards',
    loadComponent: () =>
      import('./components/credit-cards-page/credit-cards-page.component').then(
        (m) => m.CreditCardsPageComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'bank-accounts',
    loadComponent: () =>
      import('./components/bank-accounts-page/bank-accounts-page.component').then(
        (m) => m.BankAccountsPageComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'goals',
    loadComponent: () =>
      import('./components/goal-form/goal-form.component').then((m) => m.GoalFormComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'payments',
    loadComponent: () =>
      import('./components/payment-manager/payment-manager.component').then(
        (m) => m.PaymentManagerComponent
      ),
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '' },
];
