
import { SegmentedControl, type SegmentedControlProps } from '@mantine/core';
import { FormInputPropsOnChange, FormInputPropsOnValidate } from './types';
import { useNotFirstEffect } from '@/src/utils/hooks';

export type FormSegmentedControlProps = FormInputPropsOnChange<SegmentedControlProps, string> & FormInputPropsOnValidate;

export function FormSegmentedControl({ value, onChange, onValidate, ...props }: FormSegmentedControlProps) {
  useNotFirstEffect(() => {
    onValidate?.();
  }, [value]);

  return (
    <SegmentedControl
      value={value}
      {...props}
      onChange={value => onChange?.(value)}
    />
  );
}
