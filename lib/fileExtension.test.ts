import { describe, expect, it } from 'vitest';
import { getFileExtension } from './fileExtension';

describe('getFileExtension', () => {
  it('returns unknown for null', () => {
    expect(getFileExtension(null)).toBe('unknown');
  });

  it('returns unknown when there is no extension', () => {
    expect(getFileExtension('README')).toBe('unknown');
  });

  it('returns the lowercased extension', () => {
    expect(getFileExtension('Document.PDF')).toBe('pdf');
  });

  it('uses the last extension for multi-dot filenames', () => {
    expect(getFileExtension('archive.tar.gz')).toBe('gz');
  });
});
