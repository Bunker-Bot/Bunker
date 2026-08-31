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
  const [coords, setCoords] = React.useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const updateCoords = React.useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    
    // Check if the button is scrolled out of viewport
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      setIsOpen(false);
      return;
    }

    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    const idealMaxHeight = 240;
    
    // If not enough space below (<160px) and more space above, open above
    const openAbove = spaceBelow < 160 && spaceAbove > spaceBelow;
    const availableHeight = openAbove ? spaceAbove : spaceBelow;
    const actualMaxHeight = Math.max(100, Math.min(idealMaxHeight, availableHeight));

    const width = Math.max(rect.width, 140);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    const top = openAbove ? Math.max(8, rect.top - actualMaxHeight - 4) : rect.bottom + 4;

    setCoords({
      top,
      left,
      width,
      maxHeight: actualMaxHeight,
    });
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;

    updateCoords();

    const handleScroll = (e: Event) => {
      // If scrolling inside the dropdown menu itself (e.g. scrolling/sliding down to select clients), DO NOT CLOSE!
      if (menuRef.current && (e.target === menuRef.current || menuRef.current.contains(e.target as Node))) {
        return;
      }
      // If an outside container or window scrolls, update coords so dropdown stays pinned to button
      updateCoords();
    };

    const handleResize = () => {
      updateCoords();
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, updateCoords]);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

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
              maxHeight: coords.maxHeight,
              overscrollBehavior: 'contain',
            }}
            className="z-[99999] py-1 rounded-sm bg-zinc-950 border border-zinc-800 shadow-2xl space-y-0.5 overflow-y-auto font-mono text-xs custom-scrollbar"
            onWheel={(e) => {
              // Stop scroll propagation so sliding/scrolling dropdown doesn't scroll modal behind it
              e.stopPropagation();
            }}
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
