
import { TextInput, type TextInputProps } from '@mantine/core';
import { FormInputPropsOnChange, FormInputPropsOnValidate } from './types';
import { useNotFirstEffect } from '@/src/utils/hooks';

export type FormTextInputProps = FormInputPropsOnChange<TextInputProps, string> & FormInputPropsOnValidate & {
  trim?: boolean
};

export function FormTextInput({ value, onChange, onValidate, trim, ...props }: FormTextInputProps) {
  useNotFirstEffect(() => {
    onValidate?.();
  }, [value]);

  return (
    <TextInput
      value={value}
      {...props}
      onChange={event => onChange?.(trim ? event.currentTarget.value.trim() : event.currentTarget.value)}
      onBlur={onValidate}
    />
  );
}