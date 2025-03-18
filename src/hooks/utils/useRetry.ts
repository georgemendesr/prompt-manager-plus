
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

interface UseRetryOptions {
  maxRetries?: number;
  onSuccess?: () => void;
  onFailure?: (error: any) => void;
  initialDelay?: number;
  maxDelay?: number;
  retryOnNetworkError?: boolean;
}

export const useRetry = ({ 
  maxRetries = 3, 
  onSuccess, 
  onFailure,
  initialDelay = 1000,
  maxDelay = 10000,
  retryOnNetworkError = true
}: UseRetryOptions = {}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimer, setRetryTimer] = useState<NodeJS.Timeout | null>(null);
  const [operationInProgress, setOperationInProgress] = useState(false);
  const [lastError, setLastError] = useState<any>(null);

  // Reset retry count function
  const resetRetryCount = useCallback(() => {
    setRetryCount(0);
    setLastError(null);
    
    // Clear any existing retry timer
    if (retryTimer) {
      clearTimeout(retryTimer);
      setRetryTimer(null);
    }
  }, [retryTimer]);

  // Is network error check
  const isNetworkError = useCallback((error: any) => {
    return (
      error?.message?.includes('Failed to fetch') || 
      error?.message?.includes('Network error') ||
      error?.message?.includes('network') ||
      error?.code === 'ECONNABORTED' ||
      error?.name === 'AbortError'
    );
  }, []);

  // Execute with retry logic
  const executeWithRetry = useCallback(async (
    operation: () => Promise<any>,
    operationName: string = "Operation"
  ) => {
    if (operationInProgress) {
      console.log(`${operationName} operation already in progress, skipping retry`);
      return null;
    }
    
    try {
      setOperationInProgress(true);
      console.log(`Executing ${operationName}...`);
      const result = await operation();
      
      console.log(`${operationName} succeeded!`);
      resetRetryCount();
      
      if (onSuccess) {
        onSuccess();
      }
      
      return result;
    } catch (error: any) {
      console.error(`Erro ao executar ${operationName}:`, error);
      setLastError(error);
      
      // Only retry on network errors if retryOnNetworkError is true
      // or retry for other errors if not a network error
      const shouldRetry = (retryOnNetworkError && isNetworkError(error)) || 
                         (!isNetworkError(error) && retryCount < maxRetries);
      
      if (shouldRetry && retryCount < maxRetries) {
        // Exponential backoff with jitter: base delay + random jitter
        const baseDelay = Math.min(initialDelay * Math.pow(2, retryCount), maxDelay);
        const jitter = Math.random() * 1000; // add up to 1s of jitter
        const delay = baseDelay + jitter;
        
        console.log(`Tentando novamente ${operationName} em ${Math.floor(delay/1000)} segundos... (Tentativa ${retryCount + 1}/${maxRetries})`);
        
        // Set up retry timer with exponential backoff
        const timer = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          executeWithRetry(operation, operationName);
        }, delay);
        
        setRetryTimer(timer);
        
        toast.error(`Erro de conexão. Tentando novamente em ${Math.floor(delay/1000)}s (${retryCount + 1}/${maxRetries})...`);
        return null;
      } else {
        const errorMessage = isNetworkError(error) 
          ? `Erro de conexão ao ${operationName.toLowerCase()}. Verifique sua conexão com a internet.`
          : `Erro ao ${operationName.toLowerCase()}: ${error.message || 'Erro desconhecido'}`;
          
        toast.error(errorMessage);
        
        if (onFailure) {
          onFailure(error);
        }
        
        return null;
      }
    } finally {
      // Only set operationInProgress to false if we're not retrying
      if (retryTimer === null) {
        setOperationInProgress(false);
      }
    }
  }, [maxRetries, initialDelay, maxDelay, onSuccess, onFailure, operationInProgress, resetRetryCount, retryCount, retryTimer, isNetworkError, retryOnNetworkError]);

  // Cancel any ongoing retry attempts
  const cancelRetry = useCallback(() => {
    resetRetryCount();
    setOperationInProgress(false);
  }, [resetRetryCount]);

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
    cancelRetry,
    operationInProgress,
    retryCount,
    resetRetryCount,
    lastError
  };
};
