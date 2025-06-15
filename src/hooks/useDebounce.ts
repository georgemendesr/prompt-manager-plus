import { useState, useEffect, useCallback, useRef } from 'react';

// Para debounce de valores
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Para debounce de funções
export const useDebounceCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  // Usando useRef em vez de useState para evitar rerenderizações
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Também armazenar a função de callback em um ref para evitar recriações desnecessárias
  const callbackRef = useRef<T>(callback);
  
  // Atualizar a referência da callback quando ela mudar
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Limpar o timeout anterior se existir
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Configurar novo timeout
      timeoutRef.current = setTimeout(() => {
        // Usar a referência da callback em vez da callback diretamente
        callbackRef.current(...args);
      }, delay);
    },
    [delay] // Apenas dependência no delay, não na callback
  );

  // Limpar o timeout ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};
