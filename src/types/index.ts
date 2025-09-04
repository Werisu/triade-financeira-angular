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
  payment_status: 'pending' | 'paid';
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

export interface BankAccount {
  id: string;
  user_id: string;
  name: string;
  bank_name: string;
  account_type: 'checking' | 'savings' | 'investment';
  current_balance: number;
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
  payment_status: 'pending' | 'paid';
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

export interface CreditCardPayment {
  id: string;
  user_id: string;
  credit_card_id: string;
  amount: number;
  payment_date: string;
  description: string;
  created_at: string;
  credit_cards?: {
    name: string;
    color: string;
  };
}

export interface BankTransfer {
  id: string;
  user_id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  description: string | null;
  transfer_date: string;
  created_at: string;
  from_account?: {
    name: string;
    bank_name: string;
    color: string;
  };
  to_account?: {
    name: string;
    bank_name: string;
    color: string;
  };
}

export interface BankMovement {
  id: string;
  user_id: string;
  bank_account_id: string;
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out';
  amount: number;
  description: string | null;
  movement_date: string;
  transfer_id: string | null;
  created_at: string;
  bank_account?: {
    name: string;
    bank_name: string;
    color: string;
  };
  transfer?: {
    from_account: {
      name: string;
      bank_name: string;
    };
    to_account: {
      name: string;
      bank_name: string;
    };
  };
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}

// Exportar tipos do Supabase
export * from './supabase';
