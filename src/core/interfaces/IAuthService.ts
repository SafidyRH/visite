/* eslint-disable @typescript-eslint/no-explicit-any */
import { type User } from '@supabase/supabase-js';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  session: any | null; // ou le type de session Supabase
  error: Error | null;
}

export interface IAuthService {
  signIn(credentials: AuthCredentials): Promise<AuthResponse>;
  signUp(credentials: AuthCredentials): Promise<AuthResponse>;
  signOut(): Promise<{ error: Error | null }>;
  getCurrentUser(): Promise<User | null>;
  getSession(): Promise<any>;
  onAuthStateChange(callback: (event: string, session: any) => void): () => void;
}