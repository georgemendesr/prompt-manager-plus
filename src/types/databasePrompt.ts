/**
 * Tipo que representa um prompt no banco de dados Supabase
 */
export type DatabasePrompt = {
  id: string;
  text: string;
  category_id: string;
  rating: number;
  background_color?: string;
  tags?: string[];
  created_at: string;
  rating_average?: number;
  rating_count?: number;
  copy_count?: number;
  simple_id?: string;
  translated_text?: string;
}; 