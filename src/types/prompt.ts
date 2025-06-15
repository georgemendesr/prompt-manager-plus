export type Prompt = {
  id: string;
  text: string;
  category: string;
  rating: number; // Pontuação de votos (sistema antigo)
  comments: string[];
  tags: string[];
  createdAt: Date;
  selected?: boolean;
  isEditing?: boolean;
  backgroundColor?: string;
  score?: number; // Nova propriedade para pontuação de votos
  rank?: number; // Nova propriedade para posição no ranking
  // Novas propriedades para o sistema de estrelas
  ratingAverage?: number; // Média das avaliações por estrelas
  ratingCount?: number; // Total de avaliações
  copyCount?: number; // Total de cópias
  uniqueId?: string; // ID único para exibição
<<<<<<< HEAD
  translatedText?: string | undefined; // Texto traduzido para exibição na interface - totalmente opcional
=======
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
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
