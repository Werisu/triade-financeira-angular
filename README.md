# FinWell - Aplicação Angular Moderna

Uma aplicação financeira pessoal construída com Angular 17 e design moderno de 2025, oferecendo controle completo sobre suas finanças com uma interface elegante e intuitiva.

## ✨ Características Principais

### 🎨 Design Moderno de 2025

- **Glassmorphism**: Efeitos de vidro translúcido com backdrop-blur
- **Gradientes Avançados**: Cores vibrantes e transições suaves
- **Animações Fluidas**: Transições e micro-interações responsivas
- **Sistema de Cores**: Paleta moderna com suporte a temas claro/escuro
- **Tipografia Avançada**: Fonte Inter para máxima legibilidade

### 🚀 Funcionalidades

- **Autenticação Segura**: Login e cadastro com Supabase
- **Dashboard Inteligente**: Visão geral das finanças em tempo real
- **Gestão de Transações**: Adicione receitas e despesas com categorização
- **Metas Financeiras**: Defina e acompanhe objetivos financeiros
- **Estatísticas Avançadas**: Análises e relatórios detalhados

## 🛠️ Tecnologias

- **Frontend**: Angular 17 (Standalone Components)
- **Styling**: Tailwind CSS com configuração personalizada
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Deploy**: Vercel, Netlify ou similar

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

## 🎨 Sistema de Design

### Cores Principais

- **Primary**: Azul moderno (#0ea5e9)
- **Secondary**: Cinza elegante (#64748b)
- **Success**: Verde vibrante (#22c55e)
- **Warning**: Amarelo quente (#f59e0b)
- **Danger**: Vermelho impactante (#ef4444)

### Tipografia

- **Fonte Principal**: Inter (300-900)
- **Fonte Mono**: JetBrains Mono
- **Hierarquia**: Sistema de tamanhos escalonado

### Sombras e Efeitos

- **Soft**: Sombra sutil para elevação
- **Medium**: Sombra intermediária para cards
- **Large**: Sombra pronunciada para modais
- **Glow**: Efeito de brilho para elementos ativos

## 📱 Estrutura do Projeto

```
src/
├── app/
│   ├── components/
│   │   ├── auth/          # Autenticação com design moderno
│   │   ├── dashboard/     # Dashboard principal
│   │   ├── goal-form/     # Formulário de metas
│   │   └── transaction-form/ # Formulário de transações
│   ├── services/          # Serviços de dados
│   └── guards/            # Guards de rota
├── styles.css             # Estilos globais e utilitários
└── tailwind.config.js     # Configuração do Tailwind
```

## 🎯 Principais Melhorias de Design

### 1. Interface Glassmorphism

- Cards translúcidos com efeito de vidro
- Backdrop-blur para profundidade visual
- Bordas sutis com transparência

### 2. Sistema de Cores Moderno

- Paleta de cores harmoniosa e acessível
- Gradientes suaves e elegantes
- Estados visuais claros para diferentes ações

### 3. Animações e Transições

- Micro-interações responsivas
- Transições suaves entre estados
- Animações de entrada e saída
- Efeitos hover interativos

### 4. Componentes Redesenhados

- **Dashboard**: Cards interativos com métricas visuais
- **Formulários**: Campos modernos com ícones e validação
- **Navegação**: Header elegante com glassmorphism
- **Modais**: Overlays com backdrop-blur

### 5. Responsividade Avançada

- Design mobile-first
- Grid system flexível
- Breakpoints otimizados
- Componentes adaptativos

## 🎨 Componentes Principais

- **AuthComponent**: Tela de autenticação com design moderno
- **DashboardComponent**: Dashboard principal com cards interativos
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

- [ ] Implementar gráficos interativos
- [ ] Adicionar modo escuro
- [ ] Criar sistema de notificações
- [ ] Implementar exportação de relatórios
- [ ] Adicionar mais categorias de transações

## 📝 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia o guia de contribuição antes de submeter pull requests.

---

**FinWell** - Transformando o controle financeiro em uma experiência visual excepcional ✨
