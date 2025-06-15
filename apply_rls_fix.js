// Script para aplicar políticas RLS no Supabase
import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase (use as mesmas do create_tables.js)
const SUPABASE_URL = 'https://nescglrcustycshemauu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lc2NnbHJjdXN0eWNzaGVtYXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4NTE4MjIsImV4cCI6MjA1NTQyNzgyMn0.NoL0_YlJQ09lnOHFV0cYcy_g6XXkfvnqq6jl-TsR-Rc';

// Inicializar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Função para aplicar as políticas RLS
async function applyRLSPolicies() {
  try {
    console.log('Aplicando políticas RLS para prompt_ratings...');
    
    // Executar SQL para aplicar políticas RLS
    const { error } = await supabase.rpc('execute_sql', {
      sql: `
        -- Habilitar políticas de segurança de linha para prompt_ratings (caso ainda não esteja habilitado)
        ALTER TABLE public.prompt_ratings ENABLE ROW LEVEL SECURITY;
        
        -- Remover políticas existentes para evitar conflitos
        DROP POLICY IF EXISTS "allow_anonymous_ratings" ON public.prompt_ratings;
        DROP POLICY IF EXISTS "allow_public_read_ratings" ON public.prompt_ratings;
        DROP POLICY IF EXISTS "allow_owner_update_ratings" ON public.prompt_ratings;
        DROP POLICY IF EXISTS "allow_owner_delete_ratings" ON public.prompt_ratings;
        
        -- Criar política que permite inserções anônimas
        CREATE POLICY "allow_anonymous_ratings" ON public.prompt_ratings
          FOR INSERT WITH CHECK (true);
        
        -- Criar política que permite leitura para todos
        CREATE POLICY "allow_public_read_ratings" ON public.prompt_ratings
          FOR SELECT USING (true);
        
        -- Criar política que permite atualizações para o proprietário ou para avaliações anônimas
        CREATE POLICY "allow_owner_update_ratings" ON public.prompt_ratings
          FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
        
        -- Criar política que permite exclusões para o proprietário ou para avaliações anônimas
        CREATE POLICY "allow_owner_delete_ratings" ON public.prompt_ratings
          FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);
      `
    });
    
    if (error) {
      console.error('Erro ao aplicar políticas RLS:', error);
      return false;
    }
    
    console.log('✅ Políticas RLS aplicadas com sucesso!');
    return true;
  } catch (err) {
    console.error('Erro ao aplicar políticas RLS:', err);
    return false;
  }
}

// Executar o script
applyRLSPolicies()
  .then(() => {
    console.log('Script concluído');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro ao executar script:', error);
    process.exit(1);
  }); 