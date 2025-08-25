export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}

// Exportar tipos do Supabase
export * from './supabase';
