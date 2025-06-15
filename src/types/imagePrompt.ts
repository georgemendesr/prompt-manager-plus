<<<<<<< HEAD
export interface ImagePrompt {
  id: string;
  title?: string;
  category_id: string;
  type: 'photo' | 'video' | 'design';
  blocks: PromptBlock[];
  ai_hint?: string;
  created_at?: string;
}

export interface PromptBlock {
  label: string;
  text: string;
}

export interface ImagePromptInsert {
  title: string;
  category_id: string;
  type: 'photo' | 'video' | 'design';
  blocks: PromptBlock[];
  ai_hint?: string;
}

export type ImagePromptUpdate = Partial<ImagePromptInsert>;

// Reexportar PromptBlock para reutilização
export { PromptBlock };
=======

export type ImagePrompt = {
  id: string;
  category_id: string;
  title: string;
  body: string;
  tags: string[];
  favorite: boolean;
  score: number;
  user_id?: string;
  created_at: string;
  updated_at: string;
};

export type ImagePromptInsert = Omit<ImagePrompt, 'id' | 'created_at' | 'updated_at'>;
export type ImagePromptUpdate = Partial<ImagePromptInsert>;
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
