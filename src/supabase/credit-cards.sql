-- Criar tabela de cartões de crédito
CREATE TABLE
IF NOT EXISTS credit_cards
(
  id UUID DEFAULT gen_random_uuid
() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users
(id) ON
DELETE CASCADE,
  name TEXT
NOT NULL,
  limit DECIMAL
(10,2) NOT NULL,
  closing_day INTEGER NOT NULL CHECK
(closing_day >= 1 AND closing_day <= 31),
  due_day INTEGER NOT NULL CHECK
(due_day >= 1 AND due_day <= 31),
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW
(),
  updated_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW
()
);

-- Criar tabela de gastos com cartão de crédito
CREATE TABLE
IF NOT EXISTS credit_card_expenses
(
  id UUID DEFAULT gen_random_uuid
() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users
(id) ON
DELETE CASCADE,
  credit_card_id UUID
NOT NULL REFERENCES credit_cards
(id) ON
DELETE CASCADE,
  description TEXT
NOT NULL,
  amount DECIMAL
(10,2) NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  installment_number INTEGER CHECK
(installment_number >= 1),
  total_installments INTEGER CHECK
(total_installments >= 1),
  date DATE NOT NULL,
  created_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW
(),
  updated_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW
()
);

-- Criar índices para melhor performance
CREATE INDEX
IF NOT EXISTS idx_credit_cards_user_id ON credit_cards
(user_id);
CREATE INDEX
IF NOT EXISTS idx_credit_card_expenses_user_id ON credit_card_expenses
(user_id);
CREATE INDEX
IF NOT EXISTS idx_credit_card_expenses_credit_card_id ON credit_card_expenses
(credit_card_id);
CREATE INDEX
IF NOT EXISTS idx_credit_card_expenses_date ON credit_card_expenses
(date);

-- Criar função para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column
()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW
();
RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar o campo updated_at
CREATE TRIGGER update_credit_cards_updated_at
  BEFORE
UPDATE ON credit_cards
  FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

CREATE TRIGGER update_credit_card_expenses_updated_at
  BEFORE
UPDATE ON credit_card_expenses
  FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- Habilitar RLS (Row Level Security)
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_card_expenses ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança para credit_cards
CREATE POLICY "Users can view their own credit cards" ON credit_cards
  FOR
SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit cards" ON credit_cards
  FOR
INSERT WITH CHECK (auth.uid() =
user_id);

CREATE POLICY "Users can update their own credit cards" ON credit_cards
  FOR
UPDATE USING (auth.uid()
= user_id);

CREATE POLICY "Users can delete their own credit cards" ON credit_cards
  FOR
DELETE USING (auth.uid
() = user_id);

-- Criar políticas de segurança para credit_card_expenses
CREATE POLICY "Users can view their own credit card expenses" ON credit_card_expenses
  FOR
SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit card expenses" ON credit_card_expenses
  FOR
INSERT WITH CHECK (auth.uid() =
user_id);

CREATE POLICY "Users can update their own credit card expenses" ON credit_card_expenses
  FOR
UPDATE USING (auth.uid()
= user_id);

CREATE POLICY "Users can delete their own credit card expenses" ON credit_card_expenses
  FOR
DELETE USING (auth.uid
() = user_id);
