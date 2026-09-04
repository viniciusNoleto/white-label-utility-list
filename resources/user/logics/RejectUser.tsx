'use client';

import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { FormButton } from '@/src/components/form/Button';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import { rejectUserService } from '../services/rejectUser';

export function useRejectUserLogicData({ userId, onSuccess }: { userId: number; onSuccess: () => void }) {
  const { i18n, t } = useTranslation();

  const rejectUserMutation = useMutation({
    mutationFn: () => rejectUserService({ userId }),
    onSuccess: (res) => {
      notifications.show({ message: resolveApiMessage(res.message, i18n.language), color: 'green' });
      onSuccess();
    },
    onError: (err: any) => {
      notifications.show({
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('admin.users.notifications.rejectError'),
        color: 'red',
      });
    },
  });

  return { rejectUserMutation };
}

export function RejectUserLogicButton({ logicData }: { logicData: ReturnType<typeof useRejectUserLogicData> }) {
  const { t } = useTranslation();

  const {
    rejectUserMutation: { mutate: rejectUser, isPending: rejectUserIsPending },
  } = logicData;

  return (
    <FormButton
      icon="lucide:x"
      tooltip={t('admin.users.actions.reject')}
      color="red"
      variant="outline"
      loading={rejectUserIsPending}
      onClick={() => rejectUser()}
    />
  );
}
