import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './use-auth';

export const useLogin = () => {
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    setIsPending(true);
    setError(null);
    try {
      await signIn(email, password);
      navigate('/dashboard');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsPending(false);
    }
  };

  return { login, error, isPending };
};