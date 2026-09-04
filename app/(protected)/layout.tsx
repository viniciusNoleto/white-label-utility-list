import { verifySession } from '@/libs/auth/dal';
import { AppShell } from '@/src/components/layout/AppShell';
import { AuthHydrator } from '@/src/resources/auth/components/AuthHydrator';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await verifySession();

  return (
    <>
      <AuthHydrator initialUser={user} />

      <AppShell user={user}>
        {children}
      </AppShell>
    </>
  );
}
