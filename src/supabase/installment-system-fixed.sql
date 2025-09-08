-- Sistema de Parcelas Automáticas com Dia de Fechamento (VERSÃO CORRIGIDA)
-- Este arquivo corrige o problema de parcelas não considerarem o dia de fechamento da fatura

-- Função auxiliar para calcular a data da próxima parcela baseada no dia de fechamento
CREATE OR REPLACE FUNCTION calculate_next_installment_date
(
    purchase_date DATE,
    closing_day INTEGER,
    installment_number INTEGER
)
RETURNS DATE AS $$
DECLARE
    next_date DATE;
    current_year INTEGER;
    current_month INTEGER;
    next_year INTEGER;
    next_month INTEGER;
BEGIN
    -- Extrai ano e mês da data atual
    current_year := EXTRACT
(YEAR FROM purchase_date);
    current_month := EXTRACT
(MONTH FROM purchase_date);

    -- Calcula o mês da próxima parcela
    next_month := current_month + installment_number;
    next_year := current_year;

-- Ajusta ano se necessário
WHILE next_month > 12 LOOP
        next_month := next_month - 12;
        next_year := next_year + 1;
END LOOP;

-- Cria a data baseada no dia de fechamento
-- Se o dia de fechamento não existe no mês (ex: 31 em fevereiro), usa o último dia do mês
BEGIN
        next_date := MAKE_DATE
(next_year, next_month, closing_day);
    EXCEPTION WHEN OTHERS THEN
        -- Se o dia não existe no mês, usa o último dia do mês
        next_date :=
(MAKE_DATE
(next_year, next_month, 1) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
END;

RETURN next_date;
END;
$$ LANGUAGE plpgsql;

-- Função melhorada para criar a próxima parcela considerando o dia de fechamento
CREATE OR REPLACE FUNCTION create_next_installment_with_closing_day
()
RETURNS TRIGGER AS $$
DECLARE
    next_installment_number INTEGER;
    next_date DATE;
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

    -- Se não encontrar o cartão, usa a lógica antiga
    IF credit_card_closing_day IS NULL THEN
                credit_card_closing_day := EXTRACT
    (DAY FROM NEW.date);
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

            -- Calcula a data da próxima parcela baseada no dia de fechamento
            next_date := calculate_next_installment_date
(
                original_expense.date,
                credit_card_closing_day,
                next_installment_number - 1
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
        next_date,
        'pending',
        NEW.allocation
                );

-- Log da criação da parcela
RAISE NOTICE 'Parcela %/% criada automaticamente para % com data % (dia de fechamento: %)',
                    next_installment_number,
                    NEW.total_installments,
                    NEW.description,
                    next_date,
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

-- Função melhorada para criar todas as parcelas considerando o dia de fechamento
CREATE OR REPLACE FUNCTION create_all_installments_with_closing_day
(
    p_user_id UUID,
    p_credit_card_id UUID,
    p_description TEXT,
    p_amount NUMERIC,
    p_category TEXT,
    p_tags TEXT[],
    p_total_installments INTEGER,
    p_start_date DATE,
    p_allocation TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
    installment_date DATE;
    credit_card_closing_day INTEGER;
BEGIN
    -- Busca o dia de fechamento do cartão
    SELECT closing_day
    INTO credit_card_closing_day
    FROM public.credit_cards
    WHERE id = p_credit_card_id;

    -- Se não encontrar o cartão, usa o dia da data inicial
    IF credit_card_closing_day IS NULL THEN
        credit_card_closing_day := EXTRACT
    (DAY FROM p_start_date);
END
IF;

    -- Cria todas as parcelas exceto a primeira (que já deve ter sido criada)
    FOR i IN 2..p_total_installments LOOP
        -- Calcula a data baseada no dia de fechamento
        installment_date := calculate_next_installment_date
(
            p_start_date,
            credit_card_closing_day,
            i - 1
        );

-- Verifica se a parcela já existe
IF NOT EXISTS (
            SELECT 1
FROM public.credit_card_expenses
WHERE user_id = p_user_id
    AND credit_card_id = p_credit_card_id
    AND description = p_description
    AND amount = p_amount
    AND total_installments = p_total_installments
    AND installment_number = i
        ) THEN
-- Cria a parcela
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
    date,
    payment_status,
    allocation
    )
VALUES
    (
        p_user_id,
        p_credit_card_id,
        p_description,
        p_amount,
        p_category,
        p_tags,
        i,
        p_total_installments,
        installment_date,
        'pending',
        p_allocation
            );
END
IF;
    END LOOP;

    RAISE NOTICE 'Todas as parcelas criadas para: % (dia de fechamento: %)', p_description, credit_card_closing_day;
END;
$$ LANGUAGE plpgsql;

-- Função para recriar parcelas perdidas considerando o dia de fechamento
CREATE OR REPLACE FUNCTION recreate_missing_installments_with_closing_day
()
RETURNS VOID AS $$
DECLARE
    expense_record RECORD;
    i INTEGER;
    installment_date DATE;
    credit_card_closing_day INTEGER;
BEGIN
    -- Busca todas as compras parceladas que podem ter parcelas faltando
    FOR expense_record IN
    SELECT DISTINCT
        e.user_id,
        e.credit_card_id,
        e.description,
        e.amount,
        e.category,
        e.tags,
        e.total_installments,
        e.date,
        e.allocation,
        c.closing_day
    FROM public.credit_card_expenses e
        JOIN public.credit_cards c ON e.credit_card_id = c.id
    WHERE e.total_installments > 1
        AND e.installment_number = 1
    LOOP
        credit_card_closing_day := expense_record.closing_day;

-- Cria as parcelas que podem estar faltando
FOR i IN 2..expense_record.total_installments LOOP
            -- Calcula a data baseada no dia de fechamento
            installment_date := calculate_next_installment_date
(
                expense_record.date,
                credit_card_closing_day,
                i - 1
            );

-- Verifica se a parcela existe
IF NOT EXISTS (
                SELECT 1
FROM public.credit_card_expenses
WHERE user_id = expense_record.user_id
    AND credit_card_id = expense_record.credit_card_id
    AND description = expense_record.description
    AND amount = expense_record.amount
    AND total_installments = expense_record.total_installments
    AND installment_number = i
            ) THEN
-- Cria a parcela faltante
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
        installment_date,
        'pending',
        expense_record.allocation
                );

RAISE NOTICE 'Parcela %/% recriada para: % com data % (dia de fechamento: %)',
                    i,
                    expense_record.total_installments,
                    expense_record.description,
                    installment_date,
                    credit_card_closing_day;
END
IF;
        END LOOP;
END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Comentários sobre o sistema
COMMENT ON FUNCTION calculate_next_installment_date
(DATE, INTEGER, INTEGER) IS 'Calcula a data da próxima parcela baseada no dia de fechamento da fatura';
COMMENT ON FUNCTION create_next_installment_with_closing_day
() IS 'Cria automaticamente a próxima parcela considerando o dia de fechamento';
COMMENT ON FUNCTION create_all_installments_with_closing_day
(UUID, UUID, TEXT, NUMERIC, TEXT, TEXT[], INTEGER, DATE, TEXT) IS 'Cria todas as parcelas considerando o dia de fechamento';
COMMENT ON FUNCTION recreate_missing_installments_with_closing_day
() IS 'Recria parcelas perdidas considerando o dia de fechamento';
