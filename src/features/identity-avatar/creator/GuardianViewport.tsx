import React, { useState, useRef, useEffect } from 'react';
import { useGuardianEditorStore } from './state/useGuardianEditorStore';
import { AvatarPoster } from '../components/AvatarPoster';
import { GuardianIdentityCard } from '../components/GuardianIdentityCard';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SparklesIcon,
  RotateLeftIcon,
  PlusSignIcon,
  MinusSignIcon,
} from '@hugeicons/core-free-icons';

export const GuardianViewport: React.FC = () => {
  const {
    draftConfig,
    savedConfig,
    name,
    avatarCode,
    projectName,
    clientName,
    publicBrief,
    previewContext,
    setPreviewContext,
    compareMode,
    isFullscreen,
    setIsFullscreen,
    candidateVariants,
    applyVariant,
    cameraPreset,
    setCameraPreset,
    zoomLevel,
    setZoomLevel,
  } = useGuardianEditorStore();

  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    lookAtX: 0,
    lookAtY: 0,
    glowX: 50,
    glowY: 50,
  });
  const [isHovered, setIsHovered] = useState(false);

  // Keyboard shortcut listener for Esc (exit fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, setIsFullscreen]);

  // Mouse / Pointer Gaze Tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const normX = (x - 0.5) * 2;
    const normY = (y - 0.5) * 2;

    // Apply camera preset offsets
    const baseRotY = cameraPreset === 'front' ? 0 : cameraPreset === 'side' ? 24 : normX * 16;
    const baseRotX = -normY * 14;

    setTilt({
      rotateX: baseRotX,
      rotateY: baseRotY,
      lookAtX: normX,
      lookAtY: normY,
      glowX: Math.round(x * 100),
      glowY: Math.round(y * 100),
    });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    const baseRotY = cameraPreset === 'front' ? 0 : cameraPreset === 'side' ? 24 : 0;
    setTilt({
      rotateX: 0,
      rotateY: baseRotY,
      lookAtX: 0,
      lookAtY: 0,
      glowX: 50,
      glowY: 50,
    });
  };

  return (
    <div
      className={`w-full h-full flex flex-col bg-zinc-950/90 relative overflow-hidden font-mono select-none min-w-0 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-black/95 p-4 sm:p-6' : ''
      }`}
    >
      {/* Viewport Top Mode Bar - Responsive No-Wrap */}
      <div className="flex items-center justify-between px-2.5 sm:px-4 py-1.5 sm:py-2 border-b border-zinc-850 bg-zinc-900/40 text-xs shrink-0 z-20 gap-2 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
          <span className="text-[9.5px] sm:text-[10px] font-bold uppercase text-zinc-400 tracking-wider shrink-0 hidden xs:inline">
            Live Viewport
          </span>
          <span className="text-zinc-700 shrink-0 hidden xs:inline">|</span>
          <span className="text-[10.5px] sm:text-[11px] text-zinc-300 font-bold truncate">
            {cameraPreset.toUpperCase()} ({Math.round(zoomLevel * 100)}%)
          </span>
        </div>

        {/* Context Preview Switcher */}
        <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-sm border border-zinc-800 shrink-0">
          {[
            { id: 'studio', label: 'Studio' },
            { id: 'project', label: 'Project' },
            { id: 'portal', label: 'Portal' },
            { id: 'share-card', label: 'Share Card' },
          ].map((ctx) => (
            <button
              key={ctx.id}
              type="button"
              onClick={() => setPreviewContext(ctx.id as any)}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                previewContext === ctx.id
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {ctx.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Viewport Stage Area */}
      <div
        ref={stageRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden perspective-[1000px] cursor-crosshair min-h-0"
      >
        {/* Top-Left Live Identity Status Badge */}
        <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-20 flex items-center gap-1.5 sm:gap-2 bg-zinc-950/85 backdrop-blur-md border border-zinc-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-sm shadow-xl pointer-events-none max-w-[calc(100%-1.5rem)]">
          <span
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shadow-sm animate-pulse shrink-0"
            style={{ backgroundColor: draftConfig.accentColor }}
          />
          <span className="font-bold text-white text-[11px] sm:text-xs truncate max-w-[120px] xs:max-w-[150px] sm:max-w-[200px]">
            {name}
          </span>
          <span className="text-[9.5px] sm:text-[10.5px] text-cyan-400 font-mono shrink-0">
            #{avatarCode !== 'auto' ? avatarCode : '0000000000'}
          </span>
          <span className="text-[9px] text-zinc-500 capitalize shrink-0 hidden sm:inline">
            • {draftConfig.archetype}
          </span>
        </div>

        {/* 1. Context View: Share Card (1200x630 OG Preview) */}
        {previewContext === 'share-card' ? (
          <div className="w-full max-w-lg p-2 max-h-[85%] flex items-center justify-center">
            <GuardianIdentityCard
              variant="share-preview"
              config={draftConfig}
              avatarCode={avatarCode !== 'auto' ? avatarCode : '4839201746'}
              name={name}
              projectName={projectName || 'Alpha Workspace'}
              clientName={clientName || 'Mock AI Studio'}
            />
          </div>
        ) : previewContext === 'portal' ? (
          // 2. Context View: Client Portal with Live Hover Popover
          <div className="w-full max-w-md p-3.5 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 shadow-2xl space-y-3 sm:space-y-4 max-h-[85%] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <span className="text-[9.5px] sm:text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                Client Portal Header Preview
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] sm:text-[9.5px] bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-bold">
                Live Secure
              </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-sm bg-zinc-950 border border-zinc-800 p-1 relative group cursor-pointer shrink-0">
                <AvatarPoster config={draftConfig} size="100%" showBackdrop={true} />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">
                  {projectName || name}
                </h4>
                <p className="text-[10.5px] sm:text-[11px] text-zinc-400 truncate">
                  Client: {clientName || 'Unassigned'}
                </p>
                <p className="text-[9.5px] sm:text-[10.5px] text-zinc-500 font-sans line-clamp-2">
                  {publicBrief || 'The project Guardian represents this workspace across cryptographic client deliverables.'}
                </p>
              </div>
            </div>
          </div>
        ) : previewContext === 'project' ? (
          // 3. Context View: Project Header Preview
          <div className="w-full max-w-lg p-3.5 sm:p-5 rounded-sm bg-zinc-900/80 border border-zinc-800 shadow-xl flex items-center justify-between gap-3 sm:gap-4 max-h-[85%] overflow-hidden">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0">
                <AvatarPoster config={draftConfig} size="100%" showBackdrop={true} />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-xs sm:text-sm truncate">{projectName || name}</span>
                  <span className="px-1.5 sm:px-2 py-0.2 rounded text-[8.5px] sm:text-[9px] font-bold bg-zinc-800 text-zinc-300 shrink-0">
                    IN PROGRESS
                  </span>
                </div>
                <p className="text-[10.5px] sm:text-[11px] text-zinc-400 font-sans truncate">
                  Identity: <span className="text-white font-mono">{name}</span> (#{avatarCode !== 'auto' ? avatarCode : '4839201746'})
                </p>
              </div>
            </div>
          </div>
        ) : (
          // 4. Default Studio Live 3D Interactive Stage
          <div className="w-full h-full flex items-center justify-center relative select-none">
            {/* Spatial Radial Background Glow */}
            <div
              className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-300 ease-out"
              style={{
                backgroundColor: draftConfig.glowColor,
                left: `${tilt.glowX}%`,
                top: `${tilt.glowY}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />

            {/* Ambient Tech Orbital HUD Rings with micro-shift */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-200 ease-out"
              style={{
                transform: `translate(${-tilt.lookAtX * 8}px, ${-tilt.lookAtY * 6}px)`,
              }}
            >
              <div
                className="w-56 h-56 sm:w-72 sm:h-72 rounded-full border border-dashed opacity-25 animate-[spin_60s_linear_infinite]"
                style={{ borderColor: draftConfig.accentColor }}
              />
              <div
                className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-dotted opacity-20 animate-[spin_90s_linear_infinite_reverse]"
                style={{ borderColor: draftConfig.glowColor }}
              />
            </div>

            {/* Before / After Comparison Mode */}
            {compareMode ? (
              <div className="flex items-center gap-3 sm:gap-8 relative z-10 flex-wrap justify-center max-h-[85%]">
                <div className="flex flex-col items-center space-y-1.5">
                  <span className="text-[9.5px] font-bold text-zinc-500 uppercase tracking-wider">
                    [ Saved ]
                  </span>
                  <div className="w-32 h-36 xs:w-40 xs:h-48 sm:w-56 sm:h-64 rounded bg-zinc-950/80 border border-zinc-800 p-1.5">
                    <AvatarPoster config={savedConfig} size="100%" showBackdrop={true} />
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-1.5">
                  <span className="text-[9.5px] font-bold text-cyan-400 uppercase tracking-wider">
                    [ Current Draft ]
                  </span>
                  <div className="w-32 h-36 xs:w-40 xs:h-48 sm:w-56 sm:h-64 rounded bg-zinc-950/80 border border-cyan-500/80 ring-1 ring-cyan-500/50 p-1.5 shadow-2xl">
                    <AvatarPoster
                      config={draftConfig}
                      size="100%"
                      showBackdrop={true}
                      lookAtOffset={{ x: tilt.lookAtX, y: tilt.lookAtY }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              // 3D Depth Interactive Guardian Model Container (Autoscaled for mobile & desktop)
              <div
                className="w-44 h-52 xs:w-52 xs:h-60 sm:w-68 sm:h-76 md:w-80 md:h-92 max-h-[86%] aspect-square relative z-10 transition-transform duration-100 ease-out flex items-center justify-center"
                style={{
                  transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${
                    (isHovered ? 1.03 : 1) * zoomLevel
                  })`,
                  filter: isHovered
                    ? `drop-shadow(0 15px 30px ${draftConfig.glowColor}35)`
                    : 'drop-shadow(0 10px 20px rgba(0,0,0,0.6))',
                }}
              >
                <AvatarPoster
                  config={draftConfig}
                  size="100%"
                  showBackdrop={true}
                  lookAtOffset={{ x: tilt.lookAtX, y: tilt.lookAtY }}
                  className="w-full h-full"
                />
              </div>
            )}
          </div>
        )}

        {/* Viewport Bottom Controls Toolbar (Camera Angles & Zoom) */}
        <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 p-0.5 sm:p-1 rounded-sm shadow-2xl max-w-[calc(100%-1.5rem)] overflow-x-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => setCameraPreset('front')}
            className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[9.5px] sm:text-[10.5px] font-bold transition-all cursor-pointer whitespace-nowrap ${
              cameraPreset === 'front' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset('three-quarter')}
            className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[9.5px] sm:text-[10.5px] font-bold transition-all cursor-pointer whitespace-nowrap ${
              cameraPreset === 'three-quarter' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            3/4 View
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset('side')}
            className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[9.5px] sm:text-[10.5px] font-bold transition-all cursor-pointer whitespace-nowrap ${
              cameraPreset === 'side' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Side
          </button>

          <div className="h-3.5 sm:h-4 w-[1px] bg-zinc-800 mx-0.5 shrink-0" />

          <button
            type="button"
            onClick={() => setZoomLevel(Math.min(1.4, zoomLevel + 0.1))}
            className="p-1 sm:p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer shrink-0"
            title="Zoom In"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={12} />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(Math.max(0.7, zoomLevel - 0.1))}
            className="p-1 sm:p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer shrink-0"
            title="Zoom Out"
          >
            <HugeiconsIcon icon={MinusSignIcon} size={12} />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoomLevel(1.0);
              setCameraPreset('three-quarter');
            }}
            className="p-1 sm:p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer shrink-0"
            title="Reset Camera"
          >
            <HugeiconsIcon icon={RotateLeftIcon} size={12} />
          </button>
        </div>
      </div>

      {/* Candidate Variant Strip (Bottom) */}
      {candidateVariants.length > 0 && previewContext === 'studio' && (
        <div className="p-2 sm:p-2.5 border-t border-zinc-850 bg-zinc-900/50 flex items-center justify-between gap-2 sm:gap-3 shrink-0 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[9.5px] uppercase font-bold text-zinc-400 flex items-center gap-1 whitespace-nowrap">
              <HugeiconsIcon icon={SparklesIcon} size={11} className="text-cyan-400" />
              <span className="hidden xs:inline">Variants:</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {candidateVariants.map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyVariant(v)}
                className="flex items-center gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-zinc-950 border border-zinc-800 hover:border-cyan-500/80 hover:bg-zinc-900 transition-all cursor-pointer shrink-0 shadow-sm group whitespace-nowrap"
                title="Click to apply variant"
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                  <AvatarPoster config={v} size="100%" />
                </div>
                <span className="text-[9.5px] sm:text-[10px] font-bold text-zinc-300 group-hover:text-cyan-300">
                  V{i + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuardianViewport;
