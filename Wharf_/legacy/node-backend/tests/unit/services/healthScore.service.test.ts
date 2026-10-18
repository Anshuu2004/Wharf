import { healthScoreService } from '../../../src/services/healthScore.service';

describe('HealthScoreService', () => {
  describe('analyzeReadmeHealth', () => {
    it('should score poorly for a blank readme', async () => {
      const res = await healthScoreService.analyzeReadmeHealth('');
      expect(res.score).toBe(0);
      expect(res.breakdown.description).toBe(0);
      expect(res.suggestions.length).toBeGreaterThan(0);
    });

    it('should grant points for a robust description', async () => {
      const longDesc = Array(150).fill('word').join(' ');
      
      const res = await healthScoreService.analyzeReadmeHealth(longDesc);
      expect(res.breakdown.description).toBe(5);
    });

    it('should detect sections properly based on headers', async () => {
      const md = `
# Wharf
Very long description with many words goes here... bla bla bla bla bla bla bla bla bla bla bla bla

## Installation
\`\`\`bash
npm start
\`\`\`

## Features
Awesome stuff

## Tech Stack
React, Node

## Contributing
Fork it

## License
MIT
      `;

      const res = await healthScoreService.analyzeReadmeHealth(md);
      expect(res.breakdown.installation).toBe(20);
      expect(res.breakdown.usage).toBe(15);
      expect(res.breakdown.techStack).toBe(15);
      expect(res.breakdown.contributing).toBe(15);
      expect(res.breakdown.license).toBe(10);
      // Wait, No Visuals
      expect(res.breakdown.visuals).toBe(0);
    });

    it('should detect visuals via image markdown or HTML tags', async () => {
      const md = `![alt](url)`;
      const res = await healthScoreService.analyzeReadmeHealth(md);
      expect(res.breakdown.visuals).toBe(5);
    });
  });

  describe('analyzeContributionReadiness', () => {
    it('should evaluate full score if all contribution elements exist', async () => {
      const res = await healthScoreService.analyzeContributionReadiness(
        true, 1, 1, true, 'Join our discord.gg/server!', true
      );
      expect(res.score).toBe(100);
      expect(res.suggestions.length).toBe(0);
    });

    it('should generate suggestions when elements are missing', async () => {
      const res = await healthScoreService.analyzeContributionReadiness(
        false, 0, 0, false, 'No link', false
      );
      expect(res.score).toBe(0);
      expect(res.suggestions.length).toBe(6);
    });
  });
});
