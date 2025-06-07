
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useHealthCheck } from '@/hooks/useHealthCheck';

export const HealthStatus = () => {
  const { health } = useHealthCheck(30000); // Check every 30 seconds

  const getStatusColor = () => {
    switch (health.status) {
      case 'ok': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = () => {
    switch (health.status) {
      case 'ok': return 'Online';
      case 'error': return 'Offline';
      default: return 'Verificando...';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge className={getStatusColor()}>
        {getStatusText()}
      </Badge>
    </div>
  );
};
