import { parseGithubUrl } from '../../../src/utils/parseGithubUrl';
import { describe, expect, test } from 'vitest';

describe('parseGithubUrl Utility', () => {
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
