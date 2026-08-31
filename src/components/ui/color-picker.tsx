import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PaintBucketIcon,
  SparklesIcon,
  Tick01Icon,
  Copy01Icon,
  ColorPickerIcon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';

export interface ColorPreset {
  name: string;
  hex: string;
  category?: 'vibrant' | 'metallic' | 'nocturne' | 'pastel';
}

export const CURATED_COLOR_PALETTES: Record<string, ColorPreset[]> = {
  vibrant: [
    { name: 'Rose Crimson', hex: '#E11D48' },
    { name: 'Electric Pink', hex: '#F43F5E' },
    { name: 'Solar Orange', hex: '#EA580C' },
    { name: 'Luminous Amber', hex: '#F59E0B' },
    { name: 'Matrix Emerald', hex: '#10B981' },
    { name: 'Cyber Cyan', hex: '#06B6D4' },
    { name: 'Electric Blue', hex: '#2563EB' },
    { name: 'Stark Indigo', hex: '#6366F1' },
    { name: 'Aether Violet', hex: '#8B5CF6' },
    { name: 'Neon Fuchsia', hex: '#D946EF' },
  ],
  metallic: [
    { name: 'Titanium Slate', hex: '#64748B' },
    { name: 'Brushed Chrome', hex: '#94A3B8' },
    { name: 'Cold Platinum', hex: '#71717A' },
    { name: 'Gold Alloy', hex: '#EAB308' },
    { name: 'Bronze Core', hex: '#C2410C' },
    { name: 'Graphite Iron', hex: '#52525B' },
    { name: 'Obsidian Dark', hex: '#27272A' },
    { name: 'Pure Onyx', hex: '#09090B' },
  ],
  nocturne: [
    { name: 'Deep Blood', hex: '#991B1B' },
    { name: 'Nocturne Ocean', hex: '#0C4A6E' },
    { name: 'Boreal Forest', hex: '#064E3B' },
    { name: 'Abyssal Navy', hex: '#1E1B4B' },
    { name: 'Imperial Plum', hex: '#581C87' },
    { name: 'Earthy Rust', hex: '#7C2D12' },
    { name: 'Gunmetal', hex: '#3F3F46' },
    { name: 'Midnight Coal', hex: '#18181B' },
  ],
  pastel: [
    { name: 'Soft Mint', hex: '#6EE7B7' },
    { name: 'Ice Blue', hex: '#7DD3FC' },
    { name: 'Lavender Glow', hex: '#C4B5FD' },
    { name: 'Blush Coral', hex: '#FDA4AF' },
    { name: 'Champagne Gold', hex: '#FDE68A' },
    { name: 'Aqua Mist', hex: '#A7F3D0' },
    { name: 'Stark Silver', hex: '#E2E8F0' },
  ],
};

// Helper: Normalize hex string
export function normalizeHex(hex: string): string {
  let clean = hex.trim().toUpperCase();
  if (!clean.startsWith('#')) {
    clean = '#' + clean;
  }
  return clean;
}

// Helper: Validate 6-digit or 3-digit hex
export function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex.trim());
}

