'use client';

import { useTranslation } from 'react-i18next';

const AUTHOR_LINKEDIN_URL = 'https://www.linkedin.com/in/vin%C3%ADcius-nol%C3%AAto-de-ara%C3%BAjo/';

export function AttributionFooter() {
  const { t } = useTranslation();

  return (
    <footer className="flex items-center justify-center py-4 px-6 text-xs text-gray-400 dark:text-gray-600 border-t border-gray-200 dark:border-gray-800 bg-stone-50/80 dark:bg-neutral-950/80 backdrop-blur-sm">
      <span>
        {t('footer.createdBy')}
        {' '}
        <a
          href={AUTHOR_LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600 dark:hover:text-gray-300"
        >
          Vinícius Nolêto de Araújo
        </a>
      </span>
    </footer>
  );
}
