'use client';

import { lazy } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { FormSegmentedControl } from '@/src/components/form/SegmentedControl';
import { UtilsLoader } from '@/src/components/utils/Loader';
import { UtilsFor } from '@/src/components/utils/For';
import { useQueryParamState } from '@/src/utils/hooks';

const SECTION_LOADER_FALLBACK = (
  <div className="flex items-center justify-center p-12">
    <Icon
      icon="svg-spinners:bars-scale-fade"
      className="w-10 h-10 text-primary-600 dark:text-primary-400"
    />
  </div>
);

const FieldsSection = lazy(() => import('./_components/FieldsSection').then(m => ({ default: m.FieldsSection })));
const ColumnsSection = lazy(() => import('./_components/ColumnsSection').then(m => ({ default: m.ColumnsSection })));
const ListsSection = lazy(() => import('./_components/ListsSection').then(m => ({ default: m.ListsSection })));
const ObjectsSection = lazy(() => import('./_components/ObjectsSection').then(m => ({ default: m.ObjectsSection })));

type TabValue = 'fields' | 'columns' | 'lists' | 'objects';

const TABS: { value: TabValue; labelKey: string }[] = [
  { value: 'fields', labelKey: 'admin.settings.tabs.fields' },
  { value: 'columns', labelKey: 'admin.settings.tabs.columns' },
  { value: 'lists', labelKey: 'admin.settings.tabs.lists' },
  { value: 'objects', labelKey: 'admin.settings.tabs.objects' },
];

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useQueryParamState<TabValue>('tab', 'fields');

  return (
    <main className="flex flex-col flex-1 gap-6 p-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('admin.settings.page.title')}
        </h1>

        <span className="text-sm text-gray-500 dark:text-gray-400">
          {t('admin.settings.page.subtitle')}
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
          { key: 'fields', content: () => <FieldsSection /> },
          { key: 'columns', content: () => <ColumnsSection /> },
          { key: 'lists', content: () => <ListsSection /> },
          { key: 'objects', content: () => <ObjectsSection /> },
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
