
export type Prompt = {
  id: string;
  text: string;
  category: string;
  rating: number; // Pontuação de votos
  comments: string[];
  createdAt: Date;
  selected?: boolean;
  isEditing?: boolean;
  backgroundColor?: string;
  score?: number; // Nova propriedade para pontuação de votos
  rank?: number; // Nova propriedade para posição no ranking
};

export type Category = {
  id: string;
  name: string;
  prompts: Prompt[];
  parentId?: string;
  subcategories?: Category[];
};

export type MusicStructure = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  effect: string;
};

export type WorkspaceItem = {
  id: string;
  text: string;
  createdAt: Date;
};
