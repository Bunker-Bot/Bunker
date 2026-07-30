import * as React from 'react';
import { Input } from '../../components/ui/input';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

export interface ProjectSearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const ProjectSearchInput = React.forwardRef<HTMLInputElement, ProjectSearchInputProps>(
  ({ value, onChange, onClear, className, placeholder = 'Search...', ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <HugeiconsIcon icon={Search01Icon} size={14} className="absolute left-3 text-zinc-500 pointer-events-none" />
        <Input
          ref={ref}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`pl-8 ${value && onClear ? 'pr-8' : ''} ${className}`}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={12} />
          </button>
        )}
      </div>
    );
  }
);

ProjectSearchInput.displayName = 'ProjectSearchInput';
export default ProjectSearchInput;
