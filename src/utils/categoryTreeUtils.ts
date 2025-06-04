
import type { Category } from "@/types/prompt";
import type { CategoryRecord } from "@/types/category";

export const buildCategoryTree = (
  categories: CategoryRecord[],
  parentId: string | null = null
): Category[] => {
  return categories
    .filter(category => category.parent_id === parentId)
    .map(category => ({
      id: category.id,
      name: category.name,
      parentId: category.parent_id,
      prompts: [],
      subcategories: buildCategoryTree(categories, category.id)
    }));
};

export const updateTreeWithPrompts = (newTree: Category[], oldCategories: Category[]): Category[] => {
  return newTree.map(category => {
    const oldCategory = oldCategories.find(c => c.id === category.id);
    return {
      ...category,
      prompts: oldCategory?.prompts || [],
      subcategories: category.subcategories ? 
        updateTreeWithPrompts(category.subcategories, oldCategories.flatMap(c => c.subcategories || [])) : 
        []
    };
  });
};

export const removeCategoryFromTree = (categories: Category[], id: string): Category[] => {
  return categories.filter(category => {
    if (category.id === id) return false;
    if (category.subcategories?.length) {
      category.subcategories = removeCategoryFromTree(category.subcategories, id);
    }
    return true;
  });
};
