import { useEffect, useState, type ReactNode } from 'react';
import { type User } from '@supabase/supabase-js';
import type { IAuthService } from '@/core/interfaces/IAuthService';
import { authService } from '@/core/services/supabase-auth-services';
import { AuthContext } from '.';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
  authService?: IAuthService; // injection possible
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  authService: injectedAuthService = authService, // par défaut l'implémentation Supabase
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Récupérer l'utilisateur au chargement
    const loadUser = async () => {
      const currentUser = await injectedAuthService.getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };
    loadUser();

    // Écouter les changements d'authentification
    const unsubscribe = injectedAuthService.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      unsubscribe();
    };
  }, [injectedAuthService]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { user, error } = await injectedAuthService.signIn({ email, password });
    if (error) throw error;
    setUser(user);
    setIsLoading(false);
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    const { user, error } = await injectedAuthService.signUp({ email, password });
    if (error) throw error;
    setUser(user);
    setIsLoading(false);
  };

  const signOut = async () => {
    setIsLoading(true);
    const { error } = await injectedAuthService.signOut();
    if (error) throw error;
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};