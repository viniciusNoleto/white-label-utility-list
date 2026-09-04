'use client';

import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import * as yup from 'yup';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from '@/src/components/form/Form';
import { FormButton } from '@/src/components/form/Button';
import { FormTextInput } from '@/src/components/form/TextInput';
import { FormPassword } from '@/src/components/form/Password';
import { useValidatedFormState } from '@/src/utils/state';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import { loginUserService } from '../services/loginUser';
import { useAuthStore } from '../stores/useAuthStore';
import type { IAuthUser } from '../models/AuthUser';

export function useLoginLogicData({ onSuccess }: { onSuccess: (user: IAuthUser) => void }) {
  const { t, i18n } = useTranslation();

  const loginSchema = useMemo(() => yup.object({
    email: yup.string().default('').required(t('auth.login.validation.emailRequired')).email(t('auth.login.validation.emailInvalid')),
    password: yup.string().default('').required(t('auth.login.validation.passwordRequired')),
  }), [t]);

  const loginValidatedFormState = useValidatedFormState(loginSchema);

  const loginMutation = useMutation({
    mutationFn: () => loginUserService({ body: loginValidatedFormState.state }),
    onSuccess: (res) => {
      useAuthStore.getState().setTokens(res.data);
      useAuthStore.getState().setUser(res.data.user);

      onSuccess(res.data.user);
    },
    onError: (err: any) => {
      notifications.show({
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('auth.login.notifications.error'),
        color: 'red',
      });
    },
  });

  return { loginValidatedFormState, loginMutation };
}

export function LoginLogicComponent({ logicData }: { logicData: ReturnType<typeof useLoginLogicData> }) {
  const { t } = useTranslation();

  const {
    loginValidatedFormState: { field: loginField, validate: loginValidate },
    loginMutation: { mutate: login, isPending: loginIsPending },
  } = logicData;

  async function submit() {
    if (!await loginValidate()) return;
    login();
  }

  return (
    <Form
      onSubmit={submit}
      className="flex flex-col gap-6"
    >
      <FormTextInput
        label={t('auth.login.email.label')}
        placeholder={t('auth.login.email.placeholder')}
        {...loginField('email')}
        required
      />

      <FormPassword
        label={t('auth.login.password.label')}
        placeholder={t('auth.login.password.placeholder')}
        {...loginField('password')}
        required
      />

      <FormButton
        type="submit"
        color="primary"
        loading={loginIsPending}
        fullWidth
      >
        {t('auth.login.submit')}
      </FormButton>
    </Form>
  );
}
