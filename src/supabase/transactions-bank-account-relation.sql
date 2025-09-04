-- Adicionar coluna bank_account_id à tabela transactions
-- Esta coluna será usada para vincular receitas a contas bancárias específicas

-- Adicionar a coluna bank_account_id
ALTER TABLE public.transactions
ADD COLUMN bank_account_id UUID REFERENCES public.bank_accounts
(id) ON
DELETE
SET NULL;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.transactions.bank_account_id IS 'ID da conta bancária para receitas. Apenas receitas devem ter esta coluna preenchida.';

-- Criar índice para melhor performance
CREATE INDEX idx_transactions_bank_account_id ON public.transactions(bank_account_id);

-- Atualizar RLS (Row Level Security) para incluir a nova coluna
-- As políticas existentes já cobrem esta coluna automaticamente

-- Exemplo de uso:
-- Para receitas: INSERT INTO transactions (..., bank_account_id) VALUES (..., 'uuid-da-conta');
-- Para despesas: INSERT INTO transactions (..., bank_account_id) VALUES (..., NULL);
