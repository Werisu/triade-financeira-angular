import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'auth',
    component: AuthComponent,
    canActivate: [NoAuthGuard],
  },
  {
    path: 'credit-cards',
    loadComponent: () =>
      import('./components/credit-cards-manager/credit-cards-manager.component').then(
        (m) => m.CreditCardsManagerComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'credit-card-expenses',
    loadComponent: () =>
      import('./components/credit-card-expense-form/credit-card-expense-form.component').then(
        (m) => m.CreditCardExpenseFormComponent
      ),
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '' },
];
