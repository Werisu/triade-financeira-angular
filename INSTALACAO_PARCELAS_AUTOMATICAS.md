# Sistema de Parcelas Automáticas - Instruções de Instalação

## Problema Identificado

O sistema atual não cria automaticamente as próximas parcelas quando uma parcela é paga. Por exemplo, se você pagou a 9ª parcela de 12 de uma compra, a 10ª parcela não aparece automaticamente no mês seguinte.

## Solução Implementada

Criei um sistema completo de parcelas automáticas que inclui:

1. **Função `create_next_installment()`**: Cria automaticamente a próxima parcela quando uma parcela é marcada como paga
2. **Trigger `create_next_installment_trigger`**: Executa a função automaticamente quando uma despesa é atualizada
3. **Função `create_all_installments()`**: Cria todas as parcelas de uma compra parcelada (para compras novas)
4. **Função `recreate_missing_installments()`**: Recria parcelas que podem ter sido perdidas (manutenção)

## Como Aplicar no Banco de Dados

### Passo 1: Executar o Script SQL

Execute o arquivo `src/supabase/installment-system.sql` no seu banco de dados Supabase:

1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Cole o conteúdo do arquivo `installment-system.sql`
4. Execute o script

### Passo 2: Recriar Parcelas Existentes (Opcional)

Se você já tem compras parceladas que não estão gerando as próximas parcelas, execute:

```sql
SELECT recreate_missing_installments();
```

Isso irá criar todas as parcelas faltantes para compras parceladas existentes.

## Como Funciona

### Para Compras Novas

Quando você criar uma nova compra parcelada (ex: 12x), o sistema criará automaticamente todas as 12 parcelas com as datas corretas.

### Para Parcelas Existentes

Quando você marcar uma parcela como "paga" (através do pagamento da fatura), o sistema automaticamente:

1. Verifica se é uma compra parcelada
2. Verifica se não é a última parcela
3. Calcula a data da próxima parcela (próximo mês)
4. Cria a próxima parcela automaticamente

### Exemplo Prático

**Situação**: Compra de R$ 1.200,00 em 12x de R$ 100,00

- **Parcela 1**: Criada em 26/12/2024
- **Parcela 2**: Criada automaticamente em 26/01/2025
- **Parcela 3**: Criada automaticamente em 26/02/2025
- E assim por diante...

## Verificação

Após aplicar o sistema, você pode verificar se está funcionando:

1. Crie uma compra parcelada de teste
2. Marque a primeira parcela como paga
3. Verifique se a segunda parcela aparece automaticamente no mês seguinte

## Logs

O sistema gera logs informativos quando cria parcelas automaticamente. Você pode ver esses logs no console do Supabase ou nos logs da aplicação.

## Manutenção

Se necessário, você pode executar a função de manutenção para recriar parcelas perdidas:

```sql
SELECT recreate_missing_installments();
```

## Benefícios

- ✅ Parcelas são criadas automaticamente
- ✅ Não precisa criar manualmente cada parcela
- ✅ Datas são calculadas corretamente (próximo mês)
- ✅ Sistema funciona para compras existentes e novas
- ✅ Função de manutenção para corrigir problemas
- ✅ Logs informativos para acompanhamento

## Observações Importantes

1. O sistema só cria a próxima parcela quando uma parcela é marcada como "paid"
2. As parcelas são criadas com data do próximo mês
3. O sistema verifica se a parcela já existe antes de criar (evita duplicatas)
4. Funciona tanto para compras novas quanto existentes
