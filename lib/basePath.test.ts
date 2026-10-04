import { describe, expect, it } from 'vitest';
import { normalizeBasePath, withBasePath } from './basePath';

describe('normalizeBasePath', () => {
  it.each([
    [undefined, ''],
    ['', ''],
    ['/', ''],
    ['/sepolia', '/sepolia'],
    ['/sepolia/', '/sepolia'],
    ['sepolia', '/sepolia'],
    ['  /sepolia  ', '/sepolia'],
  ])('%j -> %j', (input, expected) => {
    expect(normalizeBasePath(input as string | undefined)).toBe(expected);
  });
});

describe('withBasePath', () => {
  it('is a no-op for the root deployment (production)', () => {
    expect(withBasePath('/api/verify', '')).toBe('/api/verify');
    expect(withBasePath('/', '')).toBe('/');
  });

  it('prefixes app-relative paths under a sub-path', () => {
    expect(withBasePath('/api/verify', '/sepolia')).toBe('/sepolia/api/verify');
    expect(withBasePath('/', '/sepolia')).toBe('/sepolia/');
    expect(withBasePath('/publisher', '/sepolia')).toBe('/sepolia/publisher');
  });

  it('never touches absolute or protocol-relative URLs', () => {
    expect(withBasePath('https://sepolia.etherscan.io/tx/0x1', '/sepolia')).toBe('https://sepolia.etherscan.io/tx/0x1');
    expect(withBasePath('//cdn.example.com/x', '/sepolia')).toBe('//cdn.example.com/x');
  });
});
