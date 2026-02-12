
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
import { useLogout } from '@/lib/hooks/use-logout';

export const Dashboard = () => {
  const { user } = useAuth();
  const { logout, isPending } = useLogout();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord</h1>
      <p>Bienvenue, {user?.email} !</p>
      <Button onClick={logout} disabled={isPending} className="mt-4">
        {isPending ? 'Déconnexion...' : 'Se déconnecter'}
      </Button>
    </div>
  );
};