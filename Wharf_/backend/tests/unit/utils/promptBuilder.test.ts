import { buildReadmePrompt } from '../../../src/utils/promptBuilder';
import { describe, expect, test } from '@jest/globals';

describe('promptBuilder Utility', () => {
  const mockContext: any = {
    meta: {
      name: 'Eco-System',
      owner: 'Frosty',
      description: 'A mock system for testing.',
      language: 'TypeScript',
      stars: 42,
      topics: ['ai', 'testing'],
      license: 'MIT'
    },
    frameworks: ['React', 'NestJS'],
    commands: {
      install: 'npm install',
      run: 'npm start'
    },
    treePreview: '├── src\n│   └── index.ts',
    keyFiles: {
      'package.json': '{"name":"eco"}'
    }
  };

  test('should format and embed all necessary data points into the generated prompt', () => {
    const result = buildReadmePrompt(mockContext, 'technical', ['Features', 'Installation']);

    expect(result).toContain('Eco-System');
    expect(result).toContain('Frosty');
    expect(result).toContain('FrostByte-49');
    expect(result).toContain('SECTIONS TO INCLUDE: Features, Installation');
    
    // tone validation
    expect(result).toContain('Write for developers and contributors');
  });

  test('should adjust tone instructions properly', () => {
    const resultBeginner = buildReadmePrompt(mockContext, 'beginner', []);
    expect(resultBeginner).toContain('Write for open-source newcomers');

    const resultRecruiter = buildReadmePrompt(mockContext, 'recruiter', []);
    expect(resultRecruiter).toContain('Write for hiring managers reviewing a portfolio');
  });
});
