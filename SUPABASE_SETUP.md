# Configuração do Supabase

## Visão Geral

O Supabase foi configurado no projeto Angular com as seguintes funcionalidades:

- Autenticação de usuários (login, registro, logout)
- Configuração de ambiente para desenvolvimento e produção
- Persistência de sessão no localStorage
- Serviços para gerenciar transações e metas financeiras

## Arquivos Configurados

### 1. Serviço Principal

- **Arquivo**: `src/services/supabase.service.ts`
- **Funcionalidades**:
  - Configuração do cliente Supabase
  - Métodos de autenticação (signIn, signUp, signOut)
  - Verificação de usuário atual
  - Monitoramento de mudanças de estado de autenticação

### 2. Serviços de Dados

- **TransactionService**: `src/services/transaction.service.ts`
  - Gerenciamento de transações financeiras
  - CRUD completo para transações
- **GoalService**: `src/services/goal.service.ts`
  - Gerenciamento de metas financeiras
  - CRUD completo para metas

### 3. Configuração de Ambiente

- **Desenvolvimento**: `src/environments/environment.ts`
- **Produção**: `src/environments/environment.prod.ts`

## Como Usar

### 1. Injetar o Serviço

```typescript
import { SupabaseService } from '../services/supabase.service';

constructor(private supabaseService: SupabaseService) {}
```

### 2. Autenticação

```typescript
// Login
const { data, error } = await this.supabaseService.signIn(email, password);

// Registro
const { data, error } = await this.supabaseService.signUp(email, password);

// Logout
const { error } = await this.supabaseService.signOut();

// Verificar usuário atual
const user = await this.supabaseService.getCurrentUser();

// Verificar se está autenticado
const isAuth = await this.supabaseService.isAuthenticated();
```

### 3. Monitorar Mudanças de Autenticação

```typescript
ngOnInit() {
  this.supabaseService.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    // Atualizar estado da aplicação
  });
}
```

### 4. Gerenciar Transações

```typescript
import { TransactionService } from '../services/transaction.service';

constructor(private transactionService: TransactionService) {}

// Carregar transações
await this.transactionService.loadTransactions(userId);

// Adicionar transação
const result = await this.transactionService.addTransaction({
  user_id: userId,
  amount: 100,
  description: 'Salário',
  category: 'Renda',
  type: 'income',
  date: '2024-01-15'
});

// Observar mudanças
this.transactionService.transactions$.subscribe(transactions => {
  console.log('Transações atualizadas:', transactions);
});
```

### 5. Gerenciar Metas

```typescript
import { GoalService } from '../services/goal.service';

constructor(private goalService: GoalService) {}

// Carregar metas
await this.goalService.loadGoals(userId);

// Adicionar meta
const result = await this.goalService.addGoal({
  user_id: userId,
  title: 'Viagem para Europa',
  target_amount: 10000,
  current_amount: 0,
  deadline: '2024-12-31'
});

// Observar mudanças
this.goalService.goals$.subscribe(goals => {
  console.log('Metas atualizadas:', goals);
});
```

### 6. Acessar o Cliente Diretamente

```typescript
const supabase = this.supabaseService.getClient();

// Exemplo: buscar transações
const { data, error } = await supabase.from('transactions').select('*').eq('user_id', userId);
```

## Credenciais

As credenciais do Supabase estão configuradas nos arquivos de ambiente:

- **URL**: `https://mmpsnydvhbardmioqztf.supabase.co`
- **Chave Anônima**: Configurada nos arquivos de ambiente

## Status da Configuração

✅ **Concluído**:

- Configuração básica do Supabase
- Autenticação de usuários
- Serviços de transações e metas
- Configuração de ambiente
- Compilação bem-sucedida

⚠️ **Observações**:

- A tipagem TypeScript foi simplificada para resolver problemas de compilação
- Os tipos podem ser refinados posteriormente conforme necessário

## Próximos Passos

1. Configurar as tabelas no Supabase Dashboard
2. Implementar RLS (Row Level Security) para segurança
3. Criar funções personalizadas no Supabase
4. Implementar upload de arquivos (se necessário)
5. Refinar a tipagem TypeScript conforme necessário

## Estrutura do Banco

### Tabela: profiles

- `id` (uuid, primary key)
- `email` (text)
- `full_name` (text, nullable)
- `avatar_url` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Tabela: transactions

- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `amount` (numeric)
- `description` (text)
- `category` (text)
- `type` (enum: 'income' | 'expense')
- `date` (date)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Tabela: goals

- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `title` (text)
- `target_amount` (numeric)
- `current_amount` (numeric)
- `deadline` (date, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)
