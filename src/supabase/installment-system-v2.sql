-- Sistema de Parcelas V2 - Com Data de Compra e Data de Cobrança
-- Solução definitiva para o problema de parcelas

-- 1. Adicionar nova coluna para data da compra
ALTER TABLE public.credit_card_expenses
ADD COLUMN
IF NOT EXISTS purchase_date DATE;

-- 2. Atualizar registros existentes (se purchase_date for NULL, usa date como purchase_date)
UPDATE public.credit_card_expenses
SET purchase_date = date
WHERE purchase_date IS NULL;

-- 3. Função para calcular a data de cobrança baseada no dia de fechamento
CREATE OR REPLACE FUNCTION calculate_billing_date
(
    purchase_date DATE,
    closing_day INTEGER
)
RETURNS DATE AS $$
DECLARE
    billing_date DATE;
    purchase_year INTEGER;
    purchase_month INTEGER;
    purchase_day INTEGER;
    billing_year INTEGER;
    billing_month INTEGER;
BEGIN
    -- Extrai componentes da data da compra
    purchase_year := EXTRACT
(YEAR FROM purchase_date);
    purchase_month := EXTRACT
(MONTH FROM purchase_date);
    purchase_day := EXTRACT
(DAY FROM purchase_date);

-- Se a compra foi feita ANTES do fechamento do mês atual
IF purchase_day <= closing_day THEN
        -- A cobrança será no fechamento do mês atual
        billing_month := purchase_month;
        billing_year := purchase_year;
    ELSE
        -- A cobrança será no fechamento do próximo mês
        billing_month := purchase_month + 1;
        billing_year := purchase_year;

-- Ajusta ano se necessário
IF billing_month > 12 THEN
            billing_month := billing_month - 12;
            billing_year := billing_year + 1;
END
IF;
    END
IF;

    -- Cria a data de cobrança baseada no dia de fechamento
    BEGIN
        billing_date := MAKE_DATE
(billing_year, billing_month, closing_day);
    EXCEPTION WHEN OTHERS THEN
        -- Se o dia não existe no mês, usa o último dia do mês
        billing_date :=
