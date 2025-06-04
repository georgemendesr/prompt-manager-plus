import { supabase } from "../base/supabaseService";

export const fetchLinks = async () => {
  return supabase.from('links').select('*').order('created_at', { ascending: false });
};

export const addLinkToDb = async (link: { url: string; description?: string }) => {
  return supabase
    .from('links')
    .insert([{ url: link.url.trim(), description: link.description?.trim() || null }])
    .select()
    .single();
};

export const updateLinkInDb = async (id: string, link: { url?: string; description?: string }) => {
  return supabase
    .from('links')
    .update({ url: link.url?.trim(), description: link.description?.trim() })
    .eq('id', id);
};

export const deleteLinkFromDb = async (id: string) => {
  return supabase.from('links').delete().eq('id', id);
};
