# Correção: Sistema de Parcelas com Dia de Fechamento

## Problema Identificado

O sistema anterior criava parcelas baseado apenas na data da compra + 1 mês, ignorando o **dia de fechamento da fatura** do cartão de crédito.

### Exemplo do Problema:

- **Compra**: 30/01/2024
- **Dia de fechamento**: 05
- **Sistema antigo**: Parcela 2 em 30/02/2024 ❌
- **Sistema correto**: Parcela 2 em 05/03/2024 ✅

## Solução Implementada

### 1. Nova Função `calculate_next_installment_date()`

Calcula a data da próxima parcela baseada no dia de fechamento da fatura:

```sql
calculate_next_installment_date(
    current_date DATE,      -- Data da compra original
    closing_day INTEGER,    -- Dia de fechamento do cartão
    installment_number INTEGER  -- Número da parcela (0 = original, 1 = próxima, etc.)
)
```

### 2. Função Melhorada `create_next_installment_with_closing_day()`

- Busca o dia de fechamento do cartão automaticamente
- Calcula a data correta da próxima parcela
- Trata casos especiais (dia 31 em fevereiro, etc.)

### 3. Função de Manutenção `recreate_missing_installments_with_closing_day()`

Recria todas as parcelas existentes com as datas corretas.

## Como Aplicar a Correção

### Passo 1: Executar o Script de Atualização

```sql
-- Execute o arquivo: src/supabase/update-installment-system.sql
```

### Passo 2: Verificar as Parcelas

```sql
-- Verificar se as parcelas foram criadas corretamente
SELECT
    installment_number,
    date,
    description
FROM public.credit_card_expenses
WHERE description = 'AMAZON BR'
  AND total_installments = 12
ORDER BY installment_number;
```

## Exemplos Práticos

### Exemplo 1: Compra em 30/01 com fechamento dia 05

```
Parcela 1: 30/01/2024 (data da compra)
Parcela 2: 05/03/2024 (fechamento de março)
Parcela 3: 05/04/2024 (fechamento de abril)
Parcela 4: 05/05/2024 (fechamento de maio)
```

### Exemplo 2: Compra em 15/02 com fechamento dia 20

```
Parcela 1: 15/02/2024 (data da compra)
Parcela 2: 20/03/2024 (fechamento de março)
Parcela 3: 20/04/2024 (fechamento de abril)
Parcela 4: 20/05/2024 (fechamento de maio)
```

### Exemplo 3: Compra em 31/01 com fechamento dia 31

```
Parcela 1: 31/01/2024 (data da compra)
Parcela 2: 29/02/2024 (fevereiro não tem dia 31)
Parcela 3: 31/03/2024 (fechamento de março)
Parcela 4: 30/04/2024 (abril não tem dia 31)
```

## Casos Especiais Tratados

### 1. Dia de Fechamento Inexistente no Mês

- **Dia 31 em fevereiro**: Usa 28/29 (dependendo do ano)
- **Dia 30 em fevereiro**: Usa 28/29
- **Dia 29 em fevereiro (ano não bissexto)**: Usa 28

### 2. Múltiplos Cartões

- Cada cartão tem seu próprio dia de fechamento
- O sistema busca automaticamente o dia correto para cada cartão

### 3. Parcelas Existentes

- O sistema verifica se a parcela já existe antes de criar
- Evita duplicatas
- Permite recriar parcelas com datas corretas

## Benefícios da Correção

✅ **Datas corretas**: Parcelas aparecem no mês correto da fatura
✅ **Controle financeiro**: Melhor acompanhamento dos gastos mensais
✅ **Realismo**: Reflete como funciona na prática
✅ **Flexibilidade**: Funciona com qualquer dia de fechamento
✅ **Manutenção**: Função para corrigir parcelas existentes

## Verificação

Após aplicar a correção, verifique:

1. **Parcelas novas**: São criadas com datas corretas
2. **Parcelas existentes**: Foram recriadas com datas corretas
3. **Diferentes cartões**: Cada um usa seu dia de fechamento
4. **Casos especiais**: Dias inexistentes são tratados corretamente

## Comandos Úteis

### Ver todas as parcelas de uma compra:

```sql
SELECT
    installment_number,
    date,
    payment_status,
    description
FROM public.credit_card_expenses
WHERE description = 'NOME_DA_COMPRA'
ORDER BY installment_number;
```

### Ver dia de fechamento de um cartão:

```sql
SELECT name, closing_day
FROM public.credit_cards
WHERE id = 'ID_DO_CARTAO';
```

### Recriar parcelas de uma compra específica:

```sql
-- Primeiro, delete as parcelas existentes (exceto a primeira)
DELETE FROM public.credit_card_expenses
WHERE description = 'NOME_DA_COMPRA'
  AND installment_number > 1;

-- Depois execute a função de recriação
SELECT recreate_missing_installments_with_closing_day();
```