(MAKE_DATE
(billing_year, billing_month, 1) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
END;

RETURN billing_date;
END;
$$ LANGUAGE plpgsql;

-- 4. Função para calcular a data da próxima parcela
CREATE OR REPLACE FUNCTION calculate_next_installment_billing_date
(
    original_purchase_date DATE,
    closing_day INTEGER,
    installment_number INTEGER
)
RETURNS DATE AS $$
DECLARE
    billing_date DATE;
    purchase_year INTEGER;
    purchase_month INTEGER;
    purchase_day INTEGER;
    billing_year INTEGER;
    billing_month INTEGER;
BEGIN
    -- Extrai componentes da data da compra original
    purchase_year := EXTRACT
(YEAR FROM original_purchase_date);
    purchase_month := EXTRACT
(MONTH FROM original_purchase_date);
    purchase_day := EXTRACT
(DAY FROM original_purchase_date);

-- Calcula o mês de cobrança baseado no número da parcela
IF purchase_day <= closing_day THEN
        -- Primeira parcela no mês atual
        billing_month := purchase_month + installment_number - 1;
        billing_year := purchase_year;
    ELSE
        -- Primeira parcela no próximo mês
        billing_month := purchase_month + installment_number;
        billing_year := purchase_year;
END
IF;

    -- Ajusta ano se necessário
    WHILE billing_month > 12 LOOP
        billing_month := billing_month - 12;
        billing_year := billing_year + 1;
END LOOP;

-- Cria a data de cobrança
BEGIN
        billing_date := MAKE_DATE
(billing_year, billing_month, closing_day);
    EXCEPTION WHEN OTHERS THEN
        -- Se o dia não existe no mês, usa o último dia do mês
        billing_date :=
(MAKE_DATE
(billing_year, billing_month, 1) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
END;

RETURN billing_date;
END;
$$ LANGUAGE plpgsql;

-- 5. Função para criar a próxima parcela (V2)
CREATE OR REPLACE FUNCTION create_next_installment_v2
()
RETURNS TRIGGER AS $$
DECLARE
    next_installment_number INTEGER;
    next_billing_date DATE;
    original_expense RECORD;
    credit_card_closing_day INTEGER;
BEGIN
    -- Só processa se o status mudou de 'pending' para 'paid'
    IF OLD.payment_status = 'pending' AND NEW.payment_status = 'paid' THEN

    -- Verifica se é uma compra parcelada
    IF NEW.total_installments > 1 AND NEW.installment_number < NEW.total_installments THEN

    -- Busca o dia de fechamento do cartão
    SELECT closing_day
    INTO credit_card_closing_day
    FROM public.credit_cards
    WHERE id = NEW.credit_card_id;

    -- Se não encontrar o cartão, usa o dia 5 como padrão
    IF credit_card_closing_day IS NULL THEN
                credit_card_closing_day := 5;
END
IF;

            -- Busca a despesa original (primeira parcela) para manter consistência
            SELECT *
INTO original_expense
FROM public.credit_card_expenses
WHERE user_id = NEW.user_id
    AND credit_card_id = NEW.credit_card_id
    AND description = NEW.description
    AND amount = NEW.amount
    AND total_installments = NEW.total_installments
    AND installment_number = 1
LIMIT 1;

-- Se não encontrar a original, usa a atual como referência
IF original_expense.id IS NULL THEN
                original_expense := NEW;
END
IF;

            -- Calcula o número da próxima parcela
            next_installment_number := NEW.installment_number + 1;

            -- Calcula a data de cobrança da próxima parcela
            next_billing_date := calculate_next_installment_billing_date
(
                COALESCE
(original_expense.purchase_date, original_expense.date),
                credit_card_closing_day,
                next_installment_number
            );

-- Verifica se a próxima parcela já existe
IF NOT EXISTS (
                SELECT 1
FROM public.credit_card_expenses
WHERE user_id = NEW.user_id
    AND credit_card_id = NEW.credit_card_id
    AND description = NEW.description
    AND amount = NEW.amount
    AND total_installments = NEW.total_installments
    AND installment_number = next_installment_number
            ) THEN

-- Cria a próxima parcela
INSERT INTO public.credit_card_expenses
    (
    user_id,
    credit_card_id,
    description,
    amount,
    category,
    tags,
    installment_number,
    total_installments,
    purchase_date,
    date,
    payment_status,
    allocation
    )
VALUES
    (
        NEW.user_id,
        NEW.credit_card_id,
        NEW.description,
        NEW.amount,
        NEW.category,
        NEW.tags,
        next_installment_number,
        NEW.total_installments,
        COALESCE(original_expense.purchase_date, original_expense.date),
        next_billing_date,
        'pending',
        NEW.allocation
                );

-- Log da criação da parcela
RAISE NOTICE 'Parcela %/% criada automaticamente para % - Compra: %, Cobrança: % (fechamento: %)',
                    next_installment_number,
                    NEW.total_installments,
                    NEW.description,
                    COALESCE
(original_expense.purchase_date, original_expense.date),
                    next_billing_date,
                    credit_card_closing_day;
END
IF;
        END
IF;
    END
IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Função para recriar todas as parcelas com as datas corretas
CREATE OR REPLACE FUNCTION recreate_all_installments_v2
()
RETURNS VOID AS $$
DECLARE
    expense_record RECORD;
    i INTEGER;
    billing_date DATE;
    credit_card_closing_day INTEGER;
BEGIN
    -- Busca todas as compras parceladas
    FOR expense_record IN
    SELECT DISTINCT
        e.user_id,
        e.credit_card_id,
        e.description,
        e.amount,
        e.category,
        e.tags,
        e.total_installments,
        e.purchase_date,
        e.date,
        e.allocation,
        c.closing_day
    FROM public.credit_card_expenses e
        JOIN public.credit_cards c ON e.credit_card_id = c.id
    WHERE e.total_installments > 1
        AND e.installment_number = 1
    LOOP
        credit_card_closing_day := expense_record.closing_day;

    -- Deleta todas as parcelas exceto a primeira
    DELETE FROM public.credit_card_expenses
        WHERE user_id = expense_record.user_id
        AND credit_card_id = expense_record.credit_card_id
        AND description = expense_record.description
        AND amount = expense_record.amount
        AND total_installments = expense_record.total_installments
        AND installment_number > 1;

    -- Recria todas as parcelas com as datas corretas
    FOR i IN 2..expense_record.total_installments LOOP
            billing_date := calculate_next_installment_billing_date
    (
                COALESCE
    (expense_record.purchase_date, expense_record.date),
                credit_card_closing_day,
                i
            );

    INSERT INTO public.credit_card_expenses
        (
        user_id,
        credit_card_id,
        description,
        amount,
        category,
        tags,
        installment_number,
        total_installments,
        purchase_date,
        date,
        payment_status,
        allocation
        )
    VALUES
        (
            expense_record.user_id,
            expense_record.credit_card_id,
            expense_record.description,
            expense_record.amount,
            expense_record.category,
            expense_record.tags,
            i,
            expense_record.total_installments,
            COALESCE(expense_record.purchase_date, expense_record.date),
            billing_date,
            'pending',
            expense_record.allocation
            );

    RAISE NOTICE 'Parcela %/% recriada para: % - Compra: %, Cobrança: %',
                i,
                expense_record.total_installments,
                expense_record.description,
                COALESCE
    (expense_record.purchase_date, expense_record.date),
                billing_date;
END LOOP;
END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 7. Comentários
COMMENT ON COLUMN public.credit_card_expenses.purchase_date IS 'Data real da compra';
COMMENT ON COLUMN public.credit_card_expenses.date IS 'Data de cobrança (calculada baseada no dia de fechamento)';
COMMENT ON FUNCTION calculate_billing_date
(DATE, INTEGER) IS 'Calcula a data de cobrança baseada na data da compra e dia de fechamento';
COMMENT ON FUNCTION calculate_next_installment_billing_date
(DATE, INTEGER, INTEGER) IS 'Calcula a data de cobrança de uma parcela específica';
COMMENT ON FUNCTION create_next_installment_v2
() IS 'Cria automaticamente a próxima parcela com datas corretas';
COMMENT ON FUNCTION recreate_all_installments_v2
() IS 'Recria todas as parcelas com as datas corretas';
