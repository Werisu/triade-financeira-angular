-- Exemplo prático do Sistema V2
-- Demonstra como funciona a nova lógica

-- Cenário: Compra em 30/01/2024 com fechamento dia 05
-- Resultado esperado:
-- Parcela 1: Compra 30/01, Cobrança 05/02 (próximo fechamento)
-- Parcela 2: Compra 30/01, Cobrança 05/03 (fechamento de março)
-- Parcela 3: Compra 30/01, Cobrança 05/04 (fechamento de abril)

-- Teste da função calculate_billing_date:
SELECT
    'Compra 30/01, Fechamento 05' as cenario,
    calculate_billing_date('2024-01-30'
::DATE, 5) as data_cobranca;

-- Resultado esperado: 2024-02-05

-- Teste da função calculate_next_installment_billing_date:
SELECT
    'Parcela 1' as parcela,
    calculate_next_installment_billing_date('2024-01-30'
::DATE, 5, 1) as data_cobranca
UNION ALL
SELECT
    'Parcela 2' as parcela,
    calculate_next_installment_billing_date('2024-01-30'
::DATE, 5, 2) as data_cobranca
UNION ALL
SELECT
    'Parcela 3' as parcela,
    calculate_next_installment_billing_date('2024-01-30'
::DATE, 5, 3) as data_cobranca
UNION ALL
SELECT
    'Parcela 4' as parcela,
    calculate_next_installment_billing_date('2024-01-30'
::DATE, 5, 4) as data_cobranca;

-- Resultado esperado:
-- Parcela 1: 2024-02-05 (próximo fechamento)
-- Parcela 2: 2024-03-05 (fechamento de março)
-- Parcela 3: 2024-04-05 (fechamento de abril)
-- Parcela 4: 2024-05-05 (fechamento de maio)

-- Exemplo com compra ANTES do fechamento:
-- Compra em 03/01/2024 com fechamento dia 05
-- Resultado esperado:
-- Parcela 1: Compra 03/01, Cobrança 05/01 (fechamento do mês atual)
-- Parcela 2: Compra 03/01, Cobrança 05/02 (fechamento de fevereiro)

SELECT
    'Compra 03/01, Fechamento 05' as cenario,
    calculate_billing_date('2024-01-03'
::DATE, 5) as data_cobranca;

-- Resultado esperado: 2024-01-05

SELECT
    'Parcela 1 (compra antes fechamento)' as parcela,
    calculate_next_installment_billing_date('2024-01-03'
::DATE, 5, 1) as data_cobranca
UNION ALL
SELECT
    'Parcela 2 (compra antes fechamento)' as parcela,
    calculate_next_installment_billing_date('2024-01-03'
::DATE, 5, 2) as data_cobranca;

-- Resultado esperado:
-- Parcela 1: 2024-01-05 (fechamento do mês atual)
-- Parcela 2: 2024-02-05 (fechamento de fevereiro)
