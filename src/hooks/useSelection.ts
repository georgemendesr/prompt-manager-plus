
import type { Category, Prompt } from "@/types/prompt";

export const useSelection = (categories: Category[], setCategories: (categories: Category[]) => void) => {
  const updatePromptsRecursively = (
    categories: Category[], 
    promptId: string, 
    updateFn: (prompt: Prompt) => Prompt
  ): Category[] => {
    return categories.map((category) => ({
      ...category,
      prompts: category.prompts.map((prompt) => 
        prompt.id === promptId ? updateFn(prompt) : prompt
      ),
      subcategories: category.subcategories ? 
        updatePromptsRecursively(category.subcategories, promptId, updateFn) : 
        category.subcategories
    }));
  };

  const updateCategoryPromptsRecursively = (
    categories: Category[], 
    categoryName: string, 
    updateFn: (prompt: Prompt) => Prompt
  ): Category[] => {
    return categories.map((category) => {
      if (category.name === categoryName) {
        return {
          ...category,
          prompts: category.prompts.map(updateFn),
          subcategories: category.subcategories?.map(subcat => ({
            ...subcat,
            prompts: subcat.prompts.map(updateFn)
          }))
        };
      }
      return {
        ...category,
        subcategories: category.subcategories ? 
          updateCategoryPromptsRecursively(category.subcategories, categoryName, updateFn) : 
          category.subcategories
      };
    });
  };

  const togglePromptSelection = (promptId: string, selected: boolean) => {
    console.log("🔘 Toggling prompt selection:", promptId, selected);
    
    const updatedCategories = updatePromptsRecursively(
      categories, 
      promptId, 
      (prompt) => ({ ...prompt, selected })
    );
    
    console.log("📝 Updated categories:", updatedCategories);
    setCategories(updatedCategories);
  };

  const toggleSelectAll = (categoryName: string, selected: boolean) => {
    console.log("🔘 Toggling select all for category:", categoryName, selected);
    
    const updatedCategories = updateCategoryPromptsRecursively(
      categories, 
      categoryName, 
      (prompt) => ({ ...prompt, selected })
    );
    
    console.log("📝 Updated categories for select all:", updatedCategories);
    setCategories(updatedCategories);
  };

  return {
    togglePromptSelection,
    toggleSelectAll
  };
};
