
import { useCallback } from "react";

interface UseBackoffCalculatorOptions {
  initialDelay: number;
  maxDelay: number;
  factor?: number;
  jitterMax?: number;
}

/**
 * Hook for calculating exponential backoff with jitter for retry operations
 */
export const useBackoffCalculator = ({
  initialDelay,
  maxDelay,
  factor = 2,
  jitterMax = 1000
}: UseBackoffCalculatorOptions) => {
  /**
   * Calculates backoff delay with exponential increase and random jitter
   */
  const calculateBackoff = useCallback((attemptNumber: number): number => {
    // Calculate base exponential delay: initialDelay * (factor ^ attemptNumber)
    const exponentialDelay = initialDelay * Math.pow(factor, attemptNumber);
    
    // Cap the delay at maxDelay
    const cappedDelay = Math.min(exponentialDelay, maxDelay);
    
    // Add random jitter (0-jitterMax ms) to prevent thundering herd problem
    const jitter = Math.random() * jitterMax;
    
    // Return the final delay value
    return cappedDelay + jitter;
  }, [initialDelay, maxDelay, factor, jitterMax]);

  return { calculateBackoff };
};
