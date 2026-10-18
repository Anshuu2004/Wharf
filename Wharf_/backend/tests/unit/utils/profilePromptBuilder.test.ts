import { buildProfilePrompt, ProfileData, ProfileOptions } from '../../../src/utils/profilePromptBuilder';
import { describe, expect, test } from 'vitest';

describe('profilePromptBuilder Utility', () => {
  const mockProfile: ProfileData = {
    username: 'testuser',
    name: 'Test User G',
    bio: 'Software engineer from outer space.',
    avatarUrl: 'https://example.img',
    followers: 120,
    following: 55,
    repos: 12,
    totalStars: 420,
    totalForks: 10,
    topLanguages: [{ name: 'JavaScript', percentage: 100 }],
    techStack: ['React', 'Node.js'],
    contributions: 50,
    joinDate: '2019-01-01'
  };

  const mockOptions: ProfileOptions = {
    template: 'minimal',
    theme: 'dark',
    githubBadges: ['stars', 'followers'],
    techStack: ['React', 'AWS'], // Overrides The User Tech Stack For Skillicons
    social: [{ provider: 'github', url: 'https://github' }],
    showStats: true,
    showTopLanguages: true,
    showContributions: false,
    showTrophies: true,
    showStreak: true
  };

  test('should generate a profile prompt containing core markdown elements and skillicons', () => {
    const prompt = buildProfilePrompt(mockProfile, mockOptions);

    expect(prompt).toContain('Test User G');
    expect(prompt).toContain('testuser');
    expect(prompt).toContain('Software engineer');
    expect(prompt).toContain('github-stats-extended'); // For Stats
    expect(prompt).toContain('skillicons.dev/icons?i=react,aws'); // Resolves The Correct Stack Over Default
    expect(prompt).toContain('https://github-trophies'); // Since showTrophies is true
    expect(prompt).toContain('Total Stars Received: 420'); // Core Stat Logic
  });
});
