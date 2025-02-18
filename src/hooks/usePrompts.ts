
import type { Category, MusicStructure } from "@/types/prompt";
import { usePromptRating } from "./prompts/usePromptRating";
import { usePromptComments } from "./prompts/usePromptComments";
import { usePromptMove } from "./prompts/usePromptMove";

export const usePrompts = (
  categories: Category[], 
  setCategories: (categories: Category[]) => void,
  structures: MusicStructure[] = []
) => {
  const { ratePrompt } = usePromptRating(categories, setCategories);
  const { addComment } = usePromptComments(categories, setCategories);
  const { movePrompt } = usePromptMove(categories, setCategories);

  return {
    ratePrompt,
    addComment,
    movePrompt
  };
};
