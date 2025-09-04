-- Adicionar relação entre contas bancárias e cartões de crédito
-- Este arquivo deve ser executado após a criação das tabelas básicas

-- Adicionar coluna bank_account_id na tabela credit_cards
ALTER TABLE public.credit_cards
ADD COLUMN
IF NOT EXISTS bank_account_id uuid REFERENCES public.bank_accounts
(id) ON
DELETE
SET NULL;

-- Adicionar índice para performance
CREATE INDEX
IF NOT EXISTS idx_credit_cards_bank_account_id ON public.credit_cards
(bank_account_id);

-- Atualizar RLS para incluir a nova coluna
-- As políticas existentes já cobrem user_id, então não precisamos alterar

-- Comentário: Agora um cartão de crédito pode estar vinculado a uma conta bancária
-- Isso permite:
-- 1. Identificar qual conta bancária é usada para pagar a fatura do cartão
-- 2. Fazer transferências automáticas para pagamento de faturas
-- 3. Relatórios mais detalhados sobre gastos por banco
-- 4. Gestão integrada de contas e cartões
