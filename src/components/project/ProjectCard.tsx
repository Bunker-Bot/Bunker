import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { HugeiconsIcon } from '@hugeicons/react';

export interface ProjectCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: any;
  action?: React.ReactNode;
  footer?: React.ReactNode;
}

export const ProjectCard = React.forwardRef<HTMLDivElement, ProjectCardProps>(
  ({ title, description, icon, action, footer, children, className, ...props }, ref) => {
    return (
      <Card ref={ref} className={className} {...props}>
        {(title || icon || action) && (
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {icon && <HugeiconsIcon icon={icon} size={22} className="text-rose-500 shrink-0" />}
              <div>
                {title && <CardTitle>{title}</CardTitle>}
                {description && <CardDescription>{description}</CardDescription>}
              </div>
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </CardHeader>
        )}

        <CardContent>{children}</CardContent>

        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    );
  }
);

ProjectCard.displayName = 'ProjectCard';
export default ProjectCard;
