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
import { registerUserService } from '../services/registerUser';

export function useRegisterLogicData({ onSuccess }: { onSuccess: () => void }) {
  const { t, i18n } = useTranslation();

  const registerSchema = useMemo(() => yup.object({
    name: yup.string().default('').required(t('auth.register.validation.nameRequired')).max(150),
    email: yup.string().default('').required(t('auth.register.validation.emailRequired')).email(t('auth.register.validation.emailInvalid')),
    password: yup.string().default('').required(t('auth.register.validation.passwordRequired')).min(8, t('auth.register.validation.passwordMin')),
  }), [t]);

  const registerValidatedFormState = useValidatedFormState(registerSchema);

  const registerMutation = useMutation({
    mutationFn: () => registerUserService({ body: registerValidatedFormState.state }),
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: any) => {
      notifications.show({
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('auth.register.notifications.error'),
        color: 'red',
      });
    },
  });

  return { registerValidatedFormState, registerMutation };
}

export function RegisterLogicComponent({ logicData }: { logicData: ReturnType<typeof useRegisterLogicData> }) {
  const { t } = useTranslation();

  const {
    registerValidatedFormState: { field: registerField, validate: registerValidate },
    registerMutation: { mutate: register, isPending: registerIsPending },
  } = logicData;

  async function submit() {
    if (!await registerValidate()) return;
    register();
  }

  return (
    <Form
      onSubmit={submit}
      className="flex flex-col gap-6"
    >
      <FormTextInput
        label={t('auth.register.name.label')}
        placeholder={t('auth.register.name.placeholder')}
        {...registerField('name')}
        required
      />

      <FormTextInput
        label={t('auth.register.email.label')}
        placeholder={t('auth.register.email.placeholder')}
        {...registerField('email')}
        required
      />

      <FormPassword
        label={t('auth.register.password.label')}
        placeholder={t('auth.register.password.placeholder')}
        {...registerField('password')}
        required
      />

      <FormButton
        type="submit"
        color="primary"
        loading={registerIsPending}
        fullWidth
      >
        {t('auth.register.submit')}
      </FormButton>
    </Form>
  );
}
