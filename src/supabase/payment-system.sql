-- Adicionar coluna payment_status na tabela transactions
ALTER TABLE public.transactions
ADD COLUMN payment_status text NOT NULL DEFAULT 'pending'
CHECK
(payment_status IN
('pending', 'paid'));

-- Adicionar coluna payment_status na tabela credit_card_expenses
ALTER TABLE public.credit_card_expenses
ADD COLUMN payment_status text NOT NULL DEFAULT 'pending'
CHECK
(payment_status IN
('pending', 'paid'));

-- Criar tabela para pagamentos de fatura de cartão de crédito
CREATE TABLE public.credit_card_payments
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    credit_card_id uuid NOT NULL,
    amount numeric NOT NULL,
    payment_date date NOT NULL,
    description text NOT NULL,
    created_at timestamp
    with time zone DEFAULT now
    (),
  updated_at timestamp
    with time zone DEFAULT now
    (),
  CONSTRAINT credit_card_payments_pkey PRIMARY KEY
    (id),
  CONSTRAINT credit_card_payments_user_id_fkey FOREIGN KEY
    (user_id) REFERENCES auth.users
    (id),
  CONSTRAINT credit_card_payments_credit_card_id_fkey FOREIGN KEY
    (credit_card_id) REFERENCES public.credit_cards
    (id)
);

    -- Trigger para atualizar updated_at automaticamente na tabela credit_card_payments
    CREATE TRIGGER update_credit_card_payments_updated_at
  BEFORE
    UPDATE ON public.credit_card_payments
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column
    ();

    -- RLS (Row Level Security) para credit_card_payments
    ALTER TABLE public.credit_card_payments ENABLE ROW LEVEL SECURITY;

    -- Políticas para credit_card_payments
    CREATE POLICY "Users can view their own credit card payments" ON public.credit_card_payments
  FOR
    SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can create their own credit card payments" ON public.credit_card_payments
  FOR
    INSERT WITH CHECK (auth.uid() =
    user_id);

    CREATE POLICY "Users can update their own credit card payments" ON public.credit_card_payments
  FOR
    UPDATE USING (auth.uid()
    = user_id);

    CREATE POLICY "Users can delete their own credit card payments" ON public.credit_card_payments
  FOR
    DELETE USING (auth.uid
    () = user_id);
