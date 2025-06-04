
import { supabase } from "../base/supabaseService";
import type { Lyric } from "@/types/lyric";

export const fetchLyrics = async () => {
  try {
    return await supabase
      .from('lyrics')
      .select('*')
      .order('created_at', { ascending: false });
  } catch (error) {
    console.error('Erro ao buscar letras:', error);
    return { data: null, error };
  }
};

export const addLyric = async (lyric: Omit<Lyric, 'id' | 'created_at'>) => {
  return await supabase
    .from('lyrics')
    .insert({ title: lyric.title, content: lyric.content })
    .select()
    .single();
};

export const addLyricToDb = addLyric; // Alias for compatibility

export const updateLyric = async (id: string, lyric: Partial<Omit<Lyric, 'id' | 'created_at'>>) => {
  return await supabase
    .from('lyrics')
    .update({ title: lyric.title, content: lyric.content })
    .eq('id', id);
};

export const deleteLyric = async (id: string) => {
  return await supabase
    .from('lyrics')
    .delete()
    .eq('id', id);
};

export const deleteLyricFromDb = deleteLyric; // Alias for compatibility
