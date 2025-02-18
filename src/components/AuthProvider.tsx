
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  useEffect(() => {
    // Initialize user state with current session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          // Só redireciona para /prompts se estiver na página de auth
          if (location.pathname === '/auth') {
            navigate('/prompts');
          }
        } else if (location.pathname === '/prompts') {
          // Só redireciona para /auth se tentar acessar /prompts sem estar autenticado
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error retrieving session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Só redireciona para /prompts se estiver na página de auth
        if (location.pathname === '/auth') {
          navigate('/prompts');
        }
      } else if (location.pathname === '/prompts') {
        // Só redireciona para /auth se tentar acessar /prompts sem estar autenticado
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
