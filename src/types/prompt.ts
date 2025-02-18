
export type Prompt = {
  id: string;
  text: string;
  category: string;
  rating: number;
  comments: string[];
  createdAt: Date;
  selected?: boolean;
  hashtags?: string[];
};

export type Category = {
  id: string;
  name: string;
  prompts: Prompt[];
};
