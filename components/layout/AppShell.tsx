'use client';

import { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { AttributionFooter } from './AttributionFooter';
import type { IAuthUser } from '@/src/resources/auth/models/AuthUser';

export function AppShell({ user, children }: { user: IAuthUser; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-1 min-h-0">
      <AppSidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <AppHeader
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
          {children}
        </div>

        <AttributionFooter />
      </div>
    </div>
  );
}
