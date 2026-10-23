
import type { TextInputProps } from '@mantine/core';
import { FormTextInput, type FormTextInputProps } from './TextInput';
import { FormInputPropsOnChange, FormInputPropsOnValidate } from './types';

export type FormDatePickerProps = FormInputPropsOnChange<TextInputProps, string> & FormInputPropsOnValidate

export function FormDatePicker(props: FormTextInputProps) {
  return (
    <FormTextInput
      {...props}
      type="date"
    />
  );
}
