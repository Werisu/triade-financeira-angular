-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

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
