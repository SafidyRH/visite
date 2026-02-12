import { type AuthChangeEvent, type Session, type User } from '@supabase/supabase-js';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

export interface IAuthService {
  signIn(credentials: AuthCredentials): Promise<AuthResponse>;
  signUp(credentials: AuthCredentials): Promise<AuthResponse>;
  signOut(): Promise<{ error: Error | null }>;
  getCurrentUser(): Promise<User | null>;
  getSession(): Promise<Session | null>;
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void): () => void;
}
