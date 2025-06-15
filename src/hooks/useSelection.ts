
import type { Category } from "@/types/prompt";

export const useSelection = (categories: Category[], setCategories: (categories: Category[]) => void) => {
  const togglePromptSelection = (promptId: string, selected: boolean) => {
    console.log("Toggling prompt selection:", promptId, selected);
    setCategories(
      categories.map((category) => ({
        ...category,
        prompts: category.prompts.map((prompt) =>
          prompt.id === promptId ? { ...prompt, selected } : prompt
        ),
        subcategories: category.subcategories?.map(subcat => ({
          ...subcat,
          prompts: subcat.prompts.map((prompt) =>
            prompt.id === promptId ? { ...prompt, selected } : prompt
          )
        }))
      }))
    );
  };

  const toggleSelectAll = (categoryName: string, selected: boolean) => {
    console.log("Toggling select all:", categoryName, selected);
    setCategories(
      categories.map((category) => {
        if (category.name === categoryName) {
          return {
            ...category,
            prompts: category.prompts.map((prompt) => ({
              ...prompt,
              selected,
            })),
            subcategories: category.subcategories?.map(subcat => ({
              ...subcat,
              prompts: subcat.prompts.map((prompt) => ({
                ...prompt,
                selected,
              }))
            }))
          };
        }
        return category;
      })
    );
  };

  return {
    togglePromptSelection,
    toggleSelectAll
  };
};
