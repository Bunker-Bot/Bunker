import React, { useState, useEffect } from 'react';

/**
 * AmbientBackground Component
 * Bunker Architectural Deep Dark Monochrome Background with High-Visibility Hexagon Grid.
 */
export const AmbientBackground: React.FC = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const check = () => {
      const hasLight = document.documentElement.classList.contains('light');
      setIsDark(!hasLight);
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0 select-none bg-[#050505]">
      {/* Layer 1: Full-viewport multi-point subtle radial lighting */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: isDark ? `
            radial-gradient(ellipse 120% 80% at 50% -10%, rgba(255, 255, 255, 0.10) 0%, transparent 70%),
            radial-gradient(ellipse 90% 70% at 5% 50%, rgba(228, 228, 231, 0.06) 0%, transparent 65%),
            radial-gradient(ellipse 90% 70% at 95% 50%, rgba(212, 212, 216, 0.06) 0%, transparent 65%),
            radial-gradient(ellipse 120% 80% at 50% 110%, rgba(255, 255, 255, 0.08) 0%, transparent 70%)
          ` : `
            radial-gradient(ellipse 120% 80% at 50% -10%, rgba(0, 0, 0, 0.08) 0%, transparent 70%),
            radial-gradient(ellipse 90% 70% at 5% 50%, rgba(0, 0, 0, 0.04) 0%, transparent 65%),
            radial-gradient(ellipse 90% 70% at 95% 50%, rgba(0, 0, 0, 0.04) 0%, transparent 65%),
            radial-gradient(ellipse 120% 80% at 50% 110%, rgba(0, 0, 0, 0.06) 0%, transparent 70%)
          `
        }}
      />

      {/* Layer 2: Central glowing core behind main card */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] sm:w-[1000px] h-[850px] sm:h-[1000px] rounded-full blur-[140px] pointer-events-none"
        style={{
          background: isDark 
            ? 'radial-gradient(circle, rgba(255, 255, 255, 0.10) 0%, rgba(161, 161, 170, 0.04) 45%, transparent 75%)'
            : 'radial-gradient(circle, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0.02) 45%, transparent 75%)'
        }}
      />

      {/* Layer 3: High-visibility architectural hex grid lines (Crisp & Distinct Pattern) */}
      <svg className={`absolute inset-0 w-full h-full ${isDark ? 'opacity-[0.18]' : 'opacity-[0.08]'}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="scan-hex-grid-glow" width="60" height="52" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
            <path d="M30 0 L60 15 L60 37 L30 52 L0 37 L0 15 Z" fill="none" stroke={isDark ? '#e4e4e7' : '#18181b'} strokeWidth="0.85" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#scan-hex-grid-glow)" />
      </svg>

      {/* Layer 4: Full-width fine dot matrix texture overlay */}
      <svg className={`absolute inset-0 w-full h-full ${isDark ? 'opacity-[0.08]' : 'opacity-[0.04]'}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="scan-dot-texture-glow" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1.1" fill={isDark ? '#ffffff' : '#27272a'} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#scan-dot-texture-glow)" />
      </svg>

      {/* Layer 5: Soft full-screen edge vignette */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: isDark
            ? `radial-gradient(circle at 50% 50%, transparent 30%, rgba(5, 5, 5, 0.55) 100%)`
            : `radial-gradient(circle at 50% 50%, transparent 35%, rgba(250, 250, 250, 0.40) 100%)`
        }}
      />
    </div>
  );
};

export default AmbientBackground;
