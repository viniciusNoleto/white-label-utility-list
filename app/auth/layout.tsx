import { redirect } from 'next/navigation';
import { getSessionFromCookie } from '@/libs/auth/dal';
import { WavesBackground } from '@/src/components/layout/WavesBackground';

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
