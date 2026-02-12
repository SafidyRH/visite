import { type AuthChangeEvent, type Session, type User } from '@supabase/supabase-js';
import type { AuthCredentials, AuthResponse, IAuthService } from '../interfaces/IAuthService';
import { supabase } from './supabase-client';

export class SupabaseAuthService implements IAuthService {
  async signIn({ email, password }: AuthCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      user: data?.user ?? null,
      session: data?.session ?? null,
      error: error as Error | null,
    };
  }

  async signUp({ email, password }: AuthCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    return {
      user: data?.user ?? null,
      session: data?.session ?? null,
      error: error as Error | null,
    };
  }

  async signOut(): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signOut();
    return { error: error as Error | null };
  }

  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return null;
    }

    return data?.user ?? null;
  }

  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return null;
    }

    return data?.session ?? null;
  }

  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ): () => void {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }
}

export const authService = new SupabaseAuthService();
