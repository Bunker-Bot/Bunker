import React, { useState, useRef } from 'react';
import { AvatarPoster } from '../components/AvatarPoster';
import { GuardianIdentityCard } from '../components/GuardianIdentityCard';
import type { BunkerAvatarConfig, AvatarPreviewContext, GuardianAvatarDTO } from '../types/avatar.types';

interface AvatarPreviewStageProps {
  avatar: GuardianAvatarDTO;
  config: BunkerAvatarConfig;
  previewContext: AvatarPreviewContext;
  onSelectContext: (ctx: AvatarPreviewContext) => void;
  className?: string;
}

export const AvatarPreviewStage: React.FC<AvatarPreviewStageProps> = ({
  avatar,
  config,
  previewContext,
  onSelectContext,
  className = '',
}) => {
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    // Normalized gaze direction (-1 to +1)
    const normX = (x - 0.5) * 2;
    const normY = (y - 0.5) * 2;

    // 3D Perspective Tilt (-16 to +16 degrees)
    const rotateY = normX * 16;
    const rotateX = -normY * 14;

    setTilt({
      rotateX,
      rotateY,
      lookAtX: normX,
      lookAtY: normY,
      glowX: Math.round(x * 100),
      glowY: Math.round(y * 100),
    });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({
      rotateX: 0,
      rotateY: 0,
      lookAtX: 0,
      lookAtY: 0,
      glowX: 50,
      glowY: 50,
    });
  };

  return (
    <div className={`flex flex-col rounded-sm bg-zinc-950/90 border border-zinc-800/90 shadow-2xl overflow-hidden font-mono select-none ${className}`}>
      {/* Context Mode Selector Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-850 bg-zinc-900/60 text-xs">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          Viewport Stage
        </span>

        <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-sm border border-zinc-800">
          <button
            type="button"
            onClick={() => onSelectContext('studio')}
            className={`px-2.5 py-1 rounded text-[10.5px] font-bold transition-all cursor-pointer ${previewContext === 'studio'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 shadow-sm'
              : 'text-zinc-400 hover:text-white'
              }`}
          >
            Studio
          </button>
          <button
            type="button"
            onClick={() => onSelectContext('dark-portal')}
            className={`px-2.5 py-1 rounded text-[10.5px] font-bold transition-all cursor-pointer ${previewContext === 'dark-portal'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
              }`}
          >
            Portal Hero
          </button>
          <button
            type="button"
            onClick={() => onSelectContext('share-card')}
            className={`px-2.5 py-1 rounded text-[10.5px] font-bold transition-all cursor-pointer ${previewContext === 'share-card'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
              }`}
          >
            Social OG (1.91:1)
          </button>
        </div>
      </div>

      {/* Main Visual Stage */}
      <div
        ref={stageRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex-1 min-h-[340px] flex items-center justify-center p-4 overflow-hidden perspective-[1000px] cursor-crosshair"
      >
        {previewContext === 'share-card' ? (
          <div className="w-full max-w-md">
            <GuardianIdentityCard
              variant="share-preview"
              config={config}
              avatarCode={avatar.avatarCode}
              name={avatar.name}
              projectName={avatar.projectName}
              clientName={avatar.clientName}
            />
          </div>
        ) : previewContext === 'dark-portal' ? (
          <div className="w-full max-w-sm p-4 rounded-sm bg-zinc-900/90 border border-zinc-800 flex items-center gap-4 shadow-xl">
            <div className="w-20 h-20 rounded-sm bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0">
              <AvatarPoster config={config} size="100%" showBackdrop={true} />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <span className="text-[9px] uppercase font-bold text-cyan-400">Portal Hero Preview</span>
              <h4 className="text-sm font-bold text-white truncate">{avatar.projectName || avatar.name}</h4>
              <p className="text-[10px] text-zinc-400 truncate">Client: {avatar.clientName || 'Unassigned'}</p>
            </div>
          </div>
        ) : (
          // Default Studio Interactive Stage (100% matching the card avatar with responsive gaze tracking)
          <div className="w-full h-full min-h-[340px] flex items-center justify-center relative select-none">
            {/* Floating Identity Name & Badge on top-left of preview stage */}
            <div className="absolute top-2 left-2 z-20 flex items-center gap-2 bg-zinc-950/85 backdrop-blur-md border border-zinc-800 px-3 py-1.5 rounded-sm shadow-xl pointer-events-none">
              <span
                className="w-2 h-2 rounded-full shadow-sm animate-pulse"
                style={{ backgroundColor: config.accentColor }}
              />
              <span className="font-bold text-white text-xs truncate max-w-[180px]">
                {avatar.name}
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                #{avatar.avatarCode}
              </span>
            </div>

            {/* Spatial Radial Background Glow following cursor */}
            <div
              className="absolute w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-300 ease-out"
              style={{
                backgroundColor: config.glowColor,
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
                className="w-64 h-64 rounded-full border border-dashed opacity-25 animate-[spin_60s_linear_infinite]"
                style={{ borderColor: config.accentColor }}
              />
              <div
                className="absolute w-80 h-80 rounded-full border border-dotted opacity-20 animate-[spin_90s_linear_infinite_reverse]"
                style={{ borderColor: config.glowColor }}
              />
            </div>

            {/* 3D Depth Interactive Guardian Model Container */}
            <div
              className="w-64 h-72 sm:w-72 sm:h-80 relative z-10 transition-transform duration-100 ease-out"
              style={{
                transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${isHovered ? 1.05 : 1})`,
                filter: isHovered
                  ? `drop-shadow(0 20px 35px ${config.glowColor}40)`
                  : 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
              }}
            >
              <AvatarPoster
                config={config}
                size="100%"
                showBackdrop={true}
                lookAtOffset={{ x: tilt.lookAtX, y: tilt.lookAtY }}
                className="w-full h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarPreviewStage;
