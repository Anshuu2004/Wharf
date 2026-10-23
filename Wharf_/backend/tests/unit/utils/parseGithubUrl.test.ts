import { parseGithubUrl } from '../../../src/utils/parseGithubUrl';
import { describe, expect, test } from 'vitest';

describe('parseGithubUrl Utility', () => {
  test.each([
    'https://github.com/facebook/react/tree/main/packages',
    'https://github.com/facebook/react/blob/main/README.md',
    'https://github.com/facebook/react?tab=readme-ov-file',
    'https://github.com/facebook/react#readme',
    'https://github.com/facebook/react.git?tab=readme-ov-file#readme',
    'https://github.com/facebook/react.git/tree/main',
    'github.com/facebook/react?tab=readme-ov-file',
    'facebook/react.git',
    '  https://github.com/facebook/react  ',
  ])('extracts the repository from %s', (url) => {
    expect(parseGithubUrl(url)).toEqual({ owner: 'facebook', repo: 'react' });
  });

  test.each([
    'https://example.com/github.com/facebook/react',
    'https://notgithub.com/facebook/react',
    'https://github.com.example.com/facebook/react',
    'https://github.com@evil.example/facebook/react',
    'https://user:password@github.com/facebook/react',
    'ftp://github.com/facebook/react',
    'https://github.com:8080/facebook/react',
    'https://github.com/facebook',
    'https://github.com//react',
    'https://github.com/facebook/.git',
    'https://github.com/facebook/react%20project',
    'not an owner/react',
    '   ',
  ])('rejects an invalid or non-GitHub repository URL: %s', (url) => {
    expect(parseGithubUrl(url)).toBeNull();
  });

  test('should parse a standard HTTPS github url', () => {
    // Arrange
    const url = 'https://github.com/facebook/react';

    // Act
    const result = parseGithubUrl(url);

    // Assert
    expect(result).toEqual({ owner: 'facebook', repo: 'react' });
  });

  test('should parse an HTTP github url', () => {
    // Arrange
    const url = 'http://github.com/facebook/react';

    // Act
    const result = parseGithubUrl(url);

    // Assert
    expect(result).toEqual({ owner: 'facebook', repo: 'react' });
  });

  test('should parse a URL with trailing slash', () => {
    // Arrange
    const url = 'https://github.com/facebook/react/';

    // Act
    const result = parseGithubUrl(url);

    // Assert
    expect(result).toEqual({ owner: 'facebook', repo: 'react' });
  });

  test('should parse a URL with .git suffix', () => {
    // Arrange
    const url = 'https://github.com/facebook/react.git';

    // Act
    const result = parseGithubUrl(url);

    // Assert
    expect(result).toEqual({ owner: 'facebook', repo: 'react' });
  });

  test('should parse a www.github.com url', () => {
    // Arrange
    const url = 'https://www.github.com/facebook/react';

    // Act
    const result = parseGithubUrl(url);

    // Assert
    expect(result).toEqual({ owner: 'facebook', repo: 'react' });
  });

  test('should parse a naked github.com url without protocol', () => {
    // Arrange
    const url = 'github.com/facebook/react';

    // Act
    const result = parseGithubUrl(url);

    // Assert
    expect(result).toEqual({ owner: 'facebook', repo: 'react' });
  });

  test('should parse a simple owner/repo format', () => {
    // Arrange
    const url = 'facebook/react';

    // Act
    const result = parseGithubUrl(url);

    // Assert
    expect(result).toEqual({ owner: 'facebook', repo: 'react' });
  });

  test('should return null for empty string or nullish value', () => {
    // Arrange
    const url = '';

    // Act
    const result = parseGithubUrl(url);

    // Assert
    expect(result).toBeNull();
  });

  test('should return null for invalid urls', () => {
    // Arrange
    const url = 'https://google.com';

    // Act
    const result = parseGithubUrl(url);

    // Assert
    expect(result).toBeNull();
  });
});
