
import { ReactNode } from 'react';
import { useSecurity } from './SecurityProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  showError?: boolean;
}

export const AdminGuard = ({ 
  children, 
  fallback = null, 
  showError = true 
}: AdminGuardProps) => {
  const { isAdmin, isLoading } = useSecurity();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-gray-500">Verificando permissões...</div>
      </div>
    );
  }

  if (!isAdmin) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    if (showError) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <ShieldAlert className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            Acesso negado. Esta funcionalidade requer privilégios de administrador.
          </AlertDescription>
        </Alert>
      );
    }
    
    return null;
  }

  return <>{children}</>;
};
