'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UtilsIf } from '@/src/components/utils/If';
import { FormSegmentedControl } from '@/src/components/form/SegmentedControl';
import { FieldsSection } from './_components/FieldsSection';
import { ColumnsSection } from './_components/ColumnsSection';
import { ListsSection } from './_components/ListsSection';
import { ObjectsSection } from './_components/ObjectsSection';

type TabValue = 'fields' | 'columns' | 'lists' | 'objects';

const TABS: { value: TabValue; labelKey: string }[] = [
  { value: 'fields', labelKey: 'admin.settings.tabs.fields' },
  { value: 'columns', labelKey: 'admin.settings.tabs.columns' },
  { value: 'lists', labelKey: 'admin.settings.tabs.lists' },
  { value: 'objects', labelKey: 'admin.settings.tabs.objects' },
];

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabValue>('fields');

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

      <UtilsIf
        cases={[
          { condition: tab === 'fields', content: () => <FieldsSection /> },
          { condition: tab === 'columns', content: () => <ColumnsSection /> },
          { condition: tab === 'lists', content: () => <ListsSection /> },
          { condition: tab === 'objects', content: () => <ObjectsSection /> },
        ]}
      />
    </main>
  );
}
