import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/use-auth';

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Chargement...</div>; // ou un spinner shadcn
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};