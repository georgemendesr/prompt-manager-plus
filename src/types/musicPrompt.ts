export interface MusicPrompt {
  id: string;
  text: string;
  category_id: string;
  created_at: string;
  title?: string;
  user_id?: string;
  rating?: number;
  simple_id?: string;
}

export interface MusicPromptInsert {
  text: string;
  category_id: string;
  title?: string;
} 