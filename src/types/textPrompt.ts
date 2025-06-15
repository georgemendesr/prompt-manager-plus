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

export type TextPromptUpdate = Partial<TextPromptInsert>;
