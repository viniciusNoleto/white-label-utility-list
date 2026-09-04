'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { UtilsCard } from '@/src/components/utils/Card';
import { AttributionFooter } from '@/src/components/layout/AttributionFooter';
import { useLoginLogicData, LoginLogicComponent } from '@/src/resources/auth/logics/Login';
import { BRAND_NAME } from '@/src/shared/constants/brand';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const loginLogicData = useLoginLogicData({
    onSuccess: () => {
      router.push('/list');
      router.refresh();
    },
  });

  return (
    <div className="flex flex-col flex-1">
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <UtilsCard className="flex flex-col gap-6 w-full max-w-md p-10">
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
              {t('auth.login.title')}
            </h1>

            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('auth.login.subtitle')}
            </span>
          </div>

          <LoginLogicComponent logicData={loginLogicData} />

          <span className="text-sm text-center text-gray-500 dark:text-gray-400">
            {t('auth.login.registerPrompt')}
            {' '}
            <Link
              href="/auth/register"
              className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
            >
              {t('auth.login.registerLink')}
            </Link>
          </span>
        </UtilsCard>
      </main>

      <AttributionFooter />
    </div>
  );
}
