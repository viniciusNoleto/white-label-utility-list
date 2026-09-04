
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

// import { DatePickerInput, DateValue, type DatePickerInputProps } from '@mantine/dates';
// import { FormInputPropsOnValidate } from './types';
// import { useNotFirstEffect } from '@/src/utils/hooks';
// import { useMemo } from 'react';

// export type FormDatePickerProps = Omit<DatePickerInputProps, 'onChange' | 'value' | 'type'> & FormInputPropsOnValidate & (
//   { onChange?: (value: (DateValue | any)[]) => any, value: (DateValue | any)[], type: 'multiple' }
//   | { onChange?: (value: [(DateValue | any), (DateValue | any)]) => any, value: [(DateValue | any), (DateValue | any)], type: 'range' }
//   | { onChange?: (value: (DateValue | any)) => any, value: (DateValue | any), type?: 'single' | never | undefined | null }
// );

// export function FormDatePicker({
//   value,
//   onChange,
//   onValidate,
//   valueFormat = "DD/MM/YYYY",
//   placeholder = "dd/mm/yyyy",
//   ...props
// }: FormDatePickerProps) {
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
//     <DatePickerInput
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
