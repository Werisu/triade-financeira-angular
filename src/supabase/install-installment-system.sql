-- Script de Instalação do Sistema de Parcelas com Dia de Fechamento
-- Execute este script no Supabase SQL Editor

-- 1. Remover sistema antigo (se existir)
DROP TRIGGER IF EXISTS create_next_installment_trigger
ON public.credit_card_expenses;
DROP FUNCTION IF EXISTS create_next_installment
();
DROP FUNCTION IF EXISTS create_all_installments
(UUID, UUID, TEXT, NUMERIC, TEXT, TEXT[], INTEGER, DATE, TEXT);
DROP FUNCTION IF EXISTS recreate_missing_installments
();

-- 2. Instalar o novo sistema
-- Execute o conteúdo do arquivo: src/supabase/installment-system-fixed.sql
-- (Cole o conteúdo aqui)

-- 3. Criar o trigger
CREATE TRIGGER create_next_installment_trigger
    AFTER
UPDATE ON public.credit_card_expenses
    FOR EACH ROW
EXECUTE FUNCTION create_next_installment_with_closing_day
();

-- 4. Recriar parcelas existentes com datas corretas
SELECT recreate_missing_installments_with_closing_day();

-- 5. Verificar se funcionou
SELECT
    'Sistema instalado com sucesso!' as status,
    COUNT(*) as total_parcelas_criadas
FROM public.credit_card_expenses
WHERE total_installments > 1;
