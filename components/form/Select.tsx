import { getter, type Hook } from "@/src/utils/data";
import { Select, SelectProps } from "@mantine/core";
import { useMemo } from "react";
import { FormInputPropsOnChange, FormInputPropsOnValidate } from "./types";
import { useNotFirstEffect } from "@/src/utils/hooks";

export type FormSelectProps<T> = Omit<FormInputPropsOnChange<SelectProps>, 'data'> & FormInputPropsOnValidate & {
  data?: T[];
  valueField?: Hook<T>;
  labelField?: Hook<T>;
};

export function FormSelect<T>({ value, onChange, onValidate, valueField, labelField, ...props }: FormSelectProps<T>) {
  useNotFirstEffect(() => {
    onValidate?.();
  }, [value]);

  const data = useMemo(() => {
    if (!Array.isArray(props.data)) return [];

    if (valueField || labelField) return (props.data as any[]).map(item => ({
      value: getter(item, valueField),
      label: getter(item, labelField)
    }));

    return props.data as SelectProps['data'];
  }, [props.data, valueField, labelField]);

  const clearable = useMemo(() => !props.disabled && props.clearable !== false && value, [props.disabled, props.clearable, value])

  return (
    <Select
      {...props}
      value={value}
      clearable={clearable}
      data={data}
      onChange={event => onChange?.(event)}
      onBlur={onValidate}
    />
  );
}