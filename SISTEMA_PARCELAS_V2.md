# Sistema de Parcelas V2 - Solução Definitiva

## 🎯 Problema Resolvido

O sistema anterior confundia **data da compra** com **data de cobrança**. Agora temos:

- **`purchase_date`** - Data real da compra
- **`date`** - Data de cobrança (calculada automaticamente)

## ✨ Como Funciona Agora

### Lógica Inteligente:

1. **Se a compra foi feita ANTES do fechamento do mês:**

   - Cobrança no fechamento do mês atual

2. **Se a compra foi feita DEPOIS do fechamento do mês:**
   - Cobrança no fechamento do próximo mês

### Exemplos Práticos:

#### Exemplo 1: Compra em 30/01 com fechamento dia 05

```
Compra: 30/01/2024 (DEPOIS do fechamento de janeiro)
Parcela 1: Cobrança 05/02/2024 ✅ (próximo fechamento)
Parcela 2: Cobrança 05/03/2024 ✅ (fechamento de março)
Parcela 3: Cobrança 05/04/2024 ✅ (fechamento de abril)
```

#### Exemplo 2: Compra em 03/01 com fechamento dia 05

```
Compra: 03/01/2024 (ANTES do fechamento de janeiro)
Parcela 1: Cobrança 05/01/2024 ✅ (fechamento do mês atual)
Parcela 2: Cobrança 05/02/2024 ✅ (fechamento de fevereiro)
Parcela 3: Cobrança 05/03/2024 ✅ (fechamento de março)
```

## 🚀 Instalação

### Passo 1: Execute o Sistema V2

```sql
-- Execute: src/supabase/installment-system-v2.sql
```

### Passo 2: Instale o Sistema

```sql
-- Execute: src/supabase/install-v2-system.sql
```

## 📊 Estrutura da Tabela

```sql
CREATE TABLE public.credit_card_expenses (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL,
    credit_card_id uuid NOT NULL,
    description text NOT NULL,
    amount numeric(10, 2) NOT NULL,
    category text NOT NULL,
    tags text[] DEFAULT '{}',
    installment_number integer,
    total_installments integer,
    purchase_date date,        -- 🆕 Data real da compra
    date date NOT NULL,        -- Data de cobrança (calculada)
    payment_status text DEFAULT 'pending',
    allocation text,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);
```

## 🔧 Funções Principais

### 1. `calculate_billing_date(purchase_date, closing_day)`

Calcula a data de cobrança baseada na data da compra e dia de fechamento.

### 2. `calculate_next_installment_billing_date(purchase_date, closing_day, installment_number)`

Calcula a data de cobrança de uma parcela específica.

### 3. `create_next_installment_v2()`

Cria automaticamente a próxima parcela quando uma é paga.

### 4. `recreate_all_installments_v2()`

Recria todas as parcelas com as datas corretas.

## 📝 Exemplos de Uso

### Ver todas as parcelas de uma compra:

```sql
SELECT
    installment_number,
    purchase_date,
    date as billing_date,
    payment_status,
    description
FROM public.credit_card_expenses
WHERE description = 'AMAZON BR'
ORDER BY installment_number;
```

### Criar uma nova compra parcelada:

```sql
-- Primeira parcela (sistema criará as demais automaticamente)
INSERT INTO public.credit_card_expenses (
    user_id,
    credit_card_id,
    description,
    amount,
    category,
    installment_number,
    total_installments,
    purchase_date,
    date,
    payment_status
) VALUES (
    'user-id',
    'card-id',
    'Nova Compra',
    100.00,
    'Categoria',
    1,
    12,
    '2024-01-30',  -- Data da compra
    '2024-02-05',  -- Data de cobrança (será calculada automaticamente)
    'pending'
);
```

## ✅ Benefícios da Solução V2

- ✅ **Separação clara**: Data da compra vs Data de cobrança
- ✅ **Lógica correta**: Considera se a compra foi antes/depois do fechamento
- ✅ **Automático**: Cria parcelas automaticamente quando uma é paga
- ✅ **Flexível**: Funciona com qualquer dia de fechamento
- ✅ **Inteligente**: Trata casos especiais (dia 31 em fevereiro, etc.)
- ✅ **Manutenção**: Função para recriar parcelas com datas corretas

## 🔍 Verificação

Após instalar, verifique:

1. **Nova coluna criada**: `purchase_date` existe na tabela
2. **Parcelas recriadas**: Todas as parcelas existentes foram recriadas
3. **Datas corretas**: Parcelas aparecem nos meses corretos
4. **Sistema funcionando**: Novas parcelas são criadas automaticamente

## 🎉 Resultado Final

Agora o sistema funciona exatamente como na vida real:

- Compra em 30/01 → Cobrança em 05/02 (próximo fechamento)
- Compra em 03/01 → Cobrança em 05/01 (fechamento do mês atual)

**Problema resolvido definitivamente!** 🚀
