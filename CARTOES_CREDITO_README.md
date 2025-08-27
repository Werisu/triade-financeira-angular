# Sistema de Cartões de Crédito - FinWell

Este sistema permite gerenciar cartões de crédito e seus gastos, incluindo suporte a parcelamentos e tags para melhor organização financeira.

## Funcionalidades Implementadas

### 1. Cadastro de Cartões de Crédito

- **Nome do cartão**: Identificação personalizada (ex: Nubank, Itaú)
- **Limite**: Valor máximo disponível no cartão
- **Dia de fechamento**: Data em que fecha a fatura
- **Dia de vencimento**: Data limite para pagamento
- **Cor personalizada**: Para identificação visual

### 2. Cadastro de Gastos com Cartão

- **Descrição**: Nome da compra/estabelecimento
- **Valor**: Valor da compra
- **Categoria**: Classificação do gasto (Alimentação, Transporte, etc.)
- **Tags**: Etiquetas personalizadas para organização
- **Parcelamento**: Suporte a compras parceladas
  - Número total de parcelas
  - Parcela atual (para acompanhamento)

### 3. Visualização de Gastos

- Lista organizada por data
- Identificação do método de pagamento:
  - **Pg**: Compra parcelada
  - **Mp**: Compra à vista
- Exibição de tags e categorias
- Cálculo automático de totais

## Como Usar

### 1. Primeiro Acesso

1. Faça login na aplicação
2. Clique em "Novo Cartão" para cadastrar seu primeiro cartão
3. Preencha as informações do cartão
4. Escolha uma cor para identificação visual

### 2. Cadastrando Gastos

1. Clique em "Novo Gasto" no dashboard
2. Selecione o cartão usado
3. Preencha a descrição e valor
4. Escolha a categoria
5. Adicione tags relevantes (ex: "trabalho", "lazer", "urgente")
6. Se for compra parcelada, informe o número de parcelas
7. Salve o gasto

### 3. Acompanhamento

- Visualize todos os gastos na seção "Gastos com Cartão de Crédito"
- Monitore o limite disponível de cada cartão
- Acompanhe datas de fechamento e vencimento
- Use as tags para filtrar e organizar gastos

## Exemplo de Uso

### Cadastro de Cartão

```
Nome: Nubank
Limite: R$ 5.000,00
Dia de Fechamento: 15
Dia de Vencimento: 25
Cor: Azul
```

### Cadastro de Gasto

```
Cartão: Nubank
Descrição: Samsung Galaxy S23
Valor: R$ 4.500,00
Categoria: Tecnologia
Tags: [celular, urgente, presente]
Parcelas: 12x
Parcela Atual: 1
```

### Resultado na Lista

```
2025-01-15 | Pg *Samsung Galaxy S23 - Parcela 1/12 | R$ 4.500,00
Categoria: Tecnologia • Tags: celular, urgente, presente
```

## Estrutura do Banco de Dados

### Tabela: credit_cards

- `id`: Identificador único
- `user_id`: ID do usuário proprietário
- `name`: Nome do cartão
- `limit`: Limite disponível
- `closing_day`: Dia de fechamento
- `due_day`: Dia de vencimento
- `color`: Cor do cartão
- `created_at`: Data de criação
- `updated_at`: Data de atualização

### Tabela: credit_card_expenses

- `id`: Identificador único
- `user_id`: ID do usuário proprietário
- `credit_card_id`: ID do cartão usado
- `description`: Descrição do gasto
- `amount`: Valor do gasto
- `category`: Categoria do gasto
- `tags`: Array de tags
- `installment_number`: Número da parcela atual
- `total_installments`: Total de parcelas
- `date`: Data do gasto
- `created_at`: Data de criação
- `updated_at`: Data de atualização

## Segurança

- Todas as tabelas possuem Row Level Security (RLS) habilitado
- Usuários só podem acessar seus próprios dados
- Políticas de segurança para SELECT, INSERT, UPDATE e DELETE
- Validação de dados no frontend e backend

## Próximas Funcionalidades

- [ ] Relatórios mensais de gastos
- [ ] Alertas de vencimento próximo
- [ ] Cálculo automático de faturas
- [ ] Integração com extratos bancários
- [ ] Análise de gastos por categoria
- [ ] Metas de gastos por cartão

## Suporte

Para dúvidas ou problemas, consulte a documentação do projeto ou entre em contato com a equipe de desenvolvimento.
