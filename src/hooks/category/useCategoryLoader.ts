
import { useCallback, useState, useEffect } from "react";
import { useRetry } from "../utils/useRetry";
import { toast } from "sonner";

export const useCategoryLoader = (originalLoadCategories: () => Promise<void | null>) => {
  const [loadError, setLoadError] = useState<string | null>(null);
  const { executeWithRetry, retryCount } = useRetry({
    onFailure: (error) => {
      console.error("Erro ao carregar categorias:", error);
      setLoadError(error instanceof Error ? error.message : "Erro ao conectar ao banco de dados");
      toast.error("Falha ao conectar ao banco de dados após várias tentativas.");
    }
  });

  const loadCategoriesWithRetry = useCallback(async () => {
    setLoadError(null);
    return executeWithRetry(
      async () => await originalLoadCategories(),
      "carregar categorias"
    );
  }, [executeWithRetry, originalLoadCategories]);

  // Auto retry on error
  useEffect(() => {
    if (loadError && retryCount < 5) {
      const timer = setTimeout(() => {
        loadCategoriesWithRetry();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [loadError, loadCategoriesWithRetry, retryCount]);

  // Initial load
  useEffect(() => {
    loadCategoriesWithRetry();
  }, [loadCategoriesWithRetry]);

  return {
    loadError,
    loadCategories: loadCategoriesWithRetry
  };
};
