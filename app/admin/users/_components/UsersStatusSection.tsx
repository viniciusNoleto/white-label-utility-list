'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { UtilsCard } from '@/src/components/utils/Card';
import { UtilsTable } from '@/src/components/utils/Table';
import { getUsersService, GET_USERS_KEY } from '@/src/resources/user/services/getUsers';
import { useApproveUserLogicData, ApproveUserLogicButton } from '@/src/resources/user/logics/ApproveUser';
import { useRejectUserLogicData, RejectUserLogicButton } from '@/src/resources/user/logics/RejectUser';
import type { IUser } from '@/src/resources/user/models/User';

const STATUS_COLORS: Record<IUser['status'], string> = {
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
};

function UserRowActions({ user, onDone }: { user: IUser; onDone: () => void }) {
  const approveUserLogicData = useApproveUserLogicData({ userId: user.id, onSuccess: onDone });
  const rejectUserLogicData = useRejectUserLogicData({ userId: user.id, onSuccess: onDone });

  return (
    <div className="flex items-center justify-center gap-1">
      {user.status !== 'approved' ? (
        <ApproveUserLogicButton logicData={approveUserLogicData} />
      ) : null}

      {user.status !== 'rejected' ? (
        <RejectUserLogicButton logicData={rejectUserLogicData} />
      ) : null}
    </div>
  );
}

export function UsersStatusSection({ status }: { status: IUser['status'] }) {
  const { t } = useTranslation();

  const {
    data: usersData,
    isFetching: usersIsFetching,
    refetch: usersRefetch,
  } = useQuery({
    queryKey: [...GET_USERS_KEY, status],
    queryFn: ({ signal }) => getUsersService({ signal, query: { status } }),
  });

  const users = useMemo(() => usersData?.data ?? [], [usersData]);

  return (
    <UtilsCard>
      <UtilsTable
        rows={users}
        rowKey={({ item }) => item.id}
        loading={usersIsFetching}
        emptyText={t('admin.users.table.empty')}
        columns={{
          name: t('admin.users.table.columns.name'),
          email: t('admin.users.table.columns.email'),
          status: t('admin.users.table.columns.status'),
          actions: t('common.table.actionsColumn'),
        }}
        renderCells={{
          email: ({ item }) => (
            <span className="font-mono text-[13px]">
              {item.email}
            </span>
          ),
          status: ({ item }) => (
            <Badge
              color={STATUS_COLORS[item.status]}
              radius="xl"
            >
              {t(`admin.users.status.${item.status}`)}
            </Badge>
          ),
          actions: ({ item }) => (
            <UserRowActions
              user={item}
              onDone={() => usersRefetch()}
            />
          ),
        }}
      />
    </UtilsCard>
  );
}
