-- Instalação do Sistema de Parcelas V2
-- Execute este script no Supabase SQL Editor

-- 1. Remover sistema antigo
DROP TRIGGER IF EXISTS create_next_installment_trigger
ON public.credit_card_expenses;
DROP FUNCTION IF EXISTS create_next_installment
();
DROP FUNCTION IF EXISTS create_next_installment_with_closing_day
();
DROP FUNCTION IF EXISTS calculate_next_installment_date
(DATE, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS create_all_installments
(UUID, UUID, TEXT, NUMERIC, TEXT, TEXT[], INTEGER, DATE, TEXT);
DROP FUNCTION IF EXISTS create_all_installments_with_closing_day
(UUID, UUID, TEXT, NUMERIC, TEXT, TEXT[], INTEGER, DATE, TEXT);
DROP FUNCTION IF EXISTS recreate_missing_installments
();
DROP FUNCTION IF EXISTS recreate_missing_installments_with_closing_day
();

-- 2. Instalar o sistema V2
-- Execute o conteúdo do arquivo: src/supabase/installment-system-v2.sql
-- (Cole o conteúdo aqui)

-- 3. Criar o novo trigger
CREATE TRIGGER create_next_installment_trigger
    AFTER
UPDATE ON public.credit_card_expenses
    FOR EACH ROW
EXECUTE FUNCTION create_next_installment_v2
();

-- 4. Recriar todas as parcelas com as datas corretas
SELECT recreate_all_installments_v2();

-- 5. Verificar se funcionou
SELECT
    'Sistema V2 instalado com sucesso!' as status,
    COUNT(*) as total_parcelas_criadas
FROM public.credit_card_expenses
WHERE total_installments > 1;

-- 6. Exemplo de verificação
SELECT
    description,
    installment_number,
    purchase_date,
    date as billing_date,
    payment_status
FROM public.credit_card_expenses
WHERE description = 'AMAZON BR'
    AND total_installments = 12
ORDER BY installment_number;
