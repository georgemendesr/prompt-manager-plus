
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
