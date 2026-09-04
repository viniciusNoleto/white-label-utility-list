
import { PasswordInput, type PasswordInputProps } from "@mantine/core";
import { FormInputPropsOnChange, FormInputPropsOnValidate } from "./types";
import { useNotFirstEffect } from "@/src/utils/hooks";

export type FormPasswordProps = FormInputPropsOnChange<PasswordInputProps, string> & FormInputPropsOnValidate;

export function FormPassword({ value, onChange, onValidate, ...props }: FormPasswordProps) {
  useNotFirstEffect(() => {
    onValidate?.();
  }, [value]);

  return (
    <PasswordInput
      {...props}
      value={value}
      onChange={event => onChange?.(event.currentTarget.value)}
      onBlur={onValidate}
    />
  );
}