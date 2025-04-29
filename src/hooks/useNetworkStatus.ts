
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>(
    navigator.onLine ? 'online' : 'offline'
  );
  const [isRetrying, setIsRetrying] = useState(false);
  
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus('online');
      toast.success("Conexão com a internet restaurada!");
    };
    
    const handleOffline = () => {
      setNetworkStatus('offline');
      toast.error("Sem conexão com a internet");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const handleRetryConnection = async (
    onSuccess: () => Promise<void>
  ) => {
    setIsRetrying(true);
    
    try {
      toast.info("Tentando reconectar ao banco de dados...");
      
      // Simple ping test to check connection
      const { error } = await supabase.from('structures').select('id').limit(1);
      
      if (error) {
        throw error;
      }
      
      await onSuccess();
      
      toast.success("Conexão restabelecida com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao reconectar:", error);
      toast.error("Falha ao reconectar. Tente novamente em alguns momentos.");
      return false;
    } finally {
      setIsRetrying(false);
    }
  };
  
  return {
    networkStatus,
    isRetrying,
    handleRetryConnection
  };
};
