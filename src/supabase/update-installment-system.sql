-- Script para atualizar o sistema de parcelas para considerar o dia de fechamento
-- Execute este script para corrigir o problema das parcelas

-- 1. Primeiro, vamos remover o trigger antigo
DROP TRIGGER IF EXISTS create_next_installment_trigger
ON public.credit_card_expenses;

-- 2. Remover a função antiga
DROP FUNCTION IF EXISTS create_next_installment
();

-- 3. Aplicar o novo sistema (execute o conteúdo do arquivo installment-system-with-closing-day.sql aqui)
-- [O conteúdo do arquivo installment-system-with-closing-day.sql deve ser executado aqui]

-- 4. Criar o novo trigger
CREATE TRIGGER create_next_installment_trigger
    AFTER
UPDATE ON public.credit_card_expenses
    FOR EACH ROW
EXECUTE FUNCTION create_next_installment_with_closing_day
();

-- 5. Recriar todas as parcelas existentes com as datas corretas
SELECT recreate_missing_installments_with_closing_day();

-- 6. Verificar se as parcelas foram criadas corretamente
-- Exemplo para verificar a compra da Amazon:
SELECT
    id,
    description,
    amount,
    installment_number,
    total_installments,
    date,
    payment_status
FROM public.credit_card_expenses
WHERE description = 'AMAZON BR'
    AND amount = 65.85
    AND total_installments = 12
ORDER BY installment_number;
