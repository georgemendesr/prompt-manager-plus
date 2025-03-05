
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

interface UseRetryOptions {
  maxRetries?: number;
  onSuccess?: () => void;
  onFailure?: (error: any) => void;
}

export const useRetry = ({ maxRetries = 8, onSuccess, onFailure }: UseRetryOptions = {}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimer, setRetryTimer] = useState<NodeJS.Timeout | null>(null);
  const [operationInProgress, setOperationInProgress] = useState(false);

  // Reset retry count function
  const resetRetryCount = useCallback(() => {
    setRetryCount(0);
    
    // Clear any existing retry timer
    if (retryTimer) {
      clearTimeout(retryTimer);
      setRetryTimer(null);
    }
  }, [retryTimer]);

  // Execute with retry logic
  const executeWithRetry = useCallback(async (
    operation: () => Promise<any>,
    operationName: string = "Operation"
  ) => {
    if (operationInProgress) {
      toast.error("Operação em andamento. Aguarde um momento.");
      return null;
    }
    
    try {
      setOperationInProgress(true);
      const result = await operation();
      resetRetryCount();
      
      if (onSuccess) {
        onSuccess();
      }
      
      return result;
    } catch (error) {
      console.error(`Erro ao executar ${operationName}:`, error);
      
      if (retryCount < maxRetries) {
        // Exponential backoff: wait longer between each retry
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        
        console.log(`Tentando novamente em ${delay/1000} segundos... (Tentativa ${retryCount + 1}/${maxRetries})`);
        
        // Set up retry timer with exponential backoff
        const timer = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          executeWithRetry(operation, operationName);
        }, delay);
        
        setRetryTimer(timer);
        return null;
      } else {
        toast.error(`Falha ao ${operationName} após várias tentativas.`);
        
        if (onFailure) {
          onFailure(error);
        }
        
        return null;
      }
    } finally {
      setOperationInProgress(false);
    }
  }, [maxRetries, onSuccess, onFailure, operationInProgress, resetRetryCount, retryCount]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [retryTimer]);

  return {
    executeWithRetry,
    operationInProgress,
    retryCount,
    resetRetryCount
  };
};
