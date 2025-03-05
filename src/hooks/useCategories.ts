
import { useState, useEffect } from "react";
import type { Category } from "@/types/prompt";
import { useCategoryMutations } from "./category/useCategoryMutations";
import { useCategoryFetcher } from "./category/useCategoryFetcher";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { loading, loadError, loadCategories: fetchCategoriesData, retryCount, setRetryCount } = useCategoryFetcher();
  const { addCategory, editCategory, deleteCategory } = useCategoryMutations(categories, setCategories);

  const loadCategories = async () => {
    const loadedCategories = await fetchCategoriesData();
    if (loadedCategories) {
      setCategories(loadedCategories);
    }
  };

  // Auto-retry mechanism
  useEffect(() => {
    if (loadError && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Tentativa ${retryCount + 1} de recarregar categorias...`);
        setRetryCount(prev => prev + 1);
        loadCategories();
      }, 3000 * (retryCount + 1)); // Backoff exponential
      
      return () => clearTimeout(timer);
    }
  }, [loadError, retryCount, setRetryCount]);

  useEffect(() => {
    loadCategories();
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
