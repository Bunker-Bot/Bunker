export function getGithubClientHeaders(): Record<string, string> {
  const token =
    Deno.env.get('GITHUB_PAT') ||
    Deno.env.get('GITHUB_PERSONAL_ACCESS_TOKEN') ||
    Deno.env.get('GITHUB_TOKEN') ||
    '';

  const userAgent = Deno.env.get('GITHUB_USER_AGENT') || 'Bunker-Platform';

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': userAgent,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}
