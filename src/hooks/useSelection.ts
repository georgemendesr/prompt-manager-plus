
import type { Category } from "@/types/prompt";

export const useSelection = (categories: Category[], setCategories: (categories: Category[]) => void) => {
  const togglePromptSelection = (promptId: string, selected: boolean) => {
    setCategories(
      categories.map((category) => ({
        ...category,
        prompts: category.prompts.map((prompt) =>
          prompt.id === promptId ? { ...prompt, selected } : prompt
        ),
      }))
    );
  };

  const toggleSelectAll = (categoryName: string, selected: boolean) => {
    setCategories(
      categories.map((category) =>
        category.name === categoryName
          ? {
              ...category,
              prompts: category.prompts.map((prompt) => ({
                ...prompt,
                selected,
              })),
            }
          : category
      )
    );
  };

  return {
    togglePromptSelection,
    toggleSelectAll
  };
};
