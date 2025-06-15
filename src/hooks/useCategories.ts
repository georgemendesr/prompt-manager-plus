<<<<<<< HEAD
=======

>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
import { useState, useEffect } from "react";
import type { Category } from "@/types/prompt";
import { useCategoryMutations } from "./category/useCategoryMutations";
import { useCategoryFetcher } from "./category/useCategoryFetcher";

<<<<<<< HEAD
// Função para aplicar sobreposições do localStorage às categorias
const applyLocalStorageOverrides = (categories: Category[]): Category[] => {
  try {
    console.log('Aplicando sobreposições do localStorage...');
    
    // Função recursiva para aplicar sobreposições
    const applyOverrides = (cats: Category[]): Category[] => {
      return cats.map(category => {
        // Verificar se há uma sobreposição para esta categoria
        const overrideKey = `category_override_${category.id}`;
        const overrideJSON = localStorage.getItem(overrideKey);
        
        if (overrideJSON) {
          try {
            const override = JSON.parse(overrideJSON);
            console.log(`Aplicando sobreposição para categoria ${category.id}:`, override);
            
            // Criar uma nova categoria com os valores sobrepostos
            return {
              ...category,
              name: override.name || category.name,
              parentId: override.parentId !== undefined ? override.parentId : category.parentId,
              // Aplicar recursivamente às subcategorias
              subcategories: category.subcategories ? applyOverrides(category.subcategories) : []
            };
          } catch (parseError) {
            console.error(`Erro ao processar sobreposição para ${category.id}:`, parseError);
          }
        }
        
        // Se não há sobreposição ou houve erro, apenas processar subcategorias
        return {
          ...category,
          subcategories: category.subcategories ? applyOverrides(category.subcategories) : []
        };
      });
    };
    
    return applyOverrides(categories);
  } catch (error) {
    console.error('Erro ao aplicar sobreposições do localStorage:', error);
    return categories; // Retornar categorias originais em caso de erro
  }
};

=======
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { loading, loadError, loadCategories: fetchCategoriesData } = useCategoryFetcher();
  const { addCategory, editCategory, deleteCategory } = useCategoryMutations(categories, setCategories);

  const loadCategories = async () => {
    const loadedCategories = await fetchCategoriesData();
    if (loadedCategories) {
<<<<<<< HEAD
      // Aplicar sobreposições do localStorage antes de atualizar o estado
      const categoriesWithOverrides = applyLocalStorageOverrides(loadedCategories);
      setCategories(categoriesWithOverrides);
=======
      setCategories(loadedCategories);
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
    }
  };

  // We removed the auto-retry mechanism from here since it's now handled by useCategoryLoader

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    categories,
    setCategories,
    loading,
    loadError,
    loadCategories,
    addCategory,
    editCategory,
    deleteCategory
  };
};
