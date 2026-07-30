import React, { useState } from 'react';
import { TIMEZONES, type TimezoneOption } from '../constants/timezones';
import { HugeiconsIcon } from '@hugeicons/react';
import { Clock01Icon, Search01Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons';

interface TimezoneSelectProps {
  value?: string;
  onChange: (timezoneVal: string) => void;
  disabled?: boolean;
}

export const TimezoneSelect: React.FC<TimezoneSelectProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedTimezone = TIMEZONES.find((t) => t.value === value);

  const filteredTimezones = TIMEZONES.filter(
    (t) =>
      t.value.toLowerCase().includes(search.toLowerCase()) ||
      t.label.toLowerCase().includes(search.toLowerCase()) ||
      t.offset.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (t: TimezoneOption) => {
    onChange(t.value);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative font-mono text-xs select-none">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-60 cursor-pointer"
      >
        <HugeiconsIcon icon={Clock01Icon} size={14} className="absolute left-3 top-3 text-zinc-500" />
        <span className="truncate">
          {selectedTimezone ? (
            <span className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-400 font-bold">{selectedTimezone.offset}</span>
              <span>{selectedTimezone.value}</span>
            </span>
          ) : (
            <span className="text-zinc-500">{value || 'UTC'}</span>
          )}
        </span>
        <HugeiconsIcon icon={ArrowDown01Icon} size={14} className="text-zinc-500 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 p-2 rounded-sm bg-zinc-950 border border-zinc-800 shadow-2xl space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
          <div className="relative">
            <HugeiconsIcon icon={Search01Icon} size={12} className="absolute left-2.5 top-2.5 text-zinc-500" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search timezone..."
              className="w-full pl-8 pr-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded-sm text-[11px] text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>

          <div className="space-y-0.5">
            {filteredTimezones.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => handleSelect(t)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-left hover:bg-zinc-900 transition-colors cursor-pointer ${
                  selectedTimezone?.value === t.value ? 'bg-zinc-900 text-white font-bold' : 'text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[10px] text-zinc-400 font-bold shrink-0">{t.offset}</span>
                  <span className="truncate">{t.value}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimezoneSelect;
