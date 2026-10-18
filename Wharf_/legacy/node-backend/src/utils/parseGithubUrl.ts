// Extracts owner and repo name from a GitHub URL.
// Supports formats:
// - https://github.com/owner/repo
// - https://github.com/owner/repo.git
// - github.com/owner/repo
// - owner/repo

export function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  if (!url) return null;

  // Clean URL
  let cleanUrl = url.trim().replace(/\/$/, '');

  // Handle SSH/HTTPS Git URLs
  if (cleanUrl.endsWith('.git')) {
    cleanUrl = cleanUrl.slice(0, -4);
  }

  // Regex To Match github.com/owner/repo Or Just owner/repo
  const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/]+)/;
  const simpleRegex = /^([^/]+)\/([^/]+)$/;

  const githubMatch = cleanUrl.match(githubRegex);
  if (githubMatch) {
    return {
      owner: githubMatch[1],
      repo: githubMatch[2],
    };
  }

  const simpleMatch = cleanUrl.match(simpleRegex);
  if (simpleMatch) {
    return {
      owner: simpleMatch[1],
      repo: simpleMatch[2],
    };
  }

  return null;
}
