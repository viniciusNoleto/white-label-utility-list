import { requireAdmin } from '@/libs/auth/dal';
import { AppShell } from '@/src/components/layout/AppShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <AppShell user={user}>
      {children}
    </AppShell>
  );
}
