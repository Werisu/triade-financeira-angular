-- Schema para o projeto Tríade Financeira
-- Execute este script no SQL Editor do Supabase Dashboard

-- Habilitar a extensão uuid-ossp se não estiver habilitada
CREATE EXTENSION
IF NOT EXISTS "uuid-ossp";

-- Tabela de perfis de usuário
CREATE TABLE public.profiles
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL UNIQUE,
    display_name text,
    avatar_url text,
    created_at timestamp
    with time zone NOT NULL DEFAULT now
    (),
  updated_at timestamp
    with time zone NOT NULL DEFAULT now
    (),
  CONSTRAINT profiles_pkey PRIMARY KEY
    (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY
    (user_id) REFERENCES auth.users
    (id) ON
    DELETE CASCADE
);

    -- Tabela de transações financeiras
    CREATE TABLE public.transactions
    (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        user_id uuid NOT NULL,
        type text NOT NULL CHECK (type = ANY (ARRAY['income', 'expense'])
    )
    ,
  amount numeric NOT NULL CHECK
    (amount > 0),
  category text NOT NULL,
  description text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp
    with time zone NOT NULL DEFAULT now
    (),
  updated_at timestamp
    with time zone NOT NULL DEFAULT now
    (),
  CONSTRAINT transactions_pkey PRIMARY KEY
    (id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY
    (user_id) REFERENCES auth.users
    (id) ON
    DELETE CASCADE
);

    -- Tabela de metas financeiras
    CREATE TABLE public.goals
    (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        user_id uuid NOT NULL,
        name text NOT NULL,
        target numeric NOT NULL CHECK (target > 0),
        current numeric NOT NULL DEFAULT 0 CHECK
        (current >= 0),
  type text NOT NULL CHECK
        (type = ANY
        (ARRAY['emergency', 'investment', 'recovery', 'custom'])),
  created_at timestamp
        with time zone NOT NULL DEFAULT now
        (),
  updated_at timestamp
        with time zone NOT NULL DEFAULT now
        (),
  CONSTRAINT goals_pkey PRIMARY KEY
        (id),
  CONSTRAINT goals_user_id_fkey FOREIGN KEY
        (user_id) REFERENCES auth.users
        (id) ON
        DELETE CASCADE
);

        -- Criar índices para melhor performance
        CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
        CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
        CREATE INDEX idx_transactions_date ON public.transactions(date);
        CREATE INDEX idx_goals_user_id ON public.goals(user_id);

        -- Função para atualizar o campo updated_at automaticamente
        CREATE OR REPLACE FUNCTION update_updated_at_column
        ()
RETURNS TRIGGER AS $$
        BEGIN
  NEW.updated_at = now
        ();
        RETURN NEW;
        END;
$$ language 'plpgsql';

        -- Triggers para atualizar updated_at automaticamente
        CREATE TRIGGER update_profiles_updated_at BEFORE
        UPDATE ON public.profiles
  FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column
        ();

        CREATE TRIGGER update_transactions_updated_at BEFORE
        UPDATE ON public.transactions
  FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column
        ();

        CREATE TRIGGER update_goals_updated_at BEFORE
        UPDATE ON public.goals
  FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column
        ();

        -- Políticas RLS (Row Level Security)
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

        -- Política para profiles: usuários só podem ver/editar seu próprio perfil
        CREATE POLICY "Users can view own profile" ON public.profiles
  FOR
        SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR
        INSERT WITH CHECK (auth.uid() =
        user_id);

        CREATE POLICY "Users can update own profile" ON public.profiles
  FOR
        UPDATE USING (auth.uid()
        = user_id);

        -- Política para transactions: usuários só podem ver/editar suas próprias transações
        CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR
        SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR
        INSERT WITH CHECK (auth.uid() =
        user_id);

        CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR
        UPDATE USING (auth.uid()
        = user_id);

        CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR
        DELETE USING (auth.uid
        () = user_id);

        -- Política para goals: usuários só podem ver/editar suas próprias metas
        CREATE POLICY "Users can view own goals" ON public.goals
  FOR
        SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert own goals" ON public.goals
  FOR
        INSERT WITH CHECK (auth.uid() =
        user_id);

        CREATE POLICY "Users can update own goals" ON public.goals
  FOR
        UPDATE USING (auth.uid()
        = user_id);

        CREATE POLICY "Users can delete own goals" ON public.goals
  FOR
        DELETE USING (auth.uid
        () = user_id);
