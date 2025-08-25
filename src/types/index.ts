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
