<<<<<<< HEAD
=======

>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

<<<<<<< HEAD
// Lista de rotas protegidas que requerem autenticação
const PROTECTED_ROUTES = ['/prompts', '/statistics', '/links', '/settings', '/text', '/image', '/workspace', '/lyrics', '/agents'];

=======
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

<<<<<<< HEAD
  // Verifica se a rota atual é protegida
  const isProtectedRoute = (path: string) => {
    return PROTECTED_ROUTES.some(route => path.startsWith(route));
  };

=======
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        setUser(session?.user ?? null);
        
        // Redireciona para /prompts se estiver autenticado e em /auth ou /
        if (session?.user && (location.pathname === '/auth' || location.pathname === '/')) {
          navigate('/prompts');
<<<<<<< HEAD
        } else if (!session?.user && isProtectedRoute(location.pathname)) {
          // Redireciona para /auth se tentar acessar qualquer rota protegida sem estar autenticado
=======
        } else if (!session?.user && location.pathname.startsWith('/prompts')) {
          // Redireciona para /auth apenas se tentar acessar rotas protegidas
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error retrieving session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      setUser(session?.user ?? null);
      
<<<<<<< HEAD
      // Redireciona para /prompts quando autenticado e está em /auth ou /
      if (session?.user && (location.pathname === '/auth' || location.pathname === '/')) {
        navigate('/prompts');
      } else if (!session?.user && isProtectedRoute(location.pathname)) {
=======
      // Redireciona para /prompts quando autenticado, exceto se já estiver lá
      if (session?.user && location.pathname !== '/prompts') {
        navigate('/prompts');
      } else if (!session?.user && location.pathname.startsWith('/prompts')) {
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
        navigate('/auth');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
