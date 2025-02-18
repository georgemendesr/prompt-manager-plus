
export type Prompt = {
  id: string;
  text: string;
  category: string;
  rating: number;
  comments: string[];
  createdAt: Date;
  selected?: boolean;
};

export type Category = {
  id: string;
  name: string;
  prompts: Prompt[];
};
