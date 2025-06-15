<<<<<<< HEAD
export interface TextPrompt {
  id: string;
  title?: string;
  category_id: string;
  blocks: PromptBlock[];
  created_at?: string;
}

export interface PromptBlock {
  label: string;
  text: string;
}

export interface TextPromptInsert {
  title: string;
  category_id: string;
  blocks: PromptBlock[];
}

=======

export type TextPrompt = {
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

export type TextPromptInsert = Omit<TextPrompt, 'id' | 'created_at' | 'updated_at'>;
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
export type TextPromptUpdate = Partial<TextPromptInsert>;
