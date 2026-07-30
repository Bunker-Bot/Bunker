/**
 * Centralized Technology Icon Resolver for Bunker
 */

const LOGO_CDN_BASE = 'https://cdn.jsdelivr.net/npm/programming-languages-logos/src';
const SIMPLE_ICONS_BASE = 'https://cdn.simpleicons.org';

const TECH_ICON_MAP: Record<string, string> = {
  // Programming Languages
  javascript: `${LOGO_CDN_BASE}/javascript/javascript.png`,
  typescript: `${LOGO_CDN_BASE}/typescript/typescript.png`,
  python: `${LOGO_CDN_BASE}/python/python.png`,
  java: `${LOGO_CDN_BASE}/java/java.png`,
  kotlin: `${LOGO_CDN_BASE}/kotlin/kotlin.png`,
  swift: `${LOGO_CDN_BASE}/swift/swift.png`,
  go: `${LOGO_CDN_BASE}/go/go.png`,
  rust: `${LOGO_CDN_BASE}/rust/rust.png`,
  php: `${LOGO_CDN_BASE}/php/php.png`,
  html: `${LOGO_CDN_BASE}/html/html.png`,
  css: `${LOGO_CDN_BASE}/css/css.png`,
  c: `${LOGO_CDN_BASE}/c/c.png`,
  cpp: `${LOGO_CDN_BASE}/cpp/cpp.png`,
  'c++': `${LOGO_CDN_BASE}/cpp/cpp.png`,
  csharp: `${LOGO_CDN_BASE}/csharp/csharp.png`,
  'c#': `${LOGO_CDN_BASE}/csharp/csharp.png`,
  ruby: `${LOGO_CDN_BASE}/ruby/ruby.png`,

  // Frameworks & Libraries (SimpleIcons)
  react: `${SIMPLE_ICONS_BASE}/react/61DAFB`,
  'react native': `${SIMPLE_ICONS_BASE}/react/61DAFB`,
  'next.js': `${SIMPLE_ICONS_BASE}/nextdotjs/ffffff`,
  nextjs: `${SIMPLE_ICONS_BASE}/nextdotjs/ffffff`,
  vue: `${SIMPLE_ICONS_BASE}/vuedotjs/4FC08D`,
  angular: `${SIMPLE_ICONS_BASE}/angular/DD0031`,
  svelte: `${SIMPLE_ICONS_BASE}/svelte/FF3E00`,
  'tail-wind-css': `${SIMPLE_ICONS_BASE}/tailwindcss/06B6D4`,
  tailwindcss: `${SIMPLE_ICONS_BASE}/tailwindcss/06B6D4`,
  bootstrap: `${SIMPLE_ICONS_BASE}/bootstrap/7952B3`,
  'node.js': `${SIMPLE_ICONS_BASE}/nodedotjs/339933`,
  nodejs: `${SIMPLE_ICONS_BASE}/nodedotjs/339933`,
  express: `${SIMPLE_ICONS_BASE}/express/ffffff`,
  nestjs: `${SIMPLE_ICONS_BASE}/nestjs/E0234E`,
  fastapi: `${SIMPLE_ICONS_BASE}/fastapi/009688`,
  django: `${SIMPLE_ICONS_BASE}/django/092E20`,
  flask: `${SIMPLE_ICONS_BASE}/flask/ffffff`,
  laravel: `${SIMPLE_ICONS_BASE}/laravel/FF2D20`,
  flutter: `${SIMPLE_ICONS_BASE}/flutter/02569B`,
  electron: `${SIMPLE_ICONS_BASE}/electron/47848F`,

  // Databases & Cloud
  postgresql: `${SIMPLE_ICONS_BASE}/postgresql/4169E1`,
  postgres: `${SIMPLE_ICONS_BASE}/postgresql/4169E1`,
  mysql: `${SIMPLE_ICONS_BASE}/mysql/4479A1`,
  mongodb: `${SIMPLE_ICONS_BASE}/mongodb/47A248`,
  redis: `${SIMPLE_ICONS_BASE}/redis/DC382D`,
  supabase: `${SIMPLE_ICONS_BASE}/supabase/3ECF8E`,
  firebase: `${SIMPLE_ICONS_BASE}/firebase/FFCA28`,
  docker: `${SIMPLE_ICONS_BASE}/docker/2496ED`,
  kubernetes: `${SIMPLE_ICONS_BASE}/kubernetes/326CE5`,
  aws: `${SIMPLE_ICONS_BASE}/amazonwebservices/232F3E`,
  vercel: `${SIMPLE_ICONS_BASE}/vercel/ffffff`,
  graphql: `${SIMPLE_ICONS_BASE}/graphql/E10098`,
  prisma: `${SIMPLE_ICONS_BASE}/prisma/2D3748`,

  // AI & DevOps
  openai: `${SIMPLE_ICONS_BASE}/openai/10a37f`,
  git: `${SIMPLE_ICONS_BASE}/git/F05032`,
  github: `${SIMPLE_ICONS_BASE}/github/ffffff`,

  // Common GitHub Languages & Utilities
  mako: `${LOGO_CDN_BASE}/python/python.png`,
  shell: `${SIMPLE_ICONS_BASE}/gnubash/4EAA25`,
  bash: `${SIMPLE_ICONS_BASE}/gnubash/4EAA25`,
  powershell: `${SIMPLE_ICONS_BASE}/powershell/5391FE`,
  dockerfile: `${SIMPLE_ICONS_BASE}/docker/2496ED`,
  makefile: `${SIMPLE_ICONS_BASE}/cmake/064F8C`,
  cmake: `${SIMPLE_ICONS_BASE}/cmake/064F8C`,
  markdown: `${SIMPLE_ICONS_BASE}/markdown/ffffff`,
  yaml: `${SIMPLE_ICONS_BASE}/yaml/CB171E`,
  json: `${SIMPLE_ICONS_BASE}/json/ffffff`,
  sql: `${SIMPLE_ICONS_BASE}/postgresql/4169E1`,
};

export const DEFAULT_POPULAR_TECHNOLOGIES = [
  'React',
  'Next.js',
  'TypeScript',
  'Tailwind CSS',
  'Node.js',
  'Python',
  'FastAPI',
  'PostgreSQL',
  'Supabase',
  'Docker',
  'Vercel',
  'GraphQL',
  'OpenAI',
  'Git',
];

/**
 * Normalizes technology name and resolves icon URL.
 * Returns undefined if no matching icon URL exists.
 */
export function getTechnologyIcon(name: string): string | undefined {
  if (!name) return undefined;

  const cleanKey = name.trim().toLowerCase();
  if (TECH_ICON_MAP[cleanKey]) {
    return TECH_ICON_MAP[cleanKey];
  }

  const slug = cleanKey.replace(/[^a-z0-9]+/g, '');
  if (TECH_ICON_MAP[slug]) {
    return TECH_ICON_MAP[slug];
  }

  return undefined;
}
