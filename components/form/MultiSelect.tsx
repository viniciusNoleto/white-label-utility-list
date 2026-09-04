import { getter, type Hook } from "@/src/utils/data";
import { MultiSelect, MultiSelectProps } from "@mantine/core";
import { useMemo } from "react";
import { FormInputPropsOnChange, FormInputPropsOnValidate } from "./types";
import { useNotFirstEffect } from "@/src/utils/hooks";

export type FormMultiSelectProps<T> = Omit<FormInputPropsOnChange<MultiSelectProps>, 'data'> & FormInputPropsOnValidate & {
  data?: T[];
  valueField?: Hook<T>;
  labelField?: Hook<T>;
};

export function FormMultiSelect<T>({ value, valueField, labelField, onChange, onValidate, ...props }: FormMultiSelectProps<T>) {
  useNotFirstEffect(() => {
    onValidate?.();
  }, [value]);

  const data = useMemo(() => {
    if (!Array.isArray(props.data)) return [];

    if (valueField || labelField) return (props.data as any[]).map(item => ({
      value: getter(item, valueField),
      label: getter(item, labelField)
    }));

    return props.data as MultiSelectProps['data'];
  }, [props.data, valueField, labelField]);

  const clearable = useMemo(() => !props.disabled && props.clearable !== false && Array.isArray(value) && value.length > 0, [props.disabled, props.clearable, value])

  return (
    <MultiSelect
      {...props}
      value={value}
      clearable={clearable}
      data={data}
      onChange={event => onChange?.(event)}
      onBlur={onValidate}
    />
  );
}