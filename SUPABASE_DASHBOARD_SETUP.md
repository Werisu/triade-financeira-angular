# Configuração das Tabelas no Supabase Dashboard

## 📋 Passo a Passo para Configurar o Banco de Dados

### 1. Acessar o Supabase Dashboard

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione o projeto `mmpsnydvhbardmioqztf`

### 2. Navegar para o SQL Editor

1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New query"** para criar uma nova consulta

### 3. Executar o Schema SQL

1. Copie todo o conteúdo do arquivo `src/supabase/schema.sql`
2. Cole no editor SQL
3. Clique em **"Run"** para executar o script

### 4. Verificar as Tabelas Criadas

1. No menu lateral, clique em **"Table Editor"**
2. Você deve ver as seguintes tabelas:
   - `profiles`
   - `transactions`
   - `goals`

### 5. Verificar as Políticas RLS

1. No menu lateral, clique em **"Authentication"** → **"Policies"**
2. Verifique se as políticas foram criadas para cada tabela:
   - **profiles**: 3 políticas (SELECT, INSERT, UPDATE)
   - **transactions**: 4 políticas (SELECT, INSERT, UPDATE, DELETE)
   - **goals**: 4 políticas (SELECT, INSERT, UPDATE, DELETE)

## 🗄️ Estrutura das Tabelas

### Tabela: `profiles`

| Campo          | Tipo      | Descrição                                  |
| -------------- | --------- | ------------------------------------------ |
| `id`           | uuid      | Chave primária (gerada automaticamente)    |
| `user_id`      | uuid      | ID do usuário (referência para auth.users) |
| `display_name` | text      | Nome de exibição do usuário                |
| `avatar_url`   | text      | URL do avatar do usuário                   |
| `created_at`   | timestamp | Data de criação                            |
| `updated_at`   | timestamp | Data da última atualização                 |

### Tabela: `transactions`

| Campo         | Tipo      | Descrição                                  |
| ------------- | --------- | ------------------------------------------ |
| `id`          | uuid      | Chave primária (gerada automaticamente)    |
| `user_id`     | uuid      | ID do usuário (referência para auth.users) |
| `type`        | text      | Tipo: 'income' ou 'expense'                |
| `amount`      | numeric   | Valor da transação (deve ser > 0)          |
| `category`    | text      | Categoria da transação                     |
| `description` | text      | Descrição opcional                         |
| `date`        | date      | Data da transação                          |
| `created_at`  | timestamp | Data de criação                            |
| `updated_at`  | timestamp | Data da última atualização                 |

### Tabela: `goals`

| Campo        | Tipo      | Descrição                                             |
| ------------ | --------- | ----------------------------------------------------- |
| `id`         | uuid      | Chave primária (gerada automaticamente)               |
| `user_id`    | uuid      | ID do usuário (referência para auth.users)            |
| `name`       | text      | Nome da meta                                          |
| `target`     | numeric   | Valor alvo (deve ser > 0)                             |
| `current`    | numeric   | Valor atual (deve ser >= 0)                           |
| `type`       | text      | Tipo: 'emergency', 'investment', 'recovery', 'custom' |
| `created_at` | timestamp | Data de criação                                       |
| `updated_at` | timestamp | Data da última atualização                            |

## 🔒 Segurança (RLS)

### Políticas Implementadas

- **Perfis**: Usuários só podem ver/editar seu próprio perfil
- **Transações**: Usuários só podem gerenciar suas próprias transações
- **Metas**: Usuários só podem gerenciar suas próprias metas

### Funcionalidades de Segurança

- **Row Level Security (RLS)** habilitado em todas as tabelas
- **Foreign Keys** com `ON DELETE CASCADE` para manter integridade
- **Check Constraints** para validar dados (ex: valores positivos)
- **Triggers** para atualizar automaticamente o campo `updated_at`

## 📊 Índices para Performance

- `idx_profiles_user_id` - Busca rápida por usuário
- `idx_transactions_user_id` - Busca rápida de transações por usuário
- `idx_transactions_date` - Ordenação rápida por data
- `idx_goals_user_id` - Busca rápida de metas por usuário

## 🧪 Testar a Configuração

### 1. Criar um Usuário de Teste

1. No menu lateral, clique em **"Authentication"** → **"Users"**
2. Clique em **"Add user"**
3. Preencha email e senha
4. Clique em **"Create user"**

### 2. Testar as Políticas

1. Faça login com o usuário criado
2. Tente inserir dados nas tabelas
3. Verifique se só consegue ver/editar seus próprios dados

## 🚨 Solução de Problemas

### Erro: "relation does not exist"

- Verifique se o script SQL foi executado completamente
- Recrie as tabelas se necessário

### Erro: "permission denied"

- Verifique se as políticas RLS estão ativas
- Confirme se o usuário está autenticado

### Erro: "foreign key constraint"

- Verifique se a tabela `auth.users` existe
- Confirme se as referências estão corretas

## ✅ Checklist de Verificação

- [ ] Tabelas criadas com sucesso
- [ ] Políticas RLS configuradas
- [ ] Índices criados
- [ ] Triggers funcionando
- [ ] Usuário de teste criado
- [ ] Políticas de segurança testadas
- [ ] Projeto Angular compilando sem erros

## 🔄 Próximos Passos

1. **Testar a aplicação** com as tabelas configuradas
2. **Implementar componentes** para gerenciar transações e metas
3. **Adicionar validações** adicionais se necessário
4. **Monitorar performance** e ajustar índices conforme necessário
