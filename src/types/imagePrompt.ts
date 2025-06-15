
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
