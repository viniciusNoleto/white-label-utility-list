
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

// import { DateTimePicker, DateValue, type DateTimePickerProps } from '@mantine/dates';
// import { FormInputPropsOnValidate } from './types';
// import { useNotFirstEffect } from '@/src/utils/hooks';
// import { useMemo } from 'react';

// export type FormDateTimePickerProps = Omit<DateTimePickerProps, 'onChange' | 'value' | 'type'> & FormInputPropsOnValidate & (
//   { onChange?: (value: (DateValue | any)[]) => any, value: (DateValue | any)[], type: 'multiple' }
//   | { onChange?: (value: [(DateValue | any), (DateValue | any)]) => any, value: [(DateValue | any), (DateValue | any)], type: 'range' }
//   | { onChange?: (value: (DateValue | any)) => any, value: (DateValue | any), type?: 'single' | never | undefined | null }
// );

// export function FormDateTimePicker({
//   value,
//   onChange,
//   onValidate,
//   valueFormat = "DD/MM/YYYY HH:mm",
//   placeholder = "dd/mm/aaaa hh:mm",
//   ...props
// }: FormDateTimePickerProps) {
//   useNotFirstEffect(() => {
//     onValidate?.();
//   }, [value]);

//   const internValue = useMemo(() => {
//     if (!value) return null
//     if (Array.isArray(value)) return value.map((d) => d instanceof Date ? d : new Date(d))
//     return value instanceof Date ? value : new Date(value)
//   }, [value])

//   return (
//     // @ts-expect-error
//     <DateTimePicker
//       {...props}
//       clearable={!props.disabled}
//       value={internValue}
//       valueFormat={valueFormat}
//       placeholder={placeholder}
//       onChange={event => onChange?.(event as any)}
//       onDropdownClose={onValidate}
//       onBlur={onValidate}
//     />
//   );
// }
