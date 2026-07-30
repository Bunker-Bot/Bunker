import * as React from 'react';
import { Button, type ButtonProps } from '../../components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';

export interface ProjectButtonProps extends ButtonProps {
  icon?: any;
  rightIcon?: any;
}

export const ProjectButton = React.forwardRef<HTMLButtonElement, ProjectButtonProps>(
  ({ icon, rightIcon, children, isLoading, ...props }, ref) => {
    return (
      <Button ref={ref} isLoading={isLoading} {...props}>
        {!isLoading && icon && <HugeiconsIcon icon={icon} size={16} className="shrink-0" />}
        {children}
        {!isLoading && rightIcon && <HugeiconsIcon icon={rightIcon} size={16} className="shrink-0" />}
      </Button>
    );
  }
);

ProjectButton.displayName = 'ProjectButton';
export default ProjectButton;
