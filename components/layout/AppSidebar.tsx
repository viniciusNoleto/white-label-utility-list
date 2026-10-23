'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/src/libs/utils';
import type { IAuthUser } from '@/src/resources/auth/models/AuthUser';
import { BRAND_NAME } from '@/src/shared/constants/brand';

const NAV_ITEMS = [
  { href: '/list', icon: 'lucide:list', labelKey: 'nav.list', adminOnly: false },
  { href: '/admin/users', icon: 'lucide:user-check', labelKey: 'nav.approvals', adminOnly: true },
  { href: '/admin/settings', icon: 'lucide:settings', labelKey: 'nav.settings', adminOnly: true },
];

export function AppSidebar({ user, open, onClose }: { user: IAuthUser; open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const pathname = usePathname();

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col w-64 shrink-0 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-200 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt={BRAND_NAME}
              width={100}
              height={100}
              className="w-8 h-8"
            />

            <span className="font-semibold text-[15.5px] text-gray-900 dark:text-gray-100">
              {BRAND_NAME}
            </span>
          </div>

          <button
            type="button"
            aria-label={t('common.actions.close')}
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Icon
              icon="lucide:x"
              className="w-4 h-4"
            />
          </button>
        </div>

        <nav className="flex flex-col gap-[3px] px-2.5">
          {NAV_ITEMS.filter(item => !item.adminOnly || user.role === 'admin').map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(item.href)
                  ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
              )}
            >
              <Icon
                icon={item.icon}
                className="w-4 h-4 shrink-0"
              />

              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex items-center gap-2.5 p-3.5 border-t border-gray-200 dark:border-gray-800">
          <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 text-xs font-medium text-gray-600 dark:text-gray-400">
            {initials}
          </span>

          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user.name}
            </div>

            <div className="text-[11.5px] text-gray-400 dark:text-gray-500 truncate">
              {user.email}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
