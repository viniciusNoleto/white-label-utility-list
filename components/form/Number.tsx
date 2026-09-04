
import { NumberInput, type NumberInputProps } from '@mantine/core';
import { FormInputPropsOnChange, FormInputPropsOnValidate } from './types';
import { useNotFirstEffect } from '@/src/utils/hooks';

export type FormNumberInputProps = FormInputPropsOnChange<NumberInputProps, number|any> & FormInputPropsOnValidate;

export function FormNumberInput({ value, onChange, onValidate, ...props }: FormNumberInputProps) {
  useNotFirstEffect(() => {
    onValidate?.();
  }, [value]);

  return (
    <NumberInput
      {...props}
      value={value}
      onChange={value => onChange?.(value)}
      onBlur={onValidate}
    />
  );
}
