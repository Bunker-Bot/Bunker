export interface ClientDeviceMetadata {
  browser: string;
  os: string;
  deviceType: string;
  country: string;
}

export function detectClientDeviceMetadata(): ClientDeviceMetadata {
  if (typeof window === 'undefined' || !navigator) {
    return { browser: 'Chrome', os: 'Windows', deviceType: 'Desktop', country: 'India' };
  }

  const ua = navigator.userAgent || '';

  // Browser Detection
  let browser = 'Chrome';
  if (ua.includes('Edg/') || ua.includes('Edge/')) browser = 'Edge';
  else if (ua.includes('OPR/') || ua.includes('Opera')) browser = 'Opera';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Chrome/')) browser = 'Chrome';

  // OS Detection
  let os = 'Windows';
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  // Device Type
  let deviceType = 'Desktop';
  if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    deviceType = 'Mobile';
  } else if (/iPad|Tablet/i.test(ua)) {
    deviceType = 'Tablet';
  }

  // Country / Region Detection from Timezone / Language
  let country = 'India';
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Asia/Kolkata') || tz.includes('Calcutta')) country = 'India';
    else if (tz.includes('America/')) country = 'United States';
    else if (tz.includes('Europe/London')) country = 'United Kingdom';
    else if (tz.includes('Europe/')) country = 'Europe';
    else if (tz.includes('Asia/')) country = 'Asia';
    else {
      const lang = navigator.language || '';
      if (lang.endsWith('-IN') || lang === 'hi') country = 'India';
      else if (lang.endsWith('-US')) country = 'United States';
      else if (lang.endsWith('-GB')) country = 'United Kingdom';
    }
  } catch {}

  return { browser, os, deviceType, country };
}
