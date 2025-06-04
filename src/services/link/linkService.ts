
import { supabase } from "../base/supabaseService";
import type { Link } from "@/types/link";

export const fetchLinks = async () => {
  try {
    return await supabase
      .from('links')
      .select('*')
      .order('created_at', { ascending: false });
  } catch (error) {
    console.error('Erro ao buscar links:', error);
    return { data: null, error };
  }
};

export const addLink = async (link: Omit<Link, 'id' | 'created_at'>) => {
  return await supabase
    .from('links')
    .insert({ url: link.url, description: link.description })
    .select()
    .single();
};

export const addLinkToDb = addLink; // Alias for compatibility

export const updateLink = async (id: string, link: Partial<Omit<Link, 'id' | 'created_at'>>) => {
  return await supabase
    .from('links')
    .update({ url: link.url, description: link.description })
    .eq('id', id);
};

export const deleteLink = async (id: string) => {
  return await supabase
    .from('links')
    .delete()
    .eq('id', id);
};

export const deleteLinkFromDb = deleteLink; // Alias for compatibility
