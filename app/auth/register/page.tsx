'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { UtilsCard } from '@/src/components/utils/Card';
import { UtilsIf } from '@/src/components/utils/If';
import { AttributionFooter } from '@/src/components/layout/AttributionFooter';
import { useRegisterLogicData, RegisterLogicComponent } from '@/src/resources/auth/logics/Register';
import { BRAND_NAME } from '@/src/shared/constants/brand';

export default function RegisterPage() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const registerLogicData = useRegisterLogicData({
    onSuccess: () => setSubmitted(true),
  });

  return (
    <div className="flex flex-col flex-1">
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <UtilsCard className="flex flex-col gap-6 w-full max-w-md p-10">
          <UtilsIf
            cases={[
              {
                condition: submitted,
                content: () => (
                  <div className="flex flex-col items-center gap-4 text-center py-4">
                    <span className="flex items-center justify-center w-16 h-16 rounded-[20px] bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 text-2xl">
                      ✓
                    </span>

                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {t('auth.register.successTitle')}
                    </h1>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('auth.register.successDescription')}
                    </p>

                    <Link
                      href="/auth/login"
                      className="text-primary-600 dark:text-primary-400 font-semibold hover:underline text-sm"
                    >
                      {t('auth.register.backToLogin')}
                    </Link>
                  </div>
                ),
              },
              {
                content: () => (
                  <>
                    <div className="flex items-center gap-2.5">
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

                    <div className="flex flex-col gap-1">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {t('auth.register.title')}
                      </h1>

                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {t('auth.register.subtitle')}
                      </span>
                    </div>

                    <RegisterLogicComponent logicData={registerLogicData} />

                    <span className="text-sm text-center text-gray-500 dark:text-gray-400">
                      {t('auth.register.loginPrompt')}
                      {' '}
                      <Link
                        href="/auth/login"
                        className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                      >
                        {t('auth.register.loginLink')}
                      </Link>
                    </span>
                  </>
                ),
              },
            ]}
          />
        </UtilsCard>
      </main>

      <AttributionFooter />
    </div>
  );
}
