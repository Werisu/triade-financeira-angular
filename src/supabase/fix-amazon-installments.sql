-- Script para corrigir as parcelas da compra da Amazon BR
-- Esta compra tem 12 parcelas, mas só a 9ª foi paga, faltam as parcelas 10, 11 e 12

-- Primeiro, vamos verificar a situação atual da compra
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

-- Criar as parcelas faltantes (10, 11 e 12)
-- Parcela 10 - Janeiro 2025
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
    'd6d238cc-cf82-4a0d-9738-dc8f8a4db80c', -- user_id da compra original
    '27247336-7031-4ffe-ac3a-407dca7dd0b8', -- credit_card_id da compra original
    'AMAZON BR',
    65.85,
    'Compras Online',
    '{"compras","online"}',
    10,
    12,
    '2025-01-26', -- Data da 9ª parcela + 1 mês
    'pending',
    null
);

-- Parcela 11 - Fevereiro 2025
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
    'd6d238cc-cf82-4a0d-9738-dc8f8a4db80c',
    '27247336-7031-4ffe-ac3a-407dca7dd0b8',
    'AMAZON BR',
    65.85,
    'Compras Online',
    '{"compras","online"}',
    11,
    12,
    '2025-02-26', -- Data da 10ª parcela + 1 mês
    'pending',
    null
);

-- Parcela 12 - Março 2025
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
    'd6d238cc-cf82-4a0d-9738-dc8f8a4db80c',
    '27247336-7031-4ffe-ac3a-407dca7dd0b8',
    'AMAZON BR',
    65.85,
    'Compras Online',
    '{"compras","online"}',
    12,
    12,
    '2025-03-26', -- Data da 11ª parcela + 1 mês
    'pending',
    null
);

-- Verificar se as parcelas foram criadas corretamente
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

-- Comentário: Após executar este script, você terá todas as 12 parcelas da compra da Amazon BR
-- A partir de agora, quando você pagar a 10ª parcela, a 11ª será criada automaticamente
-- (se o sistema de parcelas automáticas estiver instalado)
