
import type { TextInputProps } from '@mantine/core';
import { FormTextInput, type FormTextInputProps } from './TextInput';
import { FormInputPropsOnChange, FormInputPropsOnValidate } from './types';

export type FormDatePickerProps = FormInputPropsOnChange<TextInputProps, string> & FormInputPropsOnValidate

export function FormDateTimePicker({ value, ...props }: FormTextInputProps) {
  return (
    <FormTextInput
      {...props}
      value={value ? value.split('.')[0] : ''}
      type="datetime-local"
    />
  );
}
