
import { useState, useEffect } from "react";
import type { Category } from "@/types/prompt";
import { useCategoryMutations } from "./category/useCategoryMutations";
import { useCategoryFetcher } from "./category/useCategoryFetcher";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { loading, loadError, loadCategories: fetchCategoriesData } = useCategoryFetcher();
  const { addCategory, editCategory, deleteCategory } = useCategoryMutations(categories, setCategories);

  const loadCategories = async () => {
    const loadedCategories = await fetchCategoriesData();
    if (loadedCategories) {
      setCategories(loadedCategories);
    }
  };

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
