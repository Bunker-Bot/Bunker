/**
 * Hardware and Environment Capability Detection for 3D WebGL Rendering
 */

export interface SystemCapabilities {
  hasWebGL: boolean;
  prefersReducedMotion: boolean;
  isLowPowerDevice: boolean;
  optimalDpr: number;
}

let cachedCapabilities: SystemCapabilities | null = null;

export function checkSystemCapabilities(): SystemCapabilities {
  if (typeof window === 'undefined') {
    return {
      hasWebGL: false,
      prefersReducedMotion: false,
      isLowPowerDevice: false,
      optimalDpr: 1,
    };
  }

  if (cachedCapabilities) return cachedCapabilities;

  // 1. WebGL Detection
  let hasWebGL = false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    hasWebGL = Boolean(gl);
  } catch (_e) {
    hasWebGL = false;
  }

  // 2. Reduced Motion Query
  const prefersReducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

  // 3. Low Power / Mobile Detection
  const isMobile =
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.innerWidth < 768);
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const isLowPowerDevice = isMobile || hardwareConcurrency <= 2;

  // 4. Optimal Device Pixel Ratio
  const rawDpr = window.devicePixelRatio || 1;
  const optimalDpr = isLowPowerDevice ? Math.min(1.25, rawDpr) : Math.min(1.5, rawDpr);

  cachedCapabilities = {
    hasWebGL,
    prefersReducedMotion,
    isLowPowerDevice,
    optimalDpr,
  };

  return cachedCapabilities;
}
