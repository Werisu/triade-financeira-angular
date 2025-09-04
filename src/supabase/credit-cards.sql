-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.credit_card_expenses
(
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      credit_card_id uuid NOT NULL,
      description text NOT NULL,
      amount numeric NOT NULL,
      category text NOT NULL,
      tags ARRAY DEFAULT '{}'
      ::text[],
  installment_number integer CHECK
      (installment_number >= 1),
  total_installments integer CHECK
      (total_installments >= 1),
  date date NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending' CHECK
      (payment_status = ANY
      (ARRAY['pending', 'paid'])),
  allocation text CHECK
      (allocation = ANY
      (ARRAY['needs', 'wants', 'savings']) OR allocation IS NULL),
  created_at timestamp
      with time zone DEFAULT now
      (),
  updated_at timestamp
      with time zone DEFAULT now
      (),
  CONSTRAINT credit_card_expenses_pkey PRIMARY KEY
      (id),
  CONSTRAINT credit_card_expenses_user_id_fkey FOREIGN KEY
      (user_id) REFERENCES auth.users
      (id),
  CONSTRAINT credit_card_expenses_credit_card_id_fkey FOREIGN KEY
      (credit_card_id) REFERENCES public.credit_cards
      (id)
);
      CREATE TABLE public.credit_cards
      (
            id uuid NOT NULL DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL,
            name text NOT NULL,
            credit_limit numeric NOT NULL,
            closing_day integer NOT NULL CHECK (closing_day >= 1 AND closing_day <= 31),
            due_day integer NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
            color text NOT NULL DEFAULT '#3B82F6'
            ::text,
  created_at timestamp
            with time zone DEFAULT now
            (),
  updated_at timestamp
            with time zone DEFAULT now
            (),
  CONSTRAINT credit_cards_pkey PRIMARY KEY
            (id),
  CONSTRAINT credit_cards_user_id_fkey FOREIGN KEY
            (user_id) REFERENCES auth.users
            (id)
);
            CREATE TABLE public.goals
            (
                  id uuid NOT NULL DEFAULT gen_random_uuid(),
                  user_id uuid NOT NULL,
                  name text NOT NULL,
                  target numeric NOT NULL CHECK (target > 0
                  ::numeric),
  current numeric NOT NULL DEFAULT 0 CHECK
                  (current >= 0::numeric),
  type text NOT NULL CHECK
                  (type = ANY
                  (ARRAY['emergency'::text, 'investment'::text, 'recovery'::text, 'custom'::text])),
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
                  (id)
);
                  CREATE TABLE public.profiles
                  (
                        id uuid NOT NULL DEFAULT gen_random_uuid(),
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
                        (id)
);
                        CREATE TABLE public.transactions
                        (
                              id uuid NOT NULL DEFAULT gen_random_uuid(),
                              user_id uuid NOT NULL,
                              type text NOT NULL CHECK (type = ANY (ARRAY['income'::text, 'expense'::text])
                        )
                        ,
  amount numeric NOT NULL CHECK
                        (amount > 0::numeric),
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
                        (id)
);
