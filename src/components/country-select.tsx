import React, { useState } from 'react';
import { COUNTRIES, type CountryOption } from '../constants/countries';
import { HugeiconsIcon } from '@hugeicons/react';
import { GlobalIcon, Search01Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons';

interface CountrySelectProps {
  value?: string;
  onChange: (countryName: string) => void;
  disabled?: boolean;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedCountry = COUNTRIES.find(
    (c) => c.name.toLowerCase() === (value || '').toLowerCase() || c.code === value
  );

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (c: CountryOption) => {
    onChange(c.name);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className="relative font-mono text-xs select-none">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-60 cursor-pointer"
      >
        <HugeiconsIcon icon={GlobalIcon} size={14} className="absolute left-3 top-3 text-zinc-500" />
        <span className="truncate">
          {selectedCountry ? (
            <span className="flex items-center gap-1.5">
              <span>{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
            </span>
          ) : (
            <span className="text-zinc-500">{value || 'Select Country...'}</span>
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
              placeholder="Search country..."
              className="w-full pl-8 pr-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded-sm text-[11px] text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>

          <div className="space-y-0.5">
            {filteredCountries.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => handleSelect(c)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm text-left hover:bg-zinc-900 transition-colors cursor-pointer ${
                  selectedCountry?.code === c.code ? 'bg-zinc-900 text-white font-bold' : 'text-zinc-300'
                }`}
              >
                <span>{c.flag}</span>
                <span className="truncate">{c.name}</span>
                <span className="text-[10px] text-zinc-500 ml-auto">{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountrySelect;
