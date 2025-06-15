import type { Category } from "@/types/prompt";
import type { RawCategory, CategoryRecord } from "@/types/category";

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
<<<<<<< HEAD
};

/**
 * Verifica se uma categoria é descendente de outra na hierarquia
 * Usada para prevenir ciclos quando uma categoria é editada
 * @param categories Lista completa de categorias
 * @param categoryId ID da categoria a ser verificada
 * @param potentialParentId ID da categoria que seria o novo pai
 * @returns true se a potentialParentId é descendente de categoryId (criaria ciclo)
 */
export const wouldCreateCycle = (
  categories: Category[],
  categoryId: string,
  potentialParentId: string
): boolean => {
  // Se tentando definir a si mesmo como pai
  if (categoryId === potentialParentId) {
    return true;
  }

  // Função recursiva para verificar descendentes
  const isDescendant = (parentId: string, childId: string): boolean => {
    // Procura em todas as categorias
    for (const category of categories) {
      if (category.id === parentId) {
        // Verifica subcategorias diretas
        if (category.subcategories?.some(sub => sub.id === childId)) {
          return true;
        }
        // Verifica recursivamente nas subcategorias
        if (category.subcategories?.some(sub => isDescendant(sub.id, childId))) {
          return true;
        }
      }
    }
    return false;
  };

  // Verificar se o potencial pai é descendente da categoria atual
  return isDescendant(categoryId, potentialParentId);
};

/**
 * Obtém todos os descendentes de uma categoria específica
 * @param categories Lista completa de categorias
 * @param categoryId ID da categoria 
 * @returns Array com IDs de todas as subcategorias (incluindo as aninhadas)
 */
export const getAllDescendantIds = (categories: Category[], categoryId: string): string[] => {
  const result: string[] = [];
  
  // Função recursiva para coletar descendentes
  const collectDescendants = (id: string) => {
    // Encontra a categoria pelo ID
    const category = findCategoryById(categories, id);
    if (!category) return;
    
    // Adiciona subcategorias
    if (category.subcategories?.length) {
      for (const sub of category.subcategories) {
        result.push(sub.id);
        collectDescendants(sub.id);
      }
    }
  };
  
  collectDescendants(categoryId);
  return result;
};

/**
 * Encontra uma categoria por ID em qualquer nível da árvore
 */
export const findCategoryById = (categories: Category[], id: string): Category | undefined => {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }
    
    if (category.subcategories?.length) {
      const found = findCategoryById(category.subcategories, id);
      if (found) return found;
    }
  }
  
  return undefined;
=======
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
};