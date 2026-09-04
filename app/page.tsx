'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { AttributionFooter } from '@/src/components/layout/AttributionFooter';
import { BRAND_NAME } from '@/src/shared/constants/brand';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col flex-1">
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-8 max-w-xl text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 6h13" />
                <path d="M8 12h13" />
                <path d="M8 18h13" />
                <path d="M3 6h.01" />
                <path d="M3 12h.01" />
                <path d="M3 18h.01" />
              </svg>
            </div>

            <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              {BRAND_NAME}
            </h1>

            <p className="text-lg text-gray-500 dark:text-gray-400">
              {t('home.subtitle')}
            </p>
          </div>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {t('home.description')}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/auth/login"
              className="px-8 py-3 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors shadow-sm"
            >
              {t('home.ctaPrimary')}
            </Link>

            <Link
              href="/auth/register"
              className="px-8 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {t('home.ctaSecondary')}
            </Link>
          </div>
        </div>
      </main>

      <AttributionFooter />
    </div>
  );
}
