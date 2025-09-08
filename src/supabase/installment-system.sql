-- Sistema de Parcelas Automáticas para Cartão de Crédito
-- Este arquivo contém funções e triggers para criar automaticamente as próximas parcelas

-- Função para criar a próxima parcela quando uma parcela é paga
CREATE OR REPLACE FUNCTION create_next_installment
()
RETURNS TRIGGER AS $$
DECLARE
    next_installment_number INTEGER;
    next_date DATE;
    original_expense RECORD;
BEGIN
  -- Só processa se o status mudou de 'pending' para 'paid'
  IF OLD.payment_status = 'pending' AND NEW.payment_status = 'paid' THEN

  -- Verifica se é uma compra parcelada
  IF NEW.total_installments > 1 AND NEW.installment_number < NEW.total_installments THEN

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

            -- Calcula a data da próxima parcela (próximo mês)
            next_date := NEW.date + INTERVAL '1 month';

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
RAISE NOTICE 'Parcela %/% criada automaticamente para %',
                    next_installment_number,
                    NEW.total_installments,
                    NEW.description;
END
IF;
        END
IF;
    END
IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para executar a função quando uma despesa é atualizada
CREATE TRIGGER create_next_installment_trigger
    AFTER
UPDATE ON public.credit_card_expenses
    FOR EACH ROW
EXECUTE FUNCTION create_next_installment
();

-- Função para criar todas as parcelas de uma compra parcelada (para compras novas)
CREATE OR REPLACE FUNCTION create_all_installments
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
BEGIN
  -- Cria todas as parcelas exceto a primeira (que já deve ter sido criada)
  FOR i IN 2..p_total_installments LOOP
        installment_date := p_start_date +
  (i - 1) * INTERVAL '1 month';

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

    RAISE NOTICE 'Todas as parcelas criadas para: %', p_description;
END;
$$ LANGUAGE plpgsql;

-- Função para recriar parcelas perdidas (útil para manutenção)
CREATE OR REPLACE FUNCTION recreate_missing_installments
()
RETURNS VOID AS $$
DECLARE
    expense_record RECORD;
    i INTEGER;
    installment_date DATE;
BEGIN
  -- Busca todas as compras parceladas que podem ter parcelas faltando
  FOR expense_record IN
  SELECT DISTINCT
    user_id,
    credit_card_id,
    description,
    amount,
    category,
    tags,
    total_installments,
    date,
    allocation
  FROM public.credit_card_expenses
  WHERE total_installments > 1
    AND installment_number = 1
  LOOP
        -- Cria as parcelas que podem estar faltando
        FOR i IN 2..expense_record.total_installments LOOP
            installment_date := expense_record.date +
  (i - 1) * INTERVAL '1 month';

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

  RAISE NOTICE 'Parcela %/% recriada para: %',
                    i,
                    expense_record.total_installments,
                    expense_record.description;
END
IF;
        END LOOP;
END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Comentários sobre o sistema
COMMENT ON FUNCTION create_next_installment
() IS 'Cria automaticamente a próxima parcela quando uma parcela é marcada como paga';
COMMENT ON FUNCTION create_all_installments
(UUID, UUID, TEXT, NUMERIC, TEXT, TEXT[], INTEGER, DATE, TEXT) IS 'Cria todas as parcelas de uma compra parcelada';
COMMENT ON FUNCTION recreate_missing_installments
() IS 'Recria parcelas que podem ter sido perdidas (função de manutenção)';
