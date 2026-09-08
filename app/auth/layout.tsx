import { redirect } from 'next/navigation';
import { getSessionFromCookie } from '@/libs/auth/dal';
import { WavesBackground } from '@/src/components/layout/WavesBackground';

// Equivalente ao middleware/off.ts do projeto de referência (ver
// docs/auth/README.md): quem já tem uma sessão válida não deve ver
// /auth/login nem /auth/register. Isso não pode viver dentro das próprias
// páginas porque elas são Client Components ('use client') — precisa de um
// Server Component em volta delas para checar o cookie antes de renderizar.
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookie();

  if (session) redirect('/list');

  return (
    <div className="relative flex flex-col flex-1 min-h-screen">
      <WavesBackground />

      <div className="relative flex flex-col flex-1">
        {children}
      </div>
    </div>
  );
}
