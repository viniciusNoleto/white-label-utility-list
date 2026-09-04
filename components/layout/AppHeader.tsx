'use client';

import { useRouter } from 'next/navigation';
import { useMantineColorScheme } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { FormButton } from '@/src/components/form/Button';
import { LanguageSwitcher } from '@/src/components/utils/LanguageSwitcher';
import { useLogoutLogicData } from '@/src/resources/auth/logics/Logout';
import type { IAuthUser } from '@/src/resources/auth/models/AuthUser';

export function AppHeader({ user, onMenuClick }: { user: IAuthUser; onMenuClick: () => void }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const {
    logoutMutation: { mutate: logout, isPending: logoutIsPending },
  } = useLogoutLogicData({
    onSuccess: () => {
      router.push('/auth/login');
      router.refresh();
    },
  });

  return (
    <header className="flex items-center justify-between gap-4 h-16 px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900">
      <div className="flex items-center gap-3">
        <FormButton
          variant="subtle"
          color="gray"
          icon="lucide:menu"
          tooltip={t('header.menu')}
          onClick={onMenuClick}
        />

        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {user.name}
        </span>
      </div>

      <div className="flex items-center gap-2.5 ml-auto">
        <LanguageSwitcher />

        <FormButton
          variant="default"
          color="gray"
          icon={colorScheme === 'dark' ? 'lucide:sun' : 'lucide:moon'}
          tooltip={t('header.colorScheme.label')}
          onClick={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
          className="rounded-lg! border-gray-200! dark:border-gray-800!"
        />

        <FormButton
          variant="default"
          color="gray"
          leftIcon="lucide:log-out"
          loading={logoutIsPending}
          onClick={() => logout()}
          className="rounded-lg! border-gray-200! dark:border-gray-800!"
        >
          {t('header.logout')}
        </FormButton>
      </div>
    </header>
  );
}
