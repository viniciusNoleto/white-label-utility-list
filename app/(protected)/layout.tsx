import { verifySession } from '@/libs/auth/dal';
import { AppShell } from '@/src/components/layout/AppShell';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await verifySession();

  return (
    <AppShell user={user}>
      {children}
    </AppShell>
  );
}
