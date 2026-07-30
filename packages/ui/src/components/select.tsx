import * as React from 'react';
import { createPortal } from 'react-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, Tick02Icon } from '@hugeicons/core-free-icons';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [coords, setCoords] = React.useState<{ top: number; left: number; width: number } | null>(null);
  
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const updateCoords = React.useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 140),
      });
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      updateCoords();
      const handleScrollOrResize = () => setIsOpen(false);
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }
  }, [isOpen, updateCoords]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left font-mono select-none ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            if (!isOpen) updateCoords();
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full inline-flex items-center justify-between gap-2 px-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-200 hover:bg-zinc-800/80 hover:text-white transition-colors cursor-pointer disabled:opacity-50 ${
          isOpen ? 'border-zinc-700 ring-1 ring-zinc-700' : ''
        }`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={14}
          className={`text-zinc-500 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              width: coords.width,
            }}
            className="z-[99999] py-1 rounded-sm bg-zinc-950 border border-zinc-800 shadow-2xl space-y-0.5 max-h-60 overflow-y-auto font-mono text-xs"
          >
            {options.map((opt, idx) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={`${opt.value}-${idx}`}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                  } ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <HugeiconsIcon icon={Tick02Icon} size={14} className="text-white shrink-0" />}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};

export default Select;
