-- Habilitar políticas de segurança de linha para prompt_ratings (caso ainda não esteja habilitado)
ALTER TABLE public.prompt_ratings ENABLE ROW LEVEL SECURITY;

-- Criar política que permite inserções anônimas
CREATE POLICY "allow_anonymous_ratings" ON public.prompt_ratings
  FOR INSERT WITH CHECK (true);

-- Criar política que permite leitura para todos
CREATE POLICY "allow_public_read_ratings" ON public.prompt_ratings
  FOR SELECT USING (true);

-- Criar política que permite atualizações para o proprietário
CREATE POLICY "allow_owner_update_ratings" ON public.prompt_ratings
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Criar política que permite exclusões para o proprietário
CREATE POLICY "allow_owner_delete_ratings" ON public.prompt_ratings
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL); 