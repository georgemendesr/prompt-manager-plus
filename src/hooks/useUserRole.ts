
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'moderator' | 'user';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole('user');
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Verificando role do usuário:', user.id);
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('❌ Erro ao buscar role:', error);
          setRole('user');
          setIsAdmin(false);
        } else if (data) {
          const userRole = data.role as UserRole;
          console.log('✅ Role encontrada:', userRole);
          setRole(userRole);
          setIsAdmin(userRole === 'admin');
        } else {
          console.log('📝 Usuário sem role definida, usando "user" como padrão');
          setRole('user');
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar role:', error);
        setRole('user');
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return {
    role,
    isAdmin,
    isLoading,
    isModerator: role === 'moderator',
    isUser: role === 'user'
  };
};
