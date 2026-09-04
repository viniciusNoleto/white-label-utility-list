import { requireAdmin } from '@/libs/auth/dal';
import { AppShell } from '@/src/components/layout/AppShell';
import { AuthHydrator } from '@/src/resources/auth/components/AuthHydrator';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <>
      <AuthHydrator initialUser={user} />

      <AppShell user={user}>
        {children}
      </AppShell>
    </>
  );
}
