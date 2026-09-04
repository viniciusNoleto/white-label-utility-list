'use client';

import { lazy } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { UtilsFor } from '@/src/components/utils/For';
import { UtilsLoader } from '@/src/components/utils/Loader';
import { FormSegmentedControl } from '@/src/components/form/SegmentedControl';
import { useQueryParamState } from '@/src/utils/hooks';
import type { IUser } from '@/src/resources/user/models/User';

const UsersStatusSection = lazy(() => import('./_components/UsersStatusSection').then(m => ({ default: m.UsersStatusSection })));

const SECTION_LOADER_FALLBACK = (
  <div className="flex items-center justify-center p-12">
    <Icon
      icon="svg-spinners:bars-scale-fade"
      className="w-10 h-10 text-primary-600 dark:text-primary-400"
    />
  </div>
);

type TabValue = IUser['status'];

const TABS: { value: TabValue; labelKey: string }[] = [
  { value: 'pending', labelKey: 'admin.users.tabs.pending' },
  { value: 'approved', labelKey: 'admin.users.tabs.approved' },
  { value: 'rejected', labelKey: 'admin.users.tabs.rejected' },
];

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useQueryParamState<TabValue>('tab', 'pending');

  return (
    <main className="flex flex-col flex-1 gap-6 p-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('admin.users.page.title')}
        </h1>

        <span className="text-sm text-gray-500 dark:text-gray-400">
          {t('admin.users.page.subtitle')}
        </span>
      </div>

      <FormSegmentedControl
        value={tab}
        onChange={value => setTab(value as TabValue)}
        data={TABS.map(item => ({ value: item.value, label: t(item.labelKey) }))}
        className="self-start"
      />

      <UtilsFor
        each={[
          { key: 'pending' as TabValue, content: () => <UsersStatusSection status="pending" /> },
          { key: 'approved' as TabValue, content: () => <UsersStatusSection status="approved" /> },
          { key: 'rejected' as TabValue, content: () => <UsersStatusSection status="rejected" /> },
        ]}
      >
        {({ item }) => (
          <UtilsLoader
            show={item.key === tab}
            fallback={SECTION_LOADER_FALLBACK}
          >
            {item.content}
          </UtilsLoader>
        )}
      </UtilsFor>
    </main>
  );
}
