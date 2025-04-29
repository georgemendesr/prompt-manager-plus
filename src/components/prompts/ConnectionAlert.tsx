
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, WifiOff } from "lucide-react";

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
  
  return (
    <Alert variant="destructive" className="my-4">
      <WifiOff className="h-4 w-4 mr-2" />
      <AlertTitle>Erro de conexão</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{networkStatus === 'offline' 
          ? "Você está offline. Verifique sua conexão com a internet." 
          : `Não foi possível conectar ao banco de dados: ${connectionError}`}
        </p>
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
        </div>
      </AlertDescription>
    </Alert>
  );
};
