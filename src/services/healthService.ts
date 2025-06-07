
import { supabase } from "@/integrations/supabase/client";

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  error?: string;
}

export const checkHealth = async (): Promise<HealthStatus> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .limit(1);

    if (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
