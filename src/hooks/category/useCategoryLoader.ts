
import { useCallback, useState, useEffect } from "react";
import { useRetry } from "../utils/useRetry";
import { toast } from "sonner";

export const useCategoryLoader = (originalLoadCategories: () => Promise<void | any>) => {
  const [loadError, setLoadError] = useState<string | null>(null);
  const { executeWithRetry, retryCount, lastError, cancelRetry } = useRetry({
    maxRetries: 3, // Reduce max retries to avoid excessive attempts
    initialDelay: 2000, // Start with a 2s delay
    maxDelay: 10000, // Max 10s delay
    retryOnNetworkError: true,
    onFailure: (error) => {
      console.error("Erro ao carregar categorias após várias tentativas:", error);
      const errorMsg = error instanceof Error 
        ? error.message 
        : "Erro ao conectar ao banco de dados";
      
      setLoadError(error instanceof Error 
        ? `Erro de conexão: ${error.message}` 
        : "Erro ao conectar ao banco de dados. Verifique sua conexão com a internet."
      );
      
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
    
    return () => {
      // Cancel any ongoing retry attempts when component unmounts
      cancelRetry();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  return {
    loadError,
    loadCategories: loadCategoriesWithRetry,
    retryCount,
    lastError
  };
};
