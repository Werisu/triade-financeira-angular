-- Migração para adicionar campo 'allocation' (regra 50/30/20)
-- Data: 2024-12-19
-- Descrição: Adiciona campo de alocação financeira nas tabelas transactions e credit_card_expenses

-- Adicionar campo 'allocation' na tabela transactions
ALTER TABLE public.transactions
ADD COLUMN allocation text CHECK
(allocation = ANY
(ARRAY['needs'::text, 'wants'::text, 'savings'::text]) OR allocation IS NULL);

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.transactions.allocation IS 'Categoria de alocação financeira conforme regra 50/30/20: needs (50% necessidades), wants (30% desejos), savings (20% poupança/dívidas)';

-- Adicionar campo 'allocation' na tabela credit_card_expenses
ALTER TABLE public.credit_card_expenses
ADD COLUMN allocation text CHECK
(allocation = ANY
(ARRAY['needs'::text, 'wants'::text, 'savings'::text]) OR allocation IS NULL);

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.credit_card_expenses.allocation IS 'Categoria de alocação financeira conforme regra 50/30/20: needs (50% necessidades), wants (30% desejos), savings (20% poupança/dívidas)';

-- Atualizar RLS (Row Level Security) se necessário
-- As políticas existentes devem continuar funcionando normalmente

-- Verificar se as alterações foram aplicadas
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name IN ('transactions', 'credit_card_expenses')
  AND column_name = 'allocation'
ORDER BY table_name;
