-- Tabela para contas bancárias
CREATE TABLE public.bank_accounts
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    bank_name text NOT NULL,
    account_type text NOT NULL CHECK (account_type IN ('checking', 'savings', 'investment')),
    current_balance numeric NOT NULL DEFAULT 0,
    color text NOT NULL DEFAULT '#3B82F6',
    created_at timestamp
    with time zone DEFAULT now
    (),
  updated_at timestamp
    with time zone DEFAULT now
    (),
  CONSTRAINT bank_accounts_pkey PRIMARY KEY
    (id),
  CONSTRAINT bank_accounts_user_id_fkey FOREIGN KEY
    (user_id) REFERENCES auth.users
    (id)
);

    -- Função para atualizar updated_at automaticamente
    CREATE OR REPLACE FUNCTION update_updated_at_column
    ()
RETURNS TRIGGER AS $$
    BEGIN
  NEW.updated_at = now
    ();
    RETURN NEW;
    END;
$$ language 'plpgsql';

    -- Trigger para atualizar updated_at automaticamente
    CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE
    UPDATE ON public.bank_accounts
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column
    ();

    -- RLS (Row Level Security) para contas bancárias
    ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

    -- Política para usuários só verem suas próprias contas
    CREATE POLICY "Users can view their own bank accounts" ON public.bank_accounts
  FOR
    SELECT USING (auth.uid() = user_id);

    -- Política para usuários só criarem contas para si mesmos
    CREATE POLICY "Users can create their own bank accounts" ON public.bank_accounts
  FOR
    INSERT WITH CHECK (auth.uid() =
    user_id);

    -- Política para usuários só atualizarem suas próprias contas
    CREATE POLICY "Users can update their own bank accounts" ON public.bank_accounts
  FOR
    UPDATE USING (auth.uid()
    = user_id);

    -- Política para usuários só deletarem suas próprias contas
    CREATE POLICY "Users can delete their own bank accounts" ON public.bank_accounts
  FOR
    DELETE USING (auth.uid
    () = user_id);
