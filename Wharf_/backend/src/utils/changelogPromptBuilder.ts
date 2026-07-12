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

  return `You are a professional technical writer generating a CHANGELOG.md file. Follow the Keep a Changelog 1.0.0 specification EXACTLY.

## Repository: ${repoName}
## Commit Range: ${oldest} → ${newest} (${totalCommits} commits)
## Latest Tag: ${latestTag}
## Generated: ${generationDate}

---

## STRICT OUTPUT RULES:
1. Start the document with exactly: \`# Changelog\`
2. Second line: \`All notable changes to this project will be documented in this file.\`
3. Third line: \`The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\`
4. Fourth line: \`and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\`
5. Add a blank line, then begin with an \`## [Unreleased]\` section.
6. Group entries under EXACTLY these subsections (only include non-empty ones): ### Added, ### Changed, ### Deprecated, ### Removed, ### Fixed, ### Security
7. Each entry MUST follow this format: \`- Short description (YYYY-MM-DD) [sha]\`
8. NEVER invent information not present in the commits. If a date is listed, use it verbatim.
9. For breaking changes${hasBreaking ? ' (present in this data)' : ''}, prefix with **BREAKING CHANGE:**
10. After [Unreleased], add dated version sections like \`## [${latestTag !== 'Unreleased' ? latestTag : '1.0.0'}] - ${newest}\` only if tags are provided.
11. At the bottom, add a \`[Unreleased]: ...\` links section only if you have valid tag references.
12. Keep descriptions CONCISE (max 120 chars), action-verb style (e.g. "Add user authentication", "Fix null pointer in login").
13. DO NOT include chore/refactor/style/test commits in the final output unless they have user-visible impact.

## RAW COMMIT DATA (use for dates and SHAs):

${commitDataSection}

Generate the complete, final CHANGELOG.md content now. Output ONLY the markdown, no preamble or explanation.`;
}
