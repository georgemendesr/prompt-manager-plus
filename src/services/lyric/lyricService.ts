import { supabase } from "../base/supabaseService";

export const fetchLyrics = async () => {
  return supabase.from('lyrics').select('*').order('created_at', { ascending: false });
};

export const addLyricToDb = async (lyric: { text: string; title?: string; artist?: string }) => {
  return supabase
    .from('lyrics')
    .insert([{ text: lyric.text.trim(), title: lyric.title?.trim() || null, artist: lyric.artist?.trim() || null }])
    .select()
    .single();
};

export const updateLyricInDb = async (id: string, lyric: { text?: string; title?: string; artist?: string }) => {
  return supabase
    .from('lyrics')
    .update({ text: lyric.text?.trim(), title: lyric.title?.trim(), artist: lyric.artist?.trim() })
    .eq('id', id);
};

export const deleteLyricFromDb = async (id: string) => {
  return supabase.from('lyrics').delete().eq('id', id);
};
