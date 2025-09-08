-- Exemplo prático: Como funciona a nova lógica de dia de fechamento

-- Cenário: Compra realizada em 30/01/2024
-- Cartão com dia de fechamento: 05
-- Compra parcelada em 12x

-- Com a lógica ANTIGA (incorreta):
-- Parcela 1: 30/01/2024 (data da compra)
-- Parcela 2: 30/02/2024 (30/01 + 1 mês)
-- Parcela 3: 30/03/2024 (30/01 + 2 meses)
-- etc...

-- Com a lógica NOVA (correta):
-- Parcela 1: 30/01/2024 (data da compra)
-- Parcela 2: 05/03/2024 (próximo fechamento após 1 mês)
-- Parcela 3: 05/04/2024 (próximo fechamento após 2 meses)
-- etc...

-- Teste da função calculate_next_installment_date:
SELECT
    'Parcela 1' as parcela,
    calculate_next_installment_date('2024-01-30'
::DATE, 5, 0) as data_parcela
UNION ALL
SELECT
    'Parcela 2' as parcela,
    calculate_next_installment_date('2024-01-30'
::DATE, 5, 1) as data_parcela
UNION ALL
SELECT
    'Parcela 3' as parcela,
    calculate_next_installment_date('2024-01-30'
::DATE, 5, 2) as data_parcela
UNION ALL
SELECT
    'Parcela 4' as parcela,
    calculate_next_installment_date('2024-01-30'
::DATE, 5, 3) as data_parcela;

-- Resultado esperado:
-- Parcela 1: 2024-01-30 (data original)
-- Parcela 2: 2024-03-05 (fechamento de março)
-- Parcela 3: 2024-04-05 (fechamento de abril)
-- Parcela 4: 2024-05-05 (fechamento de maio)

-- Casos especiais que a função trata:
-- 1. Dia de fechamento 31 em fevereiro (não existe) -> usa 28/29
-- 2. Dia de fechamento 30 em fevereiro (não existe) -> usa 28/29
-- 3. Dia de fechamento 29 em fevereiro (não existe em anos não bissextos) -> usa 28

-- Exemplo com dia de fechamento 31:
SELECT
    'Parcela 1' as parcela,
    calculate_next_installment_date('2024-01-31'
::DATE, 31, 0) as data_parcela
UNION ALL
SELECT
    'Parcela 2' as parcela,
    calculate_next_installment_date('2024-01-31'
::DATE, 31, 1) as data_parcela
UNION ALL
SELECT
    'Parcela 3' as parcela,
    calculate_next_installment_date('2024-01-31'
::DATE, 31, 2) as data_parcela;

-- Resultado esperado:
-- Parcela 1: 2024-01-31 (data original)
-- Parcela 2: 2024-02-29 (fechamento de fevereiro - ano bissexto)
-- Parcela 3: 2024-03-31 (fechamento de março)
