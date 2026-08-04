import { detectFrameworks, getCommands } from '../../../src/utils/frameworkDetector';
import { describe, expect, test } from 'vitest';

describe('frameworkDetector Utility', () => {
  describe('detectFrameworks', () => {
    test('should detect frameworks from package.json dependencies', () => {
      const packageJson = {
        dependencies: {
          react: '^18.2.0',
          next: '^13.0.0'
        }
      };
      
      const result = detectFrameworks([], packageJson);
      expect(result.sort()).toEqual(['nextjs', 'react']);
    });

    test('should detect frameworks from package.json devDependencies', () => {
      const packageJson = {
        devDependencies: {
          vite: '^4.0.0',
          svelte: '^3.0.0'
        }
      };
      
      const result = detectFrameworks([], packageJson);
      expect(result.sort()).toEqual(['svelte', 'vite']);
    });

    test('should fallback to file detection for python frameworks', () => {
      const files = ['manage.py', 'requirements.txt'];
      const result = detectFrameworks(files);
      expect(result).toContain('django');
    });

    test('should return empty array when no framework is detected', () => {
      const result = detectFrameworks(['index.html', 'styles.css'], {});
      expect(result).toEqual([]);
    });
  });

  describe('getCommands', () => {
    test('should return default commands if no frameworks provided', () => {
      const result = getCommands([]);
      expect(result).toEqual({ install: 'npm install', run: 'npm start' });
    });

    test('should return correct commands for React', () => {
      const result = getCommands(['react']);
      expect(result).toEqual({ install: 'npm install', run: 'npm start' });
    });

    test('should return correct commands for FastAPI', () => {
      const result = getCommands(['fastapi']);
      expect(result).toEqual({ install: 'pip install -r requirements.txt', run: 'uvicorn main:app --reload' });
    });

    test('should return first recognized framework commands when multiple exist', () => {
      // In This Case, 'vite' Will Be Requested. Wait, 'getCommands' Checks The First From The Array Passed.
      const result = getCommands(['vite', 'react']);
      expect(result).toEqual({ install: 'npm install', run: 'npm run dev' });
    });
  });
});