// Helper: Calculate contrast score against dark background (#09090B)
export function getLuminance(hex: string): number {
  if (!isValidHex(hex)) return 0.5;
  const c = hex.replace('#', '');
  const full = c.length === 3 ? c.split('').map((x) => x + x).join('') : c;
  const r = parseInt(full.substring(0, 2), 16) / 255;
  const g = parseInt(full.substring(2, 4), 16) / 255;
  const b = parseInt(full.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Convert Hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  if (!isValidHex(hex)) return { h: 0, s: 100, l: 50 };
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Convert HSL to Hex
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number, k = (n + h / 30) % 12) =>
    l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  const r = Math.round(f(0) * 255)
    .toString(16)
    .padStart(2, '0');
  const g = Math.round(f(8) * 255)
    .toString(16)
    .padStart(2, '0');
  const b = Math.round(f(4) * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${r}${g}${b}`.toUpperCase();
}

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
  className?: string;
  showCustomDialog?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label = 'Project Accent Color',
  className = '',
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customHexInput, setCustomHexInput] = useState(value || '#E11D48');
  const [activeCategory, setActiveCategory] = useState<'vibrant' | 'metallic' | 'nocturne' | 'pastel'>('vibrant');
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Sync internal custom input when outer value changes
  useEffect(() => {
    if (value) {
      setCustomHexInput(value);
      // Load recent colors from localStorage
      try {
        const stored = localStorage.getItem('bunker_recent_colors');
        if (stored) {
          setRecentColors(JSON.parse(stored));
        }
      } catch { }
    }
  }, [value]);

  const saveRecentColor = (hex: string) => {
    try {
      const clean = normalizeHex(hex);
      const updated = [clean, ...recentColors.filter((c) => c !== clean)].slice(0, 8);
      setRecentColors(updated);
      localStorage.setItem('bunker_recent_colors', JSON.stringify(updated));
    } catch { }
  };

  const handleSelectColor = (hex: string) => {
    const clean = normalizeHex(hex);
    onChange(clean);
    setCustomHexInput(clean);
    saveRecentColor(clean);
  };

  const handleCopyHex = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  };

  // Eyedropper API
  const handleOpenEyedropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          handleSelectColor(result.sRGBHex);
        }
      } catch (err) {
        console.warn('Eyedropper canceled or unsupported:', err);
      }
    }
  };

  const hsl = useMemo(() => hexToHsl(customHexInput), [customHexInput]);
  const isEyeDropperAvailable = typeof window !== 'undefined' && 'EyeDropper' in window;
  const luminance = getLuminance(value);
  const isDarkAccent = luminance < 0.2;

  // Harmonious Colors
  const harmonies = useMemo(() => {
    return {
      complementary: hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
      analogous1: hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
      analogous2: hslToHex((hsl.h + 330) % 360, hsl.s, hsl.l),
      triadic: hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
    };
  }, [hsl]);

  return (
    <div className={`space-y-2 font-mono text-xs select-none ${className}`}>
      {/* Header Label + Active Hex Badge */}
      <div className="flex items-center justify-between">
        <label className="font-bold text-zinc-200 flex items-center gap-1.5">
          <HugeiconsIcon icon={PaintBucketIcon} size={14} className="text-zinc-400" />
          <span>{label}</span>
        </label>

        <div className="flex items-center gap-1.5">
          <div
            onClick={handleCopyHex}
            className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-mono text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
            title="Click to copy hex"
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-sm"
              style={{ backgroundColor: value }}
            />
            <span className="font-bold">{value}</span>
            <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} size={11} className={copied ? 'text-emerald-400' : 'text-zinc-500'} />
          </div>
        </div>
      </div>

      {/* Primary Row: Top 10 Curated Swatches + Customizer Button */}
      <div className="flex items-center gap-2 flex-wrap p-2 rounded-sm bg-zinc-950/60 border border-zinc-850">
        {CURATED_COLOR_PALETTES.vibrant.map((c) => {
          const isSelected = value.toUpperCase() === c.hex.toUpperCase();
          return (
            <button
              key={c.hex}
              type="button"
              onClick={() => handleSelectColor(c.hex)}
              className={`w-6 h-6 rounded-full transition-all cursor-pointer border relative flex items-center justify-center ${isSelected
                ? 'scale-125 border-white ring-2 ring-white/40 shadow-lg z-10'
                : 'border-zinc-800/80 opacity-85 hover:opacity-100 hover:scale-110'
                }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            >
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white shadow" />}
            </button>
          );
        })}

        {/* Separator */}
        <div className="h-4 w-[1px] bg-zinc-800 mx-0.5" />

        {/* Custom Color Palette Dialog Trigger */}
        <button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="px-2.5 py-1 rounded-sm bg-zinc-900 border border-zinc-800 hover:border-cyan-500/70 hover:bg-zinc-850 text-cyan-300 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <HugeiconsIcon icon={SparklesIcon} size={12} className="text-cyan-400" />
          <span>More Colors...</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PROFESSIONAL COLOR CUSTOMIZER MODAL DIALOG                                */}
      {/* ========================================================================= */}
      {isDialogOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-mono text-xs select-none">
          <div
            className="fixed inset-0 bg-black/70 pointer-events-auto"
            onClick={() => setIsDialogOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-5 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-sm bg-cyan-950/80 border border-cyan-800 text-cyan-400">
                  <HugeiconsIcon icon={PaintBucketIcon} size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Color Studio & Accent Customizer</h3>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    Pick from curated PBR palettes, adjust spectrum values, or sample custom brand tones.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="p-1.5 rounded-sm text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </button>
            </div>

            {/* Live Interactive Preview Showcase */}
            <div className="p-4 rounded-sm bg-zinc-900/90 border border-zinc-800 relative overflow-hidden space-y-3">
              {/* Subtle ambient back-glow */}
              <div
                className="absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-300"
                style={{ backgroundColor: customHexInput }}
              />

              <div className="flex items-center justify-between relative z-10">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  Live Component Appearance
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300">
                  {isDarkAccent ? 'Deep Tone' : 'Vibrant Tone'}
                </span>
              </div>

              {/* Sample Mockups */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                {/* Mockup 1: Project Card with Accent */}
                <div
                  className="p-3 rounded-sm bg-zinc-950 border transition-all space-y-1.5 shadow-md"
                  style={{ borderColor: `${customHexInput}55` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-xs truncate">Alpha Workspace</span>
                    <span
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: customHexInput }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400 font-sans">
                    Client deliverables and cryptographic portal.
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className="text-zinc-500">Progress</span>
                    <span style={{ color: customHexInput }} className="font-bold">
                      78%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: '78%', backgroundColor: customHexInput }}
                    />
                  </div>
                </div>

                {/* Mockup 2: Action Button & Badge */}
                <div className="p-3 rounded-sm bg-zinc-950 border border-zinc-850 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] uppercase font-bold border"
                      style={{
                        backgroundColor: `${customHexInput}20`,
                        borderColor: `${customHexInput}80`,
                        color: customHexInput,
                      }}
                    >
                      Active Stage
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">Bunker Vault</span>
                  </div>

                  <button
                    type="button"
                    className="w-full py-1.5 px-3 rounded text-xs font-bold transition-all shadow text-black"
                    style={{ backgroundColor: customHexInput }}
                  >
                    Launch Portal
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Input & Sliders Bar */}
            <div className="p-3.5 rounded-sm bg-zinc-900/60 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between gap-3">
                {/* Visual Color Input */}
                <div className="flex items-center gap-2.5 flex-1">
                  <div className="relative">
                    <input
                      type="color"
                      value={isValidHex(customHexInput) ? customHexInput : '#E11D48'}
                      onChange={(e) => handleSelectColor(e.target.value)}
                      className="w-10 h-10 rounded-sm border border-zinc-700 bg-transparent cursor-pointer"
                    />
                  </div>

                  {/* Text Hex input */}
                  <div className="flex-1 space-y-0.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Hex Color</label>
                    <input
                      type="text"
                      value={customHexInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomHexInput(val);
                        if (isValidHex(val)) {
                          onChange(normalizeHex(val));
                          saveRecentColor(val);
                        }
                      }}
                      placeholder="#E11D48"
                      className="w-full px-2.5 py-1.5 rounded-sm bg-zinc-950 border border-zinc-800 text-white font-mono text-xs uppercase outline-none focus:border-cyan-400 font-bold"
                    />
                  </div>
                </div>

                {/* Eyedropper API button */}
                {isEyeDropperAvailable && (
                  <button
                    type="button"
                    onClick={handleOpenEyedropper}
                    className="px-3 py-2 rounded-sm bg-zinc-950 border border-zinc-800 hover:border-cyan-500 hover:bg-zinc-900 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer mt-3.5 shadow-sm"
                    title="Sample color from screen"
                  >
                    <HugeiconsIcon icon={ColorPickerIcon} size={14} className="text-cyan-400" />
                    <span>Eyedropper</span>
                  </button>
                )}
              </div>

              {/* HSL Hue Spectrum Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>Hue Spectrum ({hsl.h}°)</span>
                  <span>Saturation ({hsl.s}%)</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={hsl.h}
                  onChange={(e) => {
                    const newH = Number(e.target.value);
                    const newHex = hslToHex(newH, hsl.s || 80, hsl.l || 50);
                    handleSelectColor(newHex);
                  }}
                  className="w-full h-3 rounded-sm appearance-none cursor-pointer"
                  style={{
                    background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                  }}
                />
              </div>
            </div>

            {/* Categorized Designer Palette Tabs */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-1.5 text-xs">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  Designer Palettes
                </span>

                <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-sm border border-zinc-800 text-[10.5px]">
                  {(['vibrant', 'metallic', 'nocturne', 'pastel'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-2.5 py-0.5 rounded capitalize font-bold transition-all cursor-pointer ${activeCategory === cat
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Swatch Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {CURATED_COLOR_PALETTES[activeCategory].map((c) => {
                  const isSelected = customHexInput.toUpperCase() === c.hex.toUpperCase();
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => handleSelectColor(c.hex)}
                      className={`p-2 rounded-sm border text-left transition-all cursor-pointer flex flex-col items-center gap-1.5 ${isSelected
                        ? 'bg-zinc-850 border-white text-white ring-1 ring-white/40 shadow-md'
                        : 'bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700 text-zinc-400'
                        }`}
                    >
                      <div
                        className="w-full h-5 rounded-sm border border-zinc-700/60 shadow-inner flex items-center justify-center"
                        style={{ backgroundColor: c.hex }}
                      >
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white shadow" />}
                      </div>
                      <span className="text-[9.5px] font-bold truncate w-full text-center text-zinc-300">
                        {c.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Harmonious Color Suggestions */}
            <div className="p-3 rounded-sm bg-zinc-900/40 border border-zinc-850 space-y-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                <HugeiconsIcon icon={SparklesIcon} size={12} className="text-amber-400" />
                <span>Harmonious Accent Matches</span>
              </span>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(harmonies).map(([name, hex]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleSelectColor(hex)}
                    className="p-1.5 rounded-sm bg-zinc-950 border border-zinc-800 hover:border-zinc-700 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-zinc-700 shrink-0"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="text-[9px] uppercase font-bold text-zinc-300 truncate">
                      {name.replace(/([A-Z0-9])/g, ' $1')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Colors List */}
            {recentColors.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Recently Used
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {recentColors.map((hex) => (
                    <button
                      key={hex}
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

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-850">
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <span
                  className="w-3 h-3 rounded-full border border-zinc-700"
                  style={{ backgroundColor: customHexInput }}
                />
                <span className="font-mono font-bold text-white uppercase">{customHexInput}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow"
                >
                  Apply Color
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
