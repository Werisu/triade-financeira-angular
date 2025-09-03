export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string | null;
  date: string;
  created_at: string;
}

export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  credit_limit: number;
  closing_day: number;
  due_day: number;
  color: string;
  created_at: string;
}

export interface CreditCardExpense {
  id: string;
  user_id: string;
  credit_card_id: string;
  description: string;
  amount: number;
  category: string;
  tags: string[];
  installment_number?: number;
  total_installments?: number;
  date: string;
  created_at: string;
  credit_cards?: {
    name: string;
    color: string;
  };
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target: number;
  current: number;
  type: 'emergency' | 'investment' | 'recovery' | 'custom';
  created_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}

// Exportar tipos do Supabase
export * from './supabase';
