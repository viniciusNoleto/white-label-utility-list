
import { Icon } from '@iconify/react';
import { Button, ButtonProps, Tooltip } from '@mantine/core';
import React from 'react';
import { UtilsIf } from '../utils/If';

export type FormButtonProps = ButtonProps & {
  label?: string;
  tooltip?: string;
  icon?: string;
  leftIcon?: string;
  rightIcon?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: React.MouseEventHandler<globalThis.HTMLButtonElement>
};

export function FormButton({ leftIcon, rightIcon, ...props }: FormButtonProps) {
  const button = (
    <Button
      {...props}
      leftSection={ leftIcon ? <Icon icon={leftIcon} className="w-4 h-4" /> : props.leftSection }
      rightSection={ rightIcon ? <Icon icon={rightIcon} className="w-4 h-4" /> : props.rightSection }
      onClick={props.onClick}
    >
      { props.children || props.label || (props.icon ? <Icon icon={props.icon} className="w-4 h-4" /> : null) }
    </Button>
  );

  return (
    <UtilsIf
      cases={[
        {
          condition: !!props.tooltip,
          content: () => (
            <Tooltip label={props.tooltip || null} withArrow>
              {button}
            </Tooltip>
          )
        },
        {
          content: () => button,
        }
      ]}
    />
  );
}