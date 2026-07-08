export interface RepoContent {
  readme: string;
}

export interface HealthScoreResult {
  score: number;
  breakdown: Record<string, number>;
  suggestions: string[];
}

export interface ContributionScoreResult {
  score: number;
  breakdown: {
    hasContributing: boolean;
    hasIssueTemplates: boolean;
    hasPRTemplates: boolean;
    hasCodeOfConduct: boolean;
    hasGoodFirstIssues: boolean;
    hasCommunityLink: boolean;
  };
  suggestions: string[];
}

export class HealthScoreService {
  async analyzeReadmeHealth(content: string): Promise<HealthScoreResult> {
    const breakdown: Record<string, number> = {
      description: 0,
      installation: 0,
      usage: 0,
      techStack: 0,
      contributing: 0,
      license: 0,
      visuals: 0,
    };
    const suggestions: string[] = [];

    // Description (20 pts)
    const desc = this.extractDescription(content);
    if (!desc || desc.length < 10) {
      breakdown.description = 0;
      suggestions.push(
        "Your README description is missing or too short. Expand it to >50 words outlining the project's purpose and impact. Consider using the Wharf README generator to instantly draft an engaging overview (+20 points)."
      );
    } else {
      const words = desc.split(/\\s+/).length;
      if (words > 50) breakdown.description = 20;
      else if (words > 25) breakdown.description = 10;
      else {
        breakdown.description = 5;
        suggestions.push(
          'Your description is a bit brief. Expand it to over 50 words to receive full points (+15 points).'
        );
      }
    }

    // Installation (20 pts)
    const hasInstall = this.hasSection(content, ['install', 'setup', 'getting started']);
    const hasInstallCode =
      hasInstall && content.substring(content.toLowerCase().indexOf('install')).includes('```');
    if (hasInstall && hasInstallCode) {
      breakdown.installation = 20;
    } else if (hasInstall) {
      breakdown.installation = 10;
      suggestions.push(
        'Your installation section is missing code blocks. Add explicit steps wrapped in standard markdown code blocks, or let the Wharf SDK scraper automatically format these for you (+10 points).'
      );
    } else {
      breakdown.installation = 0;
      suggestions.push(
        'Missing Installation instructions. Developers need to know how to install and run your project! Use the Wharf auto-generator to automatically pull run commands from your package files (+20 points).'
      );
    }

    // Usage (15 pts)
    if (this.hasSection(content, ['usage', 'example', 'how to use', 'api reference', 'features'])) {
      breakdown.usage = 15;
    } else {
      breakdown.usage = 0;
      suggestions.push(
        "Missing a 'Usage' or 'Features' section. Explicitly show users how to utilize your system after installation. The Wharf generator can automatically format usage layouts for you natively (+15 points)."
      );
    }

    // Tech Stack (15 pts)
    if (
      this.hasSection(content, ['built with', 'tech stack', 'technologies', 'stack']) ||
      this.hasBadges(content)
    ) {
      breakdown.techStack = 15;
    } else {
      breakdown.techStack = 0;
      suggestions.push(
        "Your Tech Stack isn't clearly defined. Add a 'Built With' section or Shield.io badges at the top. Note: Wharf auto-generates beautiful aligned Tech Stack badges instantly (+15 points)."
      );
    }

    // Contributing (15 pts)
    if (this.hasSection(content, ['contributing', 'how to contribute', 'support'])) {
      breakdown.contributing = 15;
    } else {
      breakdown.contributing = 0;
      suggestions.push(
        "Missing a 'Contributing' guide. Open source projects thrive on contributions. We recommend generating a standard step-by-step contribution guideline via Wharf (+15 points)."
      );
    }

    // License (10 pts)
    if (this.hasSection(content, ['license'])) {
      breakdown.license = 10;
    } else {
      breakdown.license = 0;
      suggestions.push(
        "No 'License' section found. Add a licensing section so developers know their legal boundaries using your code (+10 points)."
      );
    }

    // Visuals (5 pts)
    if (content.includes('![') || content.includes('<img')) {
      breakdown.visuals = 5;
    } else {
      breakdown.visuals = 0;
      suggestions.push(
        "No images or GIFs detected. Visuals increase engagement massively. Try using Wharf's dynamic screenshot placeholders to make a layout (+5 points)."
      );
    }

    const score = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    return { score, breakdown, suggestions };
  }

  async analyzeContributionReadiness(
    hasContributing: boolean,
    issueTemplatesCount: number,
    prTemplatesCount: number,
    hasCodeOfConduct: boolean,
    readmeContent: string,
    hasGoodFirstIssues: boolean = false
  ): Promise<ContributionScoreResult> {
    const breakdown = {
      hasContributing,
      hasIssueTemplates: issueTemplatesCount > 0,
      hasPRTemplates: prTemplatesCount > 0,
      hasCodeOfConduct,
      hasGoodFirstIssues,
      hasCommunityLink: this.hasCommunityLink(readmeContent),
    };

    const suggestions: string[] = [];
    let score = 0;

    if (breakdown.hasContributing) score += 25;
    else
      suggestions.push(
        'Missing a CONTRIBUTING.md file. This is crucial for onboarding open-source devs. Use Wharf to instantly generate robust contribution steps (+25 points).'
      );

    if (breakdown.hasIssueTemplates) score += 20;
    else
      suggestions.push(
        'No GitHub Issue Templates found. Create templates in .github/ISSUE_TEMPLATE/ to standardize bug reports and feature requests (+20 points).'
      );

    if (breakdown.hasPRTemplates) score += 20;
    else
      suggestions.push(
        'No PR Template found. Adding a .github/PULL_REQUEST_TEMPLATE.md drastically improves PR quality by forcing developers to list their changes (+20 points).'
      );

    if (breakdown.hasCodeOfConduct) score += 15;
    else
      suggestions.push(
        'Missing CODE_OF_CONDUCT.md. Add one to ensure a welcoming community space (+15 points).'
      );

    if (breakdown.hasGoodFirstIssues) score += 10;
    else
      suggestions.push(
        "Tip: Create issues with the 'good first issue' label to attract beginners! (+10 points)."
      );

    if (breakdown.hasCommunityLink) score += 10;
    else
      suggestions.push(
        'Consider linking to a Discord, Slack, or Matrix server in your README to build engagement (+10 points).'
      );

    return { score, breakdown, suggestions };
  }

  private extractDescription(content: string): string | null {
    const paragraphs = content.split(/\n\n+/);
    for (const p of paragraphs) {
      if (p.startsWith('#') || p.startsWith('<') || p.startsWith('[!') || p.trim() === '') continue;
      if (p.split(' ').length > 10) return p.trim();
    }
    return null;
  }

  private hasSection(content: string, keywords: string[]): boolean {
    const lines = content.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('#')) {
        const lower = line.toLowerCase();
        if (keywords.some((kw) => lower.includes(kw))) {
          return true;
        }
      }
    }
    return false;
  }

  private hasBadges(content: string): boolean {
    return content.includes('shields.io') || content.includes('img.shields.io');
  }

  private hasCommunityLink(content: string): boolean {
    const lower = content.toLowerCase();
    return (
      lower.includes('discord.gg') || lower.includes('slack.com') || lower.includes('matrix.to')
    );
  }
}

export const healthScoreService = new HealthScoreService();
