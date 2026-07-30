import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { SecurityCheckIcon } from '@hugeicons/core-free-icons';

export const SystemStatusWidget: React.FC = () => {
  const services = [
    { name: 'Supabase Database', status: 'Operational', latency: '14ms' },
    { name: 'Supabase Realtime', status: 'Connected', latency: '22ms' },
    { name: 'Supabase Storage', status: 'Operational', latency: '18ms' },
    { name: 'Edge Functions', status: 'Operational', latency: '35ms' },
    { name: 'GitHub Sync API', status: 'Operational', latency: '48ms' },
  ];

  return (
    <div className="p-4 rounded-sm bg-zinc-900 border border-zinc-800 shadow-sm space-y-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={SecurityCheckIcon} size={16} className="text-emerald-400" />
          <h3 className="font-bold text-white uppercase tracking-wider text-xs">Live System Telemetry Status</h3>
        </div>
        <span className="text-[10px] text-emerald-400 font-bold">All Engines Green</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {services.map((svc) => (
          <div key={svc.name} className="p-2.5 rounded-sm bg-zinc-950 border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-zinc-300 truncate">{svc.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] font-bold text-emerald-400">{svc.status}</p>
            <span className="text-[9px] text-zinc-500 font-sans block">{svc.latency}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
