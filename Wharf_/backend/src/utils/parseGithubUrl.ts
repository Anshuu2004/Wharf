// Extracts owner and repo name from a GitHub URL.
// Supports formats:
// - https://github.com/owner/repo
// - https://github.com/owner/repo.git
// - github.com/owner/repo
// - owner/repo

export function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  if (!url) return null;

  const input = url.trim();
  const qualified = /^(?:www\.)?github\.com\//i.test(input)
    ? `https://${input}`
    : /^[a-z\d-]+\/[\w.-]+\/?$/i.test(input)
      ? `https://github.com/${input}`
      : input;

  try {
    const parsed = new URL(qualified);
    if (
      !['http:', 'https:'].includes(parsed.protocol) ||
      !['github.com', 'www.github.com'].includes(parsed.hostname) ||
      parsed.username || parsed.password || parsed.port
    ) return null;

    const [, owner, repository] = parsed.pathname.split('/');
    const repo = repository?.replace(/\.git$/, '');
    if (!owner || !repo || !/^[a-z\d-]+$/i.test(owner) || !/^[\w.-]+$/.test(repo)) return null;
    if (repo === '.' || repo === '..') return null;

    return { owner, repo };
  } catch {
    return null;
  }
}
