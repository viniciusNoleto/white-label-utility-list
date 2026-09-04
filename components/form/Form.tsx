import React from "react";

export type FormProps = React.ComponentPropsWithoutRef<'form'> & {
  children: React.ReactNode;
  onSubmit?: () => void;
};

export function Form({ children, onSubmit, ...props }: FormProps) {
  return (
    <form
      {...props}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      {children}
    </form>
  );
}