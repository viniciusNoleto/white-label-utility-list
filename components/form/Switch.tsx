
import { Switch, type SwitchProps } from '@mantine/core';
import { FormInputPropsOnChange, FormInputPropsOnValidate } from "./types";
import { useNotFirstEffect } from '@/src/utils/hooks';

export type FormSwitchProps = FormInputPropsOnChange<SwitchProps, boolean> & FormInputPropsOnValidate;


export function FormSwitch({ value, onChange, onValidate, ...props }: FormSwitchProps) {
  useNotFirstEffect(() => {
    onValidate?.();
  }, [value]);

  return (
    <Switch
      {...props}
      value={value as any}
      checked={value}
      onChange={event => onChange?.(event.currentTarget.checked)}
      onBlur={onValidate}
    />
  );
}