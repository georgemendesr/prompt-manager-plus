
import { useState, useEffect } from 'react';
import { checkHealth } from '@/services/healthService';
import type { HealthStatus } from '@/services/healthService';

export const useHealthCheck = (intervalMs: number = 30000) => {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'ok',
    timestamp: new Date().toISOString()
  });

  const checkHealthStatus = async () => {
    try {
      const status = await checkHealth();
      setHealth(status);
    } catch (error) {
      setHealth({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Failed to check health'
      });
    }
  };

  useEffect(() => {
    checkHealthStatus();
    const interval = setInterval(checkHealthStatus, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return { health, checkHealthStatus };
};
