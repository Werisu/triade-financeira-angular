# Migração: Campo Allocation (Regra 50/30/20)

## 📋 Resumo

Esta migração adiciona o campo `allocation` nas tabelas `transactions` e `credit_card_expenses` para implementar a regra 50/30/20 de alocação financeira.

## 🎯 Objetivo

Permitir que os usuários categorizem seus gastos conforme a metodologia:

- **50% Necessidades** (`needs`): Aluguel, alimentação básica, transporte essencial, saúde
- **30% Desejos** (`wants`): Entretenimento, roupas, viagens, hobbies
- **20% Poupança** (`savings`): Investimentos, fundo de emergência, pagamento de dívidas

## 📁 Arquivos Criados

### 1. `add-allocation-field.sql`

**Migração principal** - Adiciona o campo `allocation` nas tabelas:

- `public.transactions`
- `public.credit_card_expenses`

### 2. `rollback-allocation-field.sql`

**Rollback** - Remove o campo `allocation` (caso necessário reverter)

### 3. Arquivos Atualizados

- `schema.sql` - Schema principal atualizado
- `credit-cards.sql` - Schema de cartões atualizado

## 🚀 Como Aplicar a Migração

### Opção 1: Via Supabase Dashboard

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute o conteúdo de `add-allocation-field.sql`

### Opção 2: Via CLI do Supabase

```bash
# Se usando Supabase CLI
supabase db reset
# ou
supabase db push
```

### Opção 3: Via psql (PostgreSQL)

```bash
psql -h [HOST] -U [USER] -d [DATABASE] -f add-allocation-field.sql
```

## 🔍 Verificação

Após aplicar a migração, execute esta query para verificar:

```sql
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('transactions', 'credit_card_expenses')
    AND column_name = 'allocation'
ORDER BY table_name;
```

**Resultado esperado:**

```
table_name           | column_name | data_type | is_nullable | column_default
transactions         | allocation  | text      | YES         | null
credit_card_expenses | allocation  | text      | YES         | null
```

## ⚠️ Considerações Importantes

### Compatibilidade

- ✅ **Backward Compatible**: Campo é opcional (`NULL` permitido)
- ✅ **Dados Existentes**: Não afeta registros existentes
- ✅ **Aplicação**: Funciona com código atual e novo

### Validação

- ✅ **CHECK Constraint**: Aceita apenas `'needs'`, `'wants'`, `'savings'` ou `NULL`
- ✅ **Type Safety**: TypeScript já atualizado nos tipos

### Performance

- ✅ **Índices**: Não necessário (campo opcional, baixa cardinalidade)
- ✅ **Queries**: Não impacta performance de consultas existentes

## 🔄 Rollback (Se Necessário)

**ATENÇÃO**: Rollback remove permanentemente todos os dados de alocação!

```sql
-- Execute apenas se necessário
\i rollback-allocation-field.sql
```

## 📊 Impacto na Aplicação

### Frontend (Angular)

- ✅ Formulários atualizados com seleção 50/30/20
- ✅ Tipos TypeScript atualizados
- ✅ Validação integrada

### Backend (Supabase)

- ✅ Campo adicionado nas tabelas
- ✅ Constraints de validação
- ✅ RLS (Row Level Security) mantido

### Dados

- ✅ Registros existentes: `allocation = NULL`
- ✅ Novos registros: Campo preenchido conforme seleção do usuário

## 🎉 Próximos Passos

Após aplicar a migração:

1. **Teste os Formulários**:

   - Nova Transação (despesa)
   - Novo Gasto com Cartão

2. **Verifique a Persistência**:

   - Crie alguns gastos com diferentes alocações
   - Confirme que os dados são salvos corretamente

3. **Futuras Funcionalidades**:
   - Relatórios por categoria de alocação
   - Gráficos de distribuição 50/30/20
   - Alertas de limite por categoria

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do Supabase
2. Confirme que a migração foi aplicada corretamente
3. Teste com dados de exemplo
4. Use o rollback se necessário

---

**Data da Migração**: 2024-12-19  
**Versão**: 1.0  
**Status**: ✅ Pronto para Aplicação
