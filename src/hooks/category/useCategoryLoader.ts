
import { useCallback, useState, useEffect } from "react";
import { useRetry } from "../utils/useRetry";
import { toast } from "sonner";

export const useCategoryLoader = (originalLoadCategories: () => Promise<void | any>) => {
  const [loadError, setLoadError] = useState<string | null>(null);
  const { executeWithRetry, retryCount } = useRetry({
    maxRetries: 3, // Reduce max retries to avoid excessive attempts
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

  // Initial load - only once
  useEffect(() => {
    const loadInitialData = async () => {
      await loadCategoriesWithRetry();
    };
    
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  return {
    loadError,
    loadCategories: loadCategoriesWithRetry
  };
};
