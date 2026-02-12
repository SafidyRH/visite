import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './config/queryClient'


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-2xl w-full">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Application de Gestion de Visites
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Plateforme de gestion des visites d'entreprise pour lycéens
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <span className="text-gray-700">
                React + TypeScript configuré
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <span className="text-gray-700">
                Tailwind CSS v4 configuré
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <span className="text-gray-700">
                TanStack Query configuré
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <span className="text-gray-700">
                Supabase client configuré
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <span className="text-gray-700">
                Schéma de base de données créé
              </span>
            </div>
          </div>
          <div className="mt-8 p-4 bg-primary-50 rounded-lg border border-primary-200">
            <p className="text-sm text-primary-900 font-medium">
              📝 Phase 1 : Setup Infrastructure - EN COURS
            </p>
            <p className="text-sm text-primary-700 mt-1">
              Prochaine étape : Implémenter l'authentification des entreprises
            </p>
          </div>
        </div>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
