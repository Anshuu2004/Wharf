export interface CommitInfo {
  sha: string;
  shortSha: string;
  message: string;
  subject: string;
  body: string | null;
  author: {
    name: string;
    email: string;
    date: string;
    login: string | null;
  };
  type: string;
  url: string;
}

export interface CommitGroup {
  type: string;
  commits: CommitInfo[];
}

export interface ChangelogOptions {
  commitCount: number;
  includeTags: boolean;
  includeContributors: boolean;
  format: 'keep-a-changelog' | 'simple' | 'json';
  groupByType: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  feat: 'Added',
  fix: 'Fixed',
  refactor: 'Changed',
  perf: 'Changed',
  docs: 'Changed',
  style: 'Changed',
  test: 'Changed',
  chore: 'Changed',
  breaking: 'Removed',
  revert: 'Removed',
  ci: 'Changed',
  build: 'Changed',
};

function formatDate(isoDate: string): string {
  try {
    return new Date(isoDate).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function getDateRange(commits: CommitInfo[]): { oldest: string; newest: string } {
  if (commits.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    return { oldest: today, newest: today };
  }
  const dates = commits.map((c) => new Date(c.author.date).getTime());
  return {
    newest: formatDate(commits[0].author.date),
    oldest: formatDate(commits[commits.length - 1].author.date),
  };
}

export function buildChangelogPrompt(
  groups: CommitGroup[],
  options: ChangelogOptions,
  repoName: string,
  tags: string[] = []
): string {
  const allCommits = groups.flatMap((g) => g.commits);
  const { newest, oldest } = getDateRange(allCommits);
  const totalCommits = allCommits.length;
  const generationDate = new Date().toISOString().split('T')[0];
  const latestTag = tags.length > 0 ? tags[0] : 'Unreleased';

  // Build Raw Commit Data Sections By Keep A Changelog Category
  const categoryMap: Record<string, CommitInfo[]> = {
    Added: [],
    Changed: [],
    Deprecated: [],
    Removed: [],
    Fixed: [],
    Security: [],
  };

  groups.forEach((group) => {
    const category = TYPE_LABELS[group.type] || 'Changed';
    categoryMap[category].push(...group.commits);
  });

  let commitDataSection = '';
  Object.entries(categoryMap).forEach(([category, commits]) => {
    if (commits.length === 0) return;
    commitDataSection += `### ${category}\n`;
    commits.forEach((c) => {
      const authorRef = options.includeContributors
        ? c.author.login
          ? ` (@${c.author.login})`
          : ` (${c.author.name})`
        : '';
      const dateStr = formatDate(c.author.date);
      commitDataSection += `- [${c.shortSha}] ${c.subject}${authorRef} — ${dateStr}\n`;
      if (c.body) {
        commitDataSection += `  > ${c.body.split('\n').join('\n  > ')}\n`;
      }
    });
    commitDataSection += '\n';
  });

  const hasBreaking = groups.some((g) => g.type === 'breaking');
  const tagList = tags.length > 0 ? tags.slice(0, 10).join(', ') : 'none';
  const contributors = [...new Set(allCommits.map((c) => c.author.login || c.author.name).filter(Boolean))];
  const contributorStr = contributors.length > 0 ? contributors.map((c) => c.startsWith('@') ? c : `@${c}`).join(', ') : 'Unknown';

  return `You are an elite technical writer generating an industry-grade, professional CHANGELOG.md for the repository "${repoName}". Follow the Keep a Changelog 1.0.0 specification with the highest possible quality and extreme verbosity. Every section MUST be deeply detailed, descriptive, and comprehensive — never abbreviate or truncate. You must provide rich quality content that explains the "why" and "how" behind every change, ensuring the final document is suitable for enterprise-level release notes.

## REPOSITORY METADATA
- Repository: ${repoName}
- Commit Range: ${oldest} → ${newest}
- Total Commits Analyzed: ${totalCommits}
- Available Version Tags: ${tagList}
- Contributors in this range: ${contributorStr}
- Generated On: ${generationDate}
- Breaking Changes Present: ${hasBreaking ? 'YES — flag with BREAKING CHANGE' : 'No'}

---

## MANDATORY DOCUMENT STRUCTURE

You MUST output the document in this exact order:

### 1. Header Block (verbatim)
\`\`\`
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
\`\`\`

### 2. Version Sections
${tags.length > 0
  ? `Create a version section for each tag provided. Use this format:
## [${tags[0]}] - ${newest}
Then group commits under the correct subsections.`
  : `Create an ## [Unreleased] section for all commits since no tags are present.`}

### 3. Subsection Categories (ONLY include non-empty ones, in this order):
- **### Added** — new features, new endpoints, new components (from 'feat' commits)
- **### Changed** — updates to existing functionality, refactors, performance improvements, dependency bumps (from 'refactor', 'perf', 'style', 'build', 'ci', 'docs' commits WITH user-visible impact)  
- **### Deprecated** — features planned for removal
- **### Removed** — features, endpoints, or options deleted (from 'breaking' revert commits)
- **### Fixed** — bug fixes, error handling, crash fixes (from 'fix' commits)
- **### Security** — vulnerability patches, auth fixes, dependency security updates

### 4. Comparison Links Footer
At the very end, add a links section like:
\`\`\`
[Unreleased]: https://github.com/${repoName}/compare/${tags[0] || 'HEAD'}...HEAD
${tags.length > 1 ? `[${tags[0]}]: https://github.com/${repoName}/compare/${tags[1]}...${tags[0]}` : ''}
\`\`\`

---

## ENTRY FORMATTING RULES (Non-Negotiable)

Each changelog entry MUST follow this rich format:
\`- **<Short impactful title>** — <Full descriptive sentence explaining what changed, why it matters, and any impact on users or developers>. ([${allCommits[0]?.shortSha || 'abc1234'}](${allCommits[0]?.url || '#'})) ${options.includeContributors ? `by @contributor` : ''}\`

Examples of GOOD entries:
- **Add streaming README generation** — Implemented server-sent events (SSE) streaming for the README generation endpoint, allowing clients to receive content progressively instead of waiting for the full response. ([a1b2c3d](https://github.com/example/repo/commit/a1b2c3d)) by @devname
- **Fix null pointer in auth middleware** — Resolved a crash that occurred when the Authorization header was present but empty, causing a 500 response instead of a 401. ([d4e5f6a](https://github.com/example/repo/commit/d4e5f6a))
- **BREAKING CHANGE: Remove legacy /v1/generate endpoint** — The deprecated /v1/generate REST endpoint has been removed. All consumers must migrate to /api/generate which supports streaming and additional options. ([b7c8d9e](https://github.com/example/repo/commit/b7c8d9e))

Examples of BAD entries (DO NOT generate these):
- Fix bug ← too vague, no SHA, no impact
- Update dependencies ← must explain which ones and why
- Refactor code ← must explain what was refactored and the benefit

## QUALITY REQUIREMENTS
- Every entry must have a **bold title**, a thorough and descriptive explanation, and a commit SHA link
- Descriptions must be highly detailed and span 2-4 full sentences explaining the technical context, impact, and reasoning — never use one word or vague phrases
- Group closely related commits into a single cohesive, rich entry if they address the same feature or fix
- Include BREAKING CHANGE: prefix in bold for any breaking commits
- NEVER omit feat or fix commits — these are always user-visible
- Include chore/refactor/style commits ONLY if they have meaningful user-visible impact (e.g. "Migrate to Vite 6 — build times reduced by 40%")
- Entries should be ordered: most impactful first within each subsection
- Use past tense action verbs: Added, Fixed, Removed, Updated, Migrated, Replaced, Enabled, Disabled
- The overall document MUST feel extremely premium, comprehensive, and tailored for professional industry use.

## RAW COMMIT DATA (your source of truth — use exact SHAs and dates):

${commitDataSection}

Generate the complete, final CHANGELOG.md now. Output ONLY the markdown content — no preamble, no explanation, no code fences wrapping the output.`;
}
