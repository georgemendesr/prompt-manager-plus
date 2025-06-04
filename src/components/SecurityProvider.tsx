
import { createContext, useContext, ReactNode } from 'react';
import { useUserRole, UserRole } from '@/hooks/useUserRole';

interface SecurityContextType {
  role: UserRole;
  isAdmin: boolean;
  isModerator: boolean;
  isUser: boolean;
  isLoading: boolean;
  canManageCategories: boolean;
  canManagePrompts: boolean;
  canManageUsers: boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function SecurityProvider({ children }: { children: ReactNode }) {
  const { role, isAdmin, isModerator, isUser, isLoading } = useUserRole();

  const permissions = {
    canManageCategories: isAdmin,
    canManagePrompts: isAdmin,
    canManageUsers: isAdmin
  };

  return (
    <SecurityContext.Provider value={{
      role,
      isAdmin,
      isModerator,
      isUser,
      isLoading,
      ...permissions
    }}>
      {children}
    </SecurityContext.Provider>
  );
}

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
