
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { isNetworkError } from "./errorUtils";
import { useBackoffCalculator } from "./useBackoffCalculator";

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

  const { calculateBackoff } = useBackoffCalculator({ 
    initialDelay, 
    maxDelay 
  });

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

  // Handle operation success
  const handleSuccess = useCallback((result: any) => {
    console.log("Operation succeeded!");
    resetRetryCount();
    
    if (onSuccess) {
      onSuccess();
    }
    
    return result;
  }, [onSuccess, resetRetryCount]);

  // Handle operation failure
  const handleFailure = useCallback((error: any, operation: () => Promise<any>, operationName: string) => {
    console.error(`Error executing ${operationName}:`, error);
    setLastError(error);
    
    // Determine if retry is appropriate
    const shouldRetry = (retryOnNetworkError && isNetworkError(error)) || 
                         (!isNetworkError(error) && retryCount < maxRetries);
    
    if (shouldRetry && retryCount < maxRetries) {
      const delay = calculateBackoff(retryCount);
      
      console.log(`Retrying ${operationName} in ${Math.floor(delay/1000)} seconds... (Attempt ${retryCount + 1}/${maxRetries})`);
      
      // Set up retry timer with calculated backoff
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        executeOperation(operation, operationName);
      }, delay);
      
      setRetryTimer(timer);
      
      toast.error(`Error connecting. Retrying in ${Math.floor(delay/1000)}s (${retryCount + 1}/${maxRetries})...`);
      return null;
    } else {
      const errorMessage = isNetworkError(error) 
        ? `Connection error when trying to ${operationName.toLowerCase()}. Check your internet connection.`
        : `Error ${operationName.toLowerCase()}: ${error.message || 'Unknown error'}`;
        
      toast.error(errorMessage);
      
      if (onFailure) {
        onFailure(error);
      }
      
      setOperationInProgress(false);
      return null;
    }
  }, [maxRetries, retryCount, onFailure, calculateBackoff, retryOnNetworkError]);

  // Execute operation with retry logic
  const executeOperation = useCallback(async (
    operation: () => Promise<any>,
    operationName: string
  ) => {
    if (operationInProgress && retryTimer === null) {
      console.log(`${operationName} operation already in progress, skipping`);
      return null;
    }
    
    try {
      setOperationInProgress(true);
      console.log(`Executing ${operationName}...`);
      const result = await operation();
      
      setOperationInProgress(false);
      return handleSuccess(result);
    } catch (error: any) {
      return handleFailure(error, operation, operationName);
    }
  }, [operationInProgress, retryTimer, handleSuccess, handleFailure]);

  // Main public method to execute with retry
  const executeWithRetry = useCallback((
    operation: () => Promise<any>,
    operationName: string = "Operation"
  ) => {
    return executeOperation(operation, operationName);
  }, [executeOperation]);

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
