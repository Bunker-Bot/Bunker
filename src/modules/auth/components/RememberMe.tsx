import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon } from '@hugeicons/core-free-icons';

interface RememberMeProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export const RememberMe: React.FC<RememberMeProps> = ({
  checked,
  onChange,
  disabled = false,
  id = 'remember-me'
}) => {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer select-none transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <div className="relative flex items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className="w-4 h-4 rounded border border-zinc-700 bg-zinc-900/90 peer-checked:bg-white peer-checked:border-white peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-400/50 transition-all flex items-center justify-center shadow-inner">
          {checked && (
            <HugeiconsIcon icon={Tick02Icon} size={12} className="text-black stroke-[3]" />
          )}
        </div>
      </div>
      <span>Remember me</span>
    </label>
  );
};

export default RememberMe;
