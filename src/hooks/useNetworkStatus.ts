
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
      console.log('🌐 Conexão com a internet restaurada');
      setNetworkStatus('online');
      toast.success("Conexão com a internet restaurada!");
    };
    
    const handleOffline = () => {
      console.log('❌ Conexão com a internet perdida');
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
    if (isRetrying) {
      console.log('⏳ Tentativa de reconexão já em andamento');
      return false;
    }
    
    setIsRetrying(true);
    
    try {
      console.log('🔄 Tentando reconectar ao banco de dados...');
      toast.info("Tentando reconectar ao banco de dados...");
      
      // Test connection with multiple attempts
      let connectionEstablished = false;
      const maxAttempts = 3;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(`🔄 Tentativa ${attempt}/${maxAttempts} de conexão...`);
          
          // Simple ping test to check connection with timeout
          const result = await Promise.race([
            supabase.from('categories').select('id').limit(1),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout na conexão')), 10000)
            )
          ]) as any;
          
          if (!result.error) {
            connectionEstablished = true;
            console.log('✅ Conexão com o banco estabelecida');
            break;
          } else {
            console.warn(`⚠️ Tentativa ${attempt} falhou:`, result.error);
            if (attempt < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between attempts
            }
          }
        } catch (attemptError) {
          console.warn(`⚠️ Tentativa ${attempt} falhou:`, attemptError);
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between attempts
          }
        }
      }
      
      if (!connectionEstablished) {
        throw new Error('Não foi possível estabelecer conexão após múltiplas tentativas');
      }
      
      // If connection is established, try to reload data
      console.log('🔄 Recarregando dados após reconexão...');
      await onSuccess();
      
      toast.success("Conexão restabelecida com sucesso!");
      return true;
    } catch (error) {
      console.error("❌ Erro ao reconectar:", error);
      
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          toast.error("Timeout na conexão. O servidor pode estar sobrecarregado. Tente novamente em alguns momentos.");
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
          toast.error("Erro de rede. Verifique sua conexão com a internet.");
        } else {
          toast.error("Falha ao reconectar. Verifique sua conexão e tente novamente.");
        }
      } else {
        toast.error("Falha ao reconectar. Tente novamente em alguns momentos.");
      }
      
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
