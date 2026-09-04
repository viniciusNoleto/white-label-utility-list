'use client';

import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { FormButton } from '@/src/components/form/Button';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import { approveUserService } from '../services/approveUser';

export function useApproveUserLogicData({ userId, onSuccess }: { userId: number; onSuccess: () => void }) {
  const { i18n, t } = useTranslation();

  const approveUserMutation = useMutation({
    mutationFn: () => approveUserService({ userId }),
    onSuccess: (res) => {
      notifications.show({ message: resolveApiMessage(res.message, i18n.language), color: 'green' });
      onSuccess();
    },
    onError: (err: any) => {
      notifications.show({
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('admin.users.notifications.approveError'),
        color: 'red',
      });
    },
  });

  return { approveUserMutation };
}

export function ApproveUserLogicButton({ logicData }: { logicData: ReturnType<typeof useApproveUserLogicData> }) {
  const { t } = useTranslation();

  const {
    approveUserMutation: { mutate: approveUser, isPending: approveUserIsPending },
  } = logicData;

  return (
    <FormButton
      icon="lucide:check"
      tooltip={t('admin.users.actions.approve')}
      color="green"
      variant="outline"
      loading={approveUserIsPending}
      onClick={() => approveUser()}
    />
  );
}
