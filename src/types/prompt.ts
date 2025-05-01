
export type Prompt = {
  id: string;
  text: string;
  category: string;
  rating: number; // Manteremos para compatibilidade, mas agora usaremos como score
  comments: string[];
  createdAt: Date;
  selected?: boolean;
  isEditing?: boolean;
  backgroundColor?: string;
  score?: number; // Nova propriedade para pontuação de votos
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
