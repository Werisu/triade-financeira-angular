# Tríade Financeira - Angular

Uma aplicação moderna para controle de finanças pessoais desenvolvida em Angular v20, convertida do projeto React original.

## 🚀 Funcionalidades

- **Autenticação**: Sistema de login e cadastro de usuários
- **Dashboard Financeiro**: Visão geral das finanças com cards informativos
- **Transações**: Gerenciamento de receitas e despesas
- **Metas Financeiras**: Acompanhamento de objetivos financeiros
- **Interface Responsiva**: Design adaptável para diferentes dispositivos
- **Tema Escuro/Claro**: Suporte a múltiplos temas

## 🛠️ Tecnologias

- **Angular 20**: Framework principal
- **TypeScript**: Linguagem de programação
- **Tailwind CSS**: Framework de estilos
- **Supabase**: Backend como serviço (BaaS)
- **Chart.js**: Gráficos e visualizações
- **Angular Material**: Componentes de UI

## 📦 Instalação

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd triade-financeira-angular
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

   - Copie o arquivo `src/environments/environment.ts`
   - Configure suas credenciais do Supabase

4. Execute o projeto:

```bash
npm start
```

## 🔧 Configuração do Supabase

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Configure as tabelas necessárias:
   - `users` (gerenciada automaticamente pelo Supabase Auth)
   - `transactions`
   - `goals`
4. Copie as credenciais para o arquivo de ambiente

## 📱 Estrutura do Projeto

```
src/
├── app/
│   ├── components/
│   │   ├── auth/
│   │   └── dashboard/
│   ├── services/
│   ├── types/
│   └── utils/
├── environments/
└── styles.css
```

## 🎨 Componentes Principais

- **AuthComponent**: Tela de autenticação
- **DashboardComponent**: Dashboard principal da aplicação
- **SupabaseService**: Serviço para comunicação com o backend
- **AuthService**: Gerenciamento de autenticação
- **TransactionService**: Gerenciamento de transações
- **GoalService**: Gerenciamento de metas

## 🚀 Scripts Disponíveis

- `npm start`: Inicia o servidor de desenvolvimento
- `npm run build`: Gera build de produção
- `npm run test`: Executa os testes
- `npm run lint`: Verifica o código com ESLint

## 📊 Banco de Dados

### Tabela: transactions

- `id`: UUID (chave primária)
- `user_id`: UUID (referência ao usuário)
- `description`: Texto da transação
- `amount`: Valor numérico
- `type`: 'income' ou 'expense'
- `category`: Categoria da transação
- `date`: Data da transação
- `created_at`: Timestamp de criação

### Tabela: goals

- `id`: UUID (chave primária)
- `user_id`: UUID (referência ao usuário)
- `title`: Título da meta
- `target_amount`: Valor objetivo
- `current_amount`: Valor atual
- `deadline`: Data limite
- `created_at`: Timestamp de criação

## 🔐 Autenticação

A aplicação utiliza o sistema de autenticação do Supabase com:

- Login por email/senha
- Cadastro de novos usuários
- Gerenciamento de sessão
- Proteção de rotas

## 🎯 Próximos Passos

- [ ] Implementar formulários de transação e metas
- [ ] Adicionar gráficos com Chart.js
- [ ] Implementar filtros e busca
- [ ] Adicionar notificações
- [ ] Implementar exportação de dados
- [ ] Adicionar testes unitários e de integração

## 📝 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia o guia de contribuição antes de submeter pull requests.

---

**Nota**: Este projeto foi convertido do React para Angular v20, mantendo a mesma funcionalidade e design.
