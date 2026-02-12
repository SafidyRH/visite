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
  authService?: IAuthService;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  authService: injectedAuthService = authService,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = await injectedAuthService.getSession();
        setUser(session?.user ?? null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadUser();

    const unsubscribe = injectedAuthService.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [injectedAuthService]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user, error } = await injectedAuthService.signIn({ email, password });
      if (error) throw error;
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user, error } = await injectedAuthService.signUp({ email, password });
      if (error) throw error;
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await injectedAuthService.signOut();
      if (error) throw error;
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
