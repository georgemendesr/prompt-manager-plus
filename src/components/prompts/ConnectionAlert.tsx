
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, WifiOff, AlertCircle } from "lucide-react";

interface ConnectionAlertProps {
  connectionError: string | null;
  networkStatus: 'online' | 'offline';
  isRetrying: boolean;
  onRetry: () => void;
}

export const ConnectionAlert = ({
  connectionError,
  networkStatus,
  isRetrying,
  onRetry
}: ConnectionAlertProps) => {
  if (!connectionError) return null;
  
  const isNetworkError = networkStatus === 'offline';
  const isTimeoutError = connectionError.includes('timeout') || connectionError.includes('Timeout');
  const isConnectionError = connectionError.includes('conexão') || connectionError.includes('connect');
  
  let errorMessage = connectionError;
  let suggestion = "Tente novamente em alguns momentos.";
  
  if (isNetworkError) {
    errorMessage = "Você está offline. Verifique sua conexão com a internet.";
    suggestion = "Aguarde até que sua conexão seja restaurada.";
  } else if (isTimeoutError) {
    errorMessage = "Timeout na conexão com o banco de dados. O servidor pode estar sobrecarregado.";
    suggestion = "Aguarde alguns momentos e tente novamente.";
  } else if (isConnectionError) {
    errorMessage = "Não foi possível conectar ao banco de dados.";
    suggestion = "Verifique sua conexão com a internet e tente novamente.";
  }
  
  return (
    <Alert variant="destructive" className="my-4">
      {isNetworkError ? (
        <WifiOff className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertTitle>Erro de conexão</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{errorMessage}</p>
        <p className="text-sm text-muted-foreground">{suggestion}</p>
        
        <div className="flex items-center gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="self-start flex items-center gap-2"
            onClick={onRetry}
            disabled={isRetrying || networkStatus === 'offline'}
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} /> 
            {isRetrying ? 'Tentando reconectar...' : 'Tentar novamente'}
          </Button>
          
          {networkStatus === 'offline' && (
            <span className="text-sm text-red-500">
              Aguarde até que sua conexão seja restaurada
            </span>
          )}
          
          {isTimeoutError && (
            <span className="text-sm text-orange-500">
              Servidor pode estar sobrecarregado
            </span>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};
