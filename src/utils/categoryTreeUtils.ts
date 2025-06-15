
import type { Category } from '@/types/prompt';

export const findCategoryById = (categories: Category[], id: string): Category | null => {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }
    if (category.subcategories) {
      const found = findCategoryById(category.subcategories, id);
      if (found) return found;
    }
  }
  return null;
};

export const findCategoryByName = (categories: Category[], name: string): Category | null => {
  for (const category of categories) {
    if (category.name.toLowerCase() === name.toLowerCase()) {
      return category;
    }
    if (category.subcategories) {
      const found = findCategoryByName(category.subcategories, name);
      if (found) return found;
    }
  }
  return null;
};

export const getAllCategoryIds = (categories: Category[]): string[] => {
  const ids: string[] = [];
  
  const traverse = (cats: Category[]) => {
    cats.forEach(cat => {
      ids.push(cat.id);
      if (cat.subcategories) {
        traverse(cat.subcategories);
      }
    });
  };
  
  traverse(categories);
  return ids;
};

export const getCategoryPath = (categories: Category[], categoryId: string): string[] => {
  const path: string[] = [];
  
  const findPath = (cats: Category[], targetId: string, currentPath: string[]): boolean => {
    for (const cat of cats) {
      const newPath = [...currentPath, cat.name];
      
      if (cat.id === targetId) {
        path.push(...newPath);
        return true;
      }
      
      if (cat.subcategories && findPath(cat.subcategories, targetId, newPath)) {
        return true;
      }
    }
    return false;
  };
  
  findPath(categories, categoryId, []);
  return path;
};

export const flattenCategories = (categories: Category[]): Category[] => {
  const flattened: Category[] = [];
  
  const traverse = (cats: Category[]) => {
    cats.forEach(cat => {
      // Create a copy without subcategories for the flattened array
      const flatCat: Category = {
        ...cat,
        subcategories: undefined
      };
      flattened.push(flatCat);
      
      if (cat.subcategories) {
        traverse(cat.subcategories);
      }
    });
  };
  
  traverse(categories);
  return flattened;
};

export const updateCategoryInTree = (
  categories: Category[], 
  categoryId: string, 
  updater: (category: Category) => Category
): Category[] => {
  return categories.map(category => {
    if (category.id === categoryId) {
      return updater(category);
    }
    
    if (category.subcategories) {
      return {
        ...category,
        subcategories: updateCategoryInTree(category.subcategories, categoryId, updater)
      };
    }
    
    return category;
  });
};

export const removeCategoryFromTree = (categories: Category[], categoryId: string): Category[] => {
  return categories
    .filter(category => category.id !== categoryId)
    .map(category => ({
      ...category,
      subcategories: category.subcategories 
        ? removeCategoryFromTree(category.subcategories, categoryId)
        : undefined
    }));
};

export const addCategoryToTree = (categories: Category[], newCategory: Category, parentId?: string): Category[] => {
  if (!parentId) {
    return [...categories, newCategory];
  }
  
  return categories.map(category => {
    if (category.id === parentId) {
      return {
        ...category,
        subcategories: [...(category.subcategories || []), newCategory]
      };
    }
    
    if (category.subcategories) {
      return {
        ...category,
        subcategories: addCategoryToTree(category.subcategories, newCategory, parentId)
      };
    }
    
    return category;
  });
};
