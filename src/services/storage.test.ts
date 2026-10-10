import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readValue, removeValue, writeValue } from './storage';

const KEY = 'unit';
const VERSION = 1;
const isString = (v: unknown): v is string => typeof v === 'string';

describe('storage', () => {
  beforeEach(() => window.localStorage.clear());

  it('round-trips a valid value', () => {
    expect(writeValue(KEY, VERSION, 'hello')).toBe(true);
    expect(readValue(KEY, VERSION, isString)).toBe('hello');
  });

  it('returns null and clears the key when the payload fails validation', () => {
    writeValue(KEY, VERSION, 42);
    expect(readValue(KEY, VERSION, isString)).toBeNull();
    // Key was removed, so a second read is also null.
    expect(readValue(KEY, VERSION, isString)).toBeNull();
  });

  it('discards a value written under an older version', () => {
    writeValue(KEY, 1, 'old');
    expect(readValue(KEY, 2, isString)).toBeNull();
  });

  it('discards unparseable JSON', () => {
    window.localStorage.setItem('ai-dev-quiz:unit', '{not json');
    expect(readValue(KEY, VERSION, isString)).toBeNull();
  });

  it('treats a missing key as absent', () => {
    expect(readValue('nope', VERSION, isString)).toBeNull();
  });

  it('returns false when writing throws (e.g. quota exceeded)', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(writeValue(KEY, VERSION, 'x')).toBe(false);
    spy.mockRestore();
  });

  it('returns null when reading throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readValue(KEY, VERSION, isString)).toBeNull();
    spy.mockRestore();
  });

  it('removeValue is safe even when storage throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => removeValue(KEY)).not.toThrow();
    spy.mockRestore();
  });
});
