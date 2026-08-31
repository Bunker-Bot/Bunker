import React, { useState, useMemo } from 'react';
import { useGuardianEditorStore } from '../state/useGuardianEditorStore';
import { ColorPicker, CURATED_COLOR_PALETTES } from '../../../../components/ui/color-picker';
import { HugeiconsIcon } from '@hugeicons/react';
import { ColorPickerIcon } from '@hugeicons/core-free-icons';

type ColorRole = 'primary' | 'secondary' | 'accent' | 'visor' | 'glow';

interface RoleOption {
  id: ColorRole;
  label: string;
  desc: string;
  configKey: 'primaryColor' | 'secondaryColor' | 'accentColor' | 'visorTint' | 'glowColor';
}

const COLOR_ROLES: RoleOption[] = [
  { id: 'primary', label: 'Primary Shell', desc: 'Main cranial helmet & armor', configKey: 'primaryColor' },
  { id: 'secondary', label: 'Secondary Chassis', desc: 'Collar & shoulder plates', configKey: 'secondaryColor' },
  { id: 'accent', label: 'Accent Indicator', desc: 'Ear telemetry & trim lines', configKey: 'accentColor' },
  { id: 'visor', label: 'Visor Luminescence', desc: 'Optic sensor & scan core', configKey: 'visorTint' },
  { id: 'glow', label: 'Backdrop Glow', desc: 'Spatial radial aura', configKey: 'glowColor' },
];

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return { h: 0, s: 0, l: 0 };
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h = Math.round(h * 60);
  }
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const rgb = [f(0), f(8), f(4)].map((x) =>
    Math.round(x * 255).toString(16).padStart(2, '0')
  );
  return `#${rgb.join('')}`.toUpperCase();
}

export const ColorControls: React.FC = () => {
  const {
    draftConfig,
    updateConfig,
    recentColors,
    addRecentColor,
  } = useGuardianEditorStore();

  const [activeRole, setActiveRole] = useState<ColorRole>('primary');
  const [hexInput, setHexInput] = useState('');

  const currentRole = COLOR_ROLES.find((r) => r.id === activeRole) || COLOR_ROLES[0];
  const activeColor = draftConfig[currentRole.configKey];

  // Update hex input when active role or color changes
  React.useEffect(() => {
    setHexInput(activeColor.toUpperCase());
  }, [activeColor, activeRole]);

  const handleSelectColor = (hex: string) => {
    const upper = hex.toUpperCase();
    setHexInput(upper);
    addRecentColor(upper);
    updateConfig(() => ({
      [currentRole.configKey]: upper,
    }));
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      handleSelectColor(val);
    }
  };

  // Color harmonies
  const hsl = useMemo(() => hexToHsl(activeColor), [activeColor]);
  const harmonies = useMemo(() => {
    return [
      { name: 'Complementary', hex: hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l) },
      { name: 'Analogous', hex: hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l) },
      { name: 'Triadic', hex: hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l) },
    ];
  }, [hsl]);

  return (
    <div className="space-y-6 font-mono text-xs select-none">
      {/* 1. Semantic Color Roles Selector */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <HugeiconsIcon icon={ColorPickerIcon} size={14} className="text-cyan-400" />
          <span>Semantic Color Role</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {COLOR_ROLES.map((role) => {
            const isSelected = activeRole === role.id;
            const colorVal = draftConfig[role.configKey];
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setActiveRole(role.id)}
                className={`p-2.5 rounded-sm border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/80 ring-1 ring-cyan-500/50 text-white shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-zinc-700 shrink-0 shadow-sm"
                  style={{ backgroundColor: colorVal }}
                />
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-[11px] block truncate text-white">{role.label}</span>
                  <span className="text-[9.5px] text-zinc-500 block truncate">{colorVal}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Color Value Inspector & Hex Field */}
      <div className="p-4 rounded-sm bg-zinc-900/60 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="w-5 h-5 rounded-full border border-zinc-600 shadow-md"
              style={{ backgroundColor: activeColor }}
            />
            <div>
              <span className="font-bold text-white text-xs">{currentRole.label}</span>
              <span className="text-[10px] text-zinc-500 block font-sans">{currentRole.desc}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={hexInput}
              maxLength={7}
              onChange={handleHexChange}
              className="w-24 px-2.5 py-1 rounded bg-zinc-950 border border-zinc-700 focus:border-cyan-500 text-white font-mono text-xs uppercase font-bold outline-none text-center"
            />
          </div>
        </div>

        {/* Curated Swatches */}
        <div className="space-y-2 pt-2 border-t border-zinc-850">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Curated Bunker Palettes</span>
          <div className="flex items-center gap-2 flex-wrap">
            {CURATED_COLOR_PALETTES.vibrant.map((c) => {
              const isSelected = activeColor.toUpperCase() === c.hex.toUpperCase();
              return (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => handleSelectColor(c.hex)}
                  className={`w-6 h-6 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                    isSelected
                      ? 'scale-125 border-white ring-2 ring-white/40 shadow-lg'
                      : 'border-zinc-800 opacity-85 hover:opacity-100 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white shadow" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Session Colors */}
        {recentColors.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-zinc-850">
            <span className="text-[10px] uppercase font-bold text-zinc-500">Recent Studio Swatches</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {recentColors.map((hex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectColor(hex)}
                  className="w-5 h-5 rounded-full border border-zinc-800 hover:scale-110 transition-transform cursor-pointer"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          </div>
        )}

        {/* Deterministic Color Harmonies */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-850">
          <span className="text-[10px] uppercase font-bold text-zinc-500">Harmonious Matches</span>
          <div className="grid grid-cols-3 gap-2">
            {harmonies.map((h, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectColor(h.hex)}
                className="p-1.5 rounded bg-zinc-950 border border-zinc-800 hover:border-zinc-700 flex items-center gap-2 cursor-pointer text-left"
              >
                <span className="w-3.5 h-3.5 rounded-full border border-zinc-700 shrink-0" style={{ backgroundColor: h.hex }} />
                <div className="min-w-0">
                  <span className="text-[9.5px] text-zinc-400 block truncate">{h.name}</span>
                  <span className="text-[9px] text-zinc-500 font-mono block">{h.hex}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Full Color Studio Modal Trigger */}
        <div className="pt-3 border-t border-zinc-850">
          <ColorPicker
            value={activeColor}
            onChange={(hex) => handleSelectColor(hex)}
            label={`Open Color Studio for ${currentRole.label}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ColorControls;
