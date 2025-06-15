
export interface Prompt {
  id: string;
  text: string;
  category: string;
  rating: number;
  tags: string[];
  backgroundColor?: string;
  comments: string[];
  createdAt: Date;
  selected: boolean;
  ratingAverage: number;
  ratingCount: number;
  copyCount: number;
  uniqueId: string;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  prompts: Prompt[];
  subcategories?: Category[];
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  promptId: string;
}

export interface PromptFormData {
  text: string;
  categoryId: string;
  tags: string[];
  backgroundColor?: string;
}

export interface CategoryFormData {
  name: string;
  parentId?: string;
}

export interface PromptStats {
  totalPrompts: number;
  totalCategories: number;
  averageRating: number;
  topCategories: Array<{
    name: string;
    count: number;
  }>;
}

export interface SearchResult {
  prompt: Prompt;
  category: string;
  matchType: 'text' | 'tag' | 'category';
}
