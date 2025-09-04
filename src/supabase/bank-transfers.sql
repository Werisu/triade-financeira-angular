-- Tabela para transferências entre contas bancárias
CREATE TABLE public.bank_transfers
(
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  from_account_id uuid NOT NULL,
  to_account_id uuid NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  description text,
  transfer_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp
  with time zone DEFAULT now
  (),
    updated_at timestamp
  with time zone DEFAULT now
  (),
    CONSTRAINT bank_transfers_pkey PRIMARY KEY
  (id),
    CONSTRAINT bank_transfers_user_id_fkey FOREIGN KEY
  (user_id) REFERENCES auth.users
  (id) ON
  DELETE CASCADE,
    CONSTRAINT bank_transfers_from_account_id_fkey FOREIGN KEY
  (from_account_id) REFERENCES public.bank_accounts
  (id) ON
  DELETE CASCADE,
    CONSTRAINT bank_transfers_to_account_id_fkey FOREIGN KEY
  (to_account_id) REFERENCES public.bank_accounts
  (id) ON
  DELETE CASCADE,
    CONSTRAINT bank_transfers_different_accounts CHECK
  (from_account_id != to_account_id)
);

  -- Tabela para movimentações bancárias (entradas e saídas)
  CREATE TABLE public.bank_movements
  (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    bank_account_id uuid NOT NULL,
    type text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer_in', 'transfer_out')),
    amount numeric NOT NULL CHECK (amount > 0),
    description text,
    movement_date date NOT NULL DEFAULT CURRENT_DATE,
    transfer_id uuid,
    -- Referência para transferências
    created_at timestamp
    with time zone DEFAULT now
    (),
    updated_at timestamp
    with time zone DEFAULT now
    (),
    CONSTRAINT bank_movements_pkey PRIMARY KEY
    (id),
    CONSTRAINT bank_movements_user_id_fkey FOREIGN KEY
    (user_id) REFERENCES auth.users
    (id) ON
    DELETE CASCADE,
    CONSTRAINT bank_movements_bank_account_id_fkey FOREIGN KEY
    (bank_account_id) REFERENCES public.bank_accounts
    (id) ON
    DELETE CASCADE,
    CONSTRAINT bank_movements_transfer_id_fkey FOREIGN KEY
    (transfer_id) REFERENCES public.bank_transfers
    (id) ON
    DELETE
    SET NULL
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

    -- Triggers para atualizar updated_at automaticamente
    CREATE TRIGGER update_bank_transfers_updated_at
    BEFORE
    UPDATE ON public.bank_transfers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column
    ();

    CREATE TRIGGER update_bank_movements_updated_at
    BEFORE
    UPDATE ON public.bank_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column
    ();

    -- Função para processar transferências e atualizar saldos
    CREATE OR REPLACE FUNCTION process_bank_transfer
    ()
RETURNS TRIGGER AS $$
    BEGIN
      -- Criar movimentação de saída na conta origem
      INSERT INTO public.bank_movements
        (
        user_id,
        bank_account_id,
        type,
        amount,
        description,
        movement_date,
        transfer_id
        )
      VALUES
        (
          NEW.user_id,
          NEW.from_account_id,
          'transfer_out',
          NEW.amount,
          COALESCE(NEW.description, 'Transferência para ' || (SELECT name FROM public.bank_accounts WHERE id = NEW.to_account_id)),
          NEW.transfer_date,
          NEW.id
    );

      -- Criar movimentação de entrada na conta destino
      INSERT INTO public.bank_movements
        (
        user_id,
        bank_account_id,
        type,
        amount,
        description,
        movement_date,
        transfer_id
        )
      VALUES
        (
          NEW.user_id,
          NEW.to_account_id,
          'transfer_in',
          NEW.amount,
          COALESCE(NEW.description, 'Transferência de ' || (SELECT name FROM public.bank_accounts WHERE id = NEW.from_account_id)),
          NEW.transfer_date,
          NEW.id
    );

      -- Atualizar saldo da conta origem
      UPDATE public.bank_accounts
    SET current_balance = current_balance - NEW.amount
    WHERE id = NEW.from_account_id;

      -- Atualizar saldo da conta destino
      UPDATE public.bank_accounts
    SET current_balance = current_balance + NEW.amount
    WHERE id = NEW.to_account_id;

      RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Trigger para processar transferências
    CREATE TRIGGER process_bank_transfer_trigger
    AFTER
    INSERT ON public.
    bank_transfers
    FOR
    EACH
    ROW
    EXECUTE FUNCTION process_bank_transfer
    ();

    -- Função para processar movimentações e atualizar saldos
    CREATE OR REPLACE FUNCTION process_bank_movement
    ()
RETURNS TRIGGER AS $$
    BEGIN
      -- Atualizar saldo da conta baseado no tipo de movimentação
      IF NEW.type = 'deposit' OR NEW.type = 'transfer_in' THEN
      UPDATE public.bank_accounts
        SET current_balance = current_balance + NEW.amount
        WHERE id = NEW.bank_account_id;
      ELSIF NEW.type = 'withdrawal' OR NEW.type = 'transfer_out' THEN
      UPDATE public.bank_accounts
        SET current_balance = current_balance - NEW.amount
        WHERE id = NEW.bank_account_id;
    END
    IF;

    RETURN NEW;
    END;
$$ language 'plpgsql';

    -- Trigger para processar movimentações (apenas para depósitos e saques diretos)
    CREATE TRIGGER process_bank_movement_trigger
    AFTER
    INSERT ON public.
    bank_movements
    FOR
    EACH
    ROW
    WHEN
    (NEW.type IN
    ('deposit', 'withdrawal'))
    EXECUTE FUNCTION process_bank_movement
    ();

    -- RLS (Row Level Security)
    ALTER TABLE public.bank_transfers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.bank_movements ENABLE ROW LEVEL SECURITY;

    -- Políticas para bank_transfers
    CREATE POLICY "Users can view their own bank transfers" ON public.bank_transfers
    FOR
    SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can create their own bank transfers" ON public.bank_transfers
    FOR
    INSERT WITH CHECK (auth.uid() =
    user_id);

    CREATE POLICY "Users can update their own bank transfers" ON public.bank_transfers
    FOR
    UPDATE USING (auth.uid()
    = user_id);

    CREATE POLICY "Users can delete their own bank transfers" ON public.bank_transfers
    FOR
    DELETE USING (auth.uid
    () = user_id);

    -- Políticas para bank_movements
    CREATE POLICY "Users can view their own bank movements" ON public.bank_movements
    FOR
    SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can create their own bank movements" ON public.bank_movements
    FOR
    INSERT WITH CHECK (auth.uid() =
    user_id);

    CREATE POLICY "Users can update their own bank movements" ON public.bank_movements
    FOR
    UPDATE USING (auth.uid()
    = user_id);

    CREATE POLICY "Users can delete their own bank movements" ON public.bank_movements
    FOR
    DELETE USING (auth.uid
    () = user_id);

    -- Índices para performance
    CREATE INDEX idx_bank_transfers_user_id ON public.bank_transfers(user_id);
    CREATE INDEX idx_bank_transfers_date ON public.bank_transfers(transfer_date);
    CREATE INDEX idx_bank_transfers_from_account ON public.bank_transfers(from_account_id);
    CREATE INDEX idx_bank_transfers_to_account ON public.bank_transfers(to_account_id);

    CREATE INDEX idx_bank_movements_user_id ON public.bank_movements(user_id);
    CREATE INDEX idx_bank_movements_account_id ON public.bank_movements(bank_account_id);
    CREATE INDEX idx_bank_movements_date ON public.bank_movements(movement_date);
    CREATE INDEX idx_bank_movements_type ON public.bank_movements(type);
