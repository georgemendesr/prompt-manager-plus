ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];
