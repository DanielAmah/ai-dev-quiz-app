import { describe, expect, it } from 'vitest';
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, validateUsername } from './validateUsername';

describe('validateUsername', () => {
  it('rejects an empty string', () => {
    expect(validateUsername('')).toEqual({ ok: false, error: 'Please enter a username' });
  });

  it('rejects whitespace-only input as empty', () => {
    expect(validateUsername('   ')).toEqual({ ok: false, error: 'Please enter a username' });
  });

  it('rejects a name that is too short', () => {
    const result = validateUsername('a');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(`Username must be at least ${USERNAME_MIN_LENGTH} characters`);
    }
  });

  it('rejects a name that is too long', () => {
    const result = validateUsername('a'.repeat(USERNAME_MAX_LENGTH + 1));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(`Username must be at most ${USERNAME_MAX_LENGTH} characters`);
    }
  });

  it('rejects disallowed characters', () => {
    const result = validateUsername('bad@name!');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/letters, numbers/);
    }
  });

  it('accepts a valid name and returns the trimmed value', () => {
    expect(validateUsername('  Ada Lovelace  ')).toEqual({ ok: true, value: 'Ada Lovelace' });
  });

  it('accepts letters, numbers, hyphens and underscores', () => {
    expect(validateUsername('dev_42-pro')).toEqual({ ok: true, value: 'dev_42-pro' });
  });
});
