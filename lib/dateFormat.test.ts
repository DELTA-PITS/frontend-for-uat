import { describe, expect, it } from 'vitest';
import { formatDisplayDateTime } from './dateFormat';

describe('formatDisplayDateTime', () => {
  it('returns null for a null value', () => {
    expect(formatDisplayDateTime(null)).toBeNull();
  });

  it('returns the original string when it cannot be parsed as a date', () => {
    expect(formatDisplayDateTime('not-a-date')).toBe('not-a-date');
  });

  // No trailing "Z" — these are parsed as local time, so the assertions
  // stay correct regardless of the timezone the tests run in.
  it('formats in en-US order: Month Day, Year, HH.MM', () => {
    expect(formatDisplayDateTime('2024-04-16T11:30:00', 'en')).toBe('April 16, 2024, 11.30');
  });

  it('formats in id-ID order: Day Month Year, HH.MM', () => {
    expect(formatDisplayDateTime('2024-04-16T11:30:00', 'id')).toBe('16 April 2024, 11.30');
  });

  it('pads single-digit hours and minutes', () => {
    expect(formatDisplayDateTime('2024-01-01T05:05:00', 'en')).toBe('January 1, 2024, 05.05');
  });
});
