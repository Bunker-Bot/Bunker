import * as React from 'react';
import { createPortal } from 'react-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar01Icon, ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

export interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const formatDateDisplay = (dateStr?: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const day = d.getDate();
  const month = MONTH_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

export const DatePicker: React.FC<DatePickerProps> = ({
  value = '',
  onChange,
  placeholder = 'Select date',
  disabled = false,
  minDate,
  maxDate,
  className = '',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null);

  const initialDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = React.useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(initialDate.getMonth());

  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

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
    const pickerHeight = 280;
    
    const openAbove = spaceBelow < pickerHeight && spaceAbove > spaceBelow;
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - 260));
    const top = openAbove ? Math.max(8, rect.top - pickerHeight - 4) : rect.bottom + 4;

    setCoords({
      top,
      left,
    });
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;

    updateCoords();

    const handleScroll = (e: Event) => {
      // If scrolling inside the datepicker itself, DO NOT CLOSE
      if (menuRef.current && (e.target === menuRef.current || menuRef.current.contains(e.target as Node))) {
        return;
      }
      // Reposition on scroll of parent containers
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

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const isDayDisabled = (currentStr: string): boolean => {
    if (minDate && currentStr < minDate) return true;
    if (maxDate && currentStr > maxDate) return true;
    return false;
  };

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateString = `${viewYear}-${formattedMonth}-${formattedDay}`;

    if (isDayDisabled(dateString)) return;

    onChange(dateString);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const formattedMonth = String(today.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(today.getDate()).padStart(2, '0');
    const dateString = `${today.getFullYear()}-${formattedMonth}-${formattedDay}`;

    if (isDayDisabled(dateString)) return;

    onChange(dateString);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

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
        <div className="flex items-center gap-2 truncate">
          <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-zinc-500 shrink-0" />
          <span className="truncate">{value ? formatDateDisplay(value) : placeholder}</span>
        </div>
        {value && !disabled ? (
          <span
            onClick={handleClear}
            className="p-0.5 rounded text-zinc-500 hover:text-white cursor-pointer"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={12} />
          </span>
        ) : null}
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
            }}
            className="z-[99999] w-64 p-3 rounded-sm bg-zinc-950 border border-zinc-800 shadow-2xl space-y-3 font-mono text-xs text-zinc-100"
          >
            {/* Calendar Header: Month & Year Nav */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 0) {
                    setViewMonth(11);
                    setViewYear((y) => y - 1);
                  } else {
                    setViewMonth((m) => m - 1);
                  }
                }}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
              </button>

              <span className="font-bold text-white text-xs">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>

              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 11) {
                    setViewMonth(0);
                    setViewYear((y) => y + 1);
                  } else {
                    setViewMonth((m) => m + 1);
                  }
                }}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              </button>
            </div>

            {/* Days of Week Row */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase font-bold text-zinc-500">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const formattedMonth = String(viewMonth + 1).padStart(2, '0');
                const formattedDay = String(day).padStart(2, '0');
                const currentStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
                const isSelected = value === currentStr;
                const isDisabledDay = isDayDisabled(currentStr);

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isDisabledDay}
                    onClick={() => handleSelectDay(day)}
                    className={`py-1 rounded-sm text-xs font-semibold transition-colors ${
                      isDisabledDay
                        ? 'text-zinc-700 cursor-not-allowed opacity-40'
                        : isSelected
                        ? 'bg-white text-black font-bold cursor-pointer'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Shortcuts Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[10px]">
              <button
                type="button"
                onClick={handleSelectToday}
                className="text-zinc-400 hover:text-white cursor-pointer font-bold"
              >
                Today
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setIsOpen(false);
                  }}
                  className="text-rose-400 hover:text-rose-300 cursor-pointer font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default DatePicker;
