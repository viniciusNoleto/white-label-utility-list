
export type FormInputPropsOnChange<T extends object = object, U = any> = Omit<T, 'onChange' | 'value'> & { onChange?: (value: U) => any, value?: U };

export type FormInputPropsOnValidate = { onValidate?: () => any };
