
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './use-auth';

export const useLogout = () => {
  const { signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    setIsPending(true);
    setError(null);
    try {
      await signOut();
      navigate('/login');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    } finally {
      setIsPending(false);
    }
  };

  return { logout, error, isPending };
};