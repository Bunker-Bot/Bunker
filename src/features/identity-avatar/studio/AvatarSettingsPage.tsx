import React, { useState } from 'react';
import { AvatarStudioShell } from './AvatarStudioShell';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Settings02Icon,
  Tick01Icon,
  SparklesIcon,
  Layers01Icon,
  PaintBucketIcon,
} from '@hugeicons/core-free-icons';

export const AvatarSettingsPage: React.FC = () => {
  const [defaultEnv, setDefaultEnv] = useState<'bunker-dark' | 'studio' | 'light'>('bunker-dark');
  const [defaultMotion, setDefaultMotion] = useState<'breathing' | 'still' | 'scan'>('breathing');
  const [qualityPreset, setQualityPreset] = useState<'performance' | 'balanced' | 'quality'>('balanced');
  const [autoSeedProjects, setAutoSeedProjects] = useState(true);
  const [savedToast, setSavedToast] = useState(false);

  const handleSaveSettings = () => {
    localStorage.setItem(
      'bunker_avatar_settings',
      JSON.stringify({ defaultEnv, defaultMotion, qualityPreset, autoSeedProjects })
    );
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <AvatarStudioShell activeTab="settings">
      <div className="w-full max-w-5xl space-y-6 font-mono text-xs select-none">
        {/* Page Title */}
        <div className="flex items-center justify-between border-b border-zinc-850 pb-5">
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <HugeiconsIcon icon={Settings02Icon} size={20} className="text-cyan-400" />
              <span>Identity System Settings</span>
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              System-wide defaults for Guardian rendering, project initialization, and motion behaviors.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveSettings}
            className="px-4 py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            {savedToast ? (
              <>
                <HugeiconsIcon icon={Tick01Icon} size={14} className="text-emerald-600" />
                <span>Saved Settings</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Section 1: Default Environment */}
          <div className="p-5 rounded-sm bg-zinc-900/60 border border-zinc-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HugeiconsIcon icon={Layers01Icon} size={16} className="text-cyan-400" />
              <span>Default Preview Environment</span>
            </h3>
            <p className="text-xs text-zinc-400 font-sans">
              Choose the default backdrop lighting and spatial ambiance applied to new Guardian inspect sessions.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {[
                { id: 'bunker-dark', title: 'Bunker Dark', desc: 'Deep graphite studio with radial accent glow' },
                { id: 'studio', title: 'Studio Orbital', desc: 'Holographic cybernetic rings and laser highlights' },
                { id: 'light', title: 'Neutral Slate', desc: 'High contrast clean viewport for documentation' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDefaultEnv(opt.id as any)}
                  className={`p-3 rounded-sm border text-left transition-all cursor-pointer ${
                    defaultEnv === opt.id
                      ? 'bg-cyan-950/40 border-cyan-500/80 text-white ring-1 ring-cyan-500/50'
                      : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="font-bold text-xs block text-white">{opt.title}</span>
                  <span className="text-[10px] text-zinc-500 font-sans block mt-1">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Motion Preferences */}
          <div className="p-5 rounded-sm bg-zinc-900/60 border border-zinc-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HugeiconsIcon icon={SparklesIcon} size={16} className="text-cyan-400" />
              <span>Guardian Motion & Gaze Dynamics</span>
            </h3>
            <p className="text-xs text-zinc-400 font-sans">
              Controls interactive breathing cycles and multi-layer cursor eye-tracking sensitivity.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {[
                { id: 'breathing', title: 'Active Gaze & Breathing', desc: 'Multi-layer cursor tracking + 0.4Hz breathing' },
                { id: 'scan', title: 'Cybernetic Scan', desc: 'Periodic laser optic telemetry pulse' },
                { id: 'still', title: 'Restrained Static', desc: 'Zero idle motion; respects battery conservation' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDefaultMotion(opt.id as any)}
                  className={`p-3 rounded-sm border text-left transition-all cursor-pointer ${
                    defaultMotion === opt.id
                      ? 'bg-cyan-950/40 border-cyan-500/80 text-white ring-1 ring-cyan-500/50'
                      : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="font-bold text-xs block text-white">{opt.title}</span>
                  <span className="text-[10px] text-zinc-500 font-sans block mt-1">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Performance & Rendering DPR */}
          <div className="p-5 rounded-sm bg-zinc-900/60 border border-zinc-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HugeiconsIcon icon={PaintBucketIcon} size={16} className="text-cyan-400" />
              <span>Rendering Performance & DPR Scaling</span>
            </h3>
            <p className="text-xs text-zinc-400 font-sans">
              Optimizes device pixel ratio and shader anti-aliasing based on GPU capabilities.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {[
                { id: 'performance', title: 'Performance (1.0x)', desc: 'Ultra-fast rendering; low battery impact' },
                { id: 'balanced', title: 'Balanced (1.5x)', desc: 'Optimal crispness for Retina & standard displays' },
                { id: 'quality', title: 'Ultra Quality (2.0x)', desc: 'Maximum anti-aliasing for high-resolution captures' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setQualityPreset(opt.id as any)}
                  className={`p-3 rounded-sm border text-left transition-all cursor-pointer ${
                    qualityPreset === opt.id
                      ? 'bg-cyan-950/40 border-cyan-500/80 text-white ring-1 ring-cyan-500/50'
                      : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="font-bold text-xs block text-white">{opt.title}</span>
                  <span className="text-[10px] text-zinc-500 font-sans block mt-1">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Project Auto-Seeding */}
          <div className="p-5 rounded-sm bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Auto-Initialize Project Guardians</h3>
              <p className="text-xs text-zinc-400 font-sans">
                Automatically generate a unique deterministic Guardian identity when a new project is created in Bunker.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAutoSeedProjects(!autoSeedProjects)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                autoSeedProjects ? 'bg-cyan-500' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white transition-transform block absolute top-1 ${
                  autoSeedProjects ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </AvatarStudioShell>
  );
};

export default AvatarSettingsPage;
