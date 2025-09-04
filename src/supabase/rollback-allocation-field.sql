-- Rollback para remover campo 'allocation' (regra 50/30/20)
-- Data: 2024-12-19
-- Descrição: Remove campo de alocação financeira das tabelas transactions e credit_card_expenses

-- ATENÇÃO: Esta operação irá remover permanentemente todos os dados de alocação!
-- Execute apenas se necessário reverter as alterações.

-- Remover campo 'allocation' da tabela credit_card_expenses
ALTER TABLE public.credit_card_expenses
DROP COLUMN IF EXISTS allocation;

-- Remover campo 'allocation' da tabela transactions
ALTER TABLE public.transactions
DROP COLUMN IF EXISTS allocation;

-- Verificar se as alterações foram revertidas
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

-- Deve retornar 0 linhas se o rollback foi bem-sucedido
