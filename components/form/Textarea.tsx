
import { Textarea, type TextareaProps } from '@mantine/core';
import { FormInputPropsOnChange, FormInputPropsOnValidate } from './types';
import { useNotFirstEffect } from '@/src/utils/hooks';

export type FormTextareaProps = FormInputPropsOnChange<TextareaProps, string|any> & FormInputPropsOnValidate;

export function FormTextarea({ value, onChange, onValidate, ...props }: FormTextareaProps) {
  useNotFirstEffect(() => {
    onValidate?.();
  }, [value]);

  return (
    <Textarea
      {...props}
      value={value}
      onChange={event => onChange?.(event.currentTarget.value)}
      onBlur={onValidate}
    />
  );
}