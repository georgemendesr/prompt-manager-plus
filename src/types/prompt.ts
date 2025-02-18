
export type Prompt = {
  id: string;
  text: string;
  category: string;
  rating: number;
  comments: string[];
  createdAt: Date;
  selected?: boolean;
  isEditing?: boolean;
};

export type Category = {
  id: string;
  name: string;
  prompts: Prompt[];
};

export type MusicStructure = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  effect: string;
};
