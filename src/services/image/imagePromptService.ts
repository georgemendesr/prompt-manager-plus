import { supabase } from "@/integrations/supabase/client";
import type { ImagePrompt, ImagePromptInsert, ImagePromptUpdate } from "@/types/imagePrompt";

export const fetchImagePrompts = async (): Promise<ImagePrompt[]> => {
  try {
    const { data, error } = await supabase
      .from('image_prompts' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Se a tabela não existir, retorna array vazio em vez de lançar erro
      if (error.message.includes('does not exist')) {
        console.warn('Tabela image_prompts não existe ainda. Retornando array vazio.');
        return [];
      }
      
      console.error('Erro ao buscar prompts de imagem:', error);
      throw new Error(`Erro ao buscar prompts de imagem: ${error.message}`);
    }

    return (data as any) || [];
  } catch (err) {
    console.error('Erro ao buscar prompts de imagem:', err);
    if (String(err).includes('does not exist')) {
      return [];
    }
    throw err;
  }
};

export const addImagePrompt = async (prompt: ImagePromptInsert): Promise<ImagePrompt> => {
  try {
    const { data, error } = await supabase
      .from('image_prompts' as any)
      .insert(prompt)
      .select('*')
      .single();
    
    if (error) {
      // Se a tabela não existir, tentamos criá-la
      if (error.message.includes('does not exist')) {
        await createImagePromptsTable();
        
        // Tentar novamente após criar a tabela
        const { data: retryData, error: retryError } = await supabase
          .from('image_prompts' as any)
          .insert(prompt)
          .select('*')
          .single();
          
        if (retryError) {
          console.error('Erro ao adicionar prompt de imagem após criar tabela:', retryError);
          throw new Error(`Erro ao adicionar prompt de imagem: ${retryError.message}`);
        }
        
        return retryData as any;
      }
      
      console.error('Erro ao adicionar prompt de imagem:', error);
      throw new Error(`Erro ao adicionar prompt de imagem: ${error.message}`);
    }

    return data as any;
  } catch (err) {
    console.error('Erro ao adicionar prompt de imagem:', err);
    throw err;
  }
};

// Função para criar a tabela image_prompts se ela não existir
const createImagePromptsTable = async () => {
  try {
    const { error } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.image_prompts (
          id uuid primary key default gen_random_uuid(),
          category_id uuid references image_categories(id) on delete set null,
          title text,
          type text not null check (type in ('photo','video','design')),
          blocks jsonb not null default '[]'::jsonb,
          ai_hint text,
          created_at timestamptz default now()
        );
        
        ALTER TABLE public.image_prompts ENABLE ROW LEVEL SECURITY;
        
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'image_prompts' AND policyname = 'public_read'
          ) THEN
            CREATE POLICY "public_read" ON public.image_prompts
              FOR SELECT USING (true);
          END IF;
          
          IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'image_prompts' AND policyname = 'anon_insert'
          ) THEN
            CREATE POLICY "anon_insert" ON public.image_prompts
              FOR INSERT WITH CHECK (true);
          END IF;
        END
        $$;
      `
    });
    
    if (error) {
      console.error('Erro ao criar tabela image_prompts:', error);
      return false;
    }

    console.log('Tabela image_prompts criada com sucesso');
    return true;
  } catch (err) {
    console.error('Erro ao criar tabela image_prompts:', err);
    return false;
  }
};

export const updateImagePrompt = async (id: string, updates: ImagePromptUpdate): Promise<ImagePrompt> => {
  const { data, error } = await supabase
    .from('image_prompts' as any)
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Erro ao atualizar prompt de imagem:', error);
    throw new Error(`Erro ao atualizar prompt de imagem: ${error.message}`);
  }

  return data as any;
};

export const deleteImagePrompt = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('image_prompts' as any)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir prompt de imagem:', error);
    throw new Error(`Erro ao excluir prompt de imagem: ${error.message}`);
  }
}; 