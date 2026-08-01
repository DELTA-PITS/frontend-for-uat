import { describe, expect, it } from 'vitest';
import { getFileSize } from './fileSizeCalc';

function makeFile(size: number): File {
  return { size } as File;
}

describe('getFileSize', () => {
  it('returns "0 Bytes" for null', () => {
    expect(getFileSize(null)).toBe('0 Bytes');
  });

  it('formats sizes under 1 KB in Bytes', () => {
    expect(getFileSize(makeFile(512))).toBe('512.00 Bytes');
  });

  it('formats sizes in KB', () => {
    expect(getFileSize(makeFile(2048))).toBe('2.00 KB');
  });

  it('formats sizes in MB', () => {
    expect(getFileSize(makeFile(5 * 1024 * 1024))).toBe('5.00 MB');
  });
});
