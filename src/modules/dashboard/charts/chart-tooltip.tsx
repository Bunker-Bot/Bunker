import React from 'react';

export interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  valueFormatter?: (value: any) => string;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  valueFormatter = (val) => String(val),
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="p-2.5 rounded-sm bg-zinc-950/95 border border-zinc-800 shadow-xl backdrop-blur-md font-mono text-xs text-white space-y-1 select-none">
      {label && <div className="text-[11px] font-bold text-zinc-400 border-b border-zinc-800 pb-1">{label}</div>}
      <div className="space-y-1 pt-0.5">
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.fill || '#ffffff' }} />
            <span className="text-zinc-400">{item.name || 'Count'}:</span>
            <span className="font-bold text-white">{valueFormatter(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartTooltip;
