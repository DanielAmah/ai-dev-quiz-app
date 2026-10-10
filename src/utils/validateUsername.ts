/**
 * Validates a raw username string for the profile form (see issue #12).
 *
 * Rules, applied to the trimmed input:
 * - must not be empty;
 * - at least 2 and at most 20 characters;
 * - only letters, numbers, spaces, hyphens and underscores are allowed.
 *
 * On success the trimmed value is returned, so callers persist the cleaned
 * string rather than the raw input.
 */

export const USERNAME_MIN_LENGTH = 2;
export const USERNAME_MAX_LENGTH = 20;

/** Letters, numbers, spaces, hyphen and underscore. */
const ALLOWED_PATTERN = /^[\p{L}\p{N} _-]+$/u;

export type ValidationResult = { ok: true; value: string } | { ok: false; error: string };

export function validateUsername(raw: string): ValidationResult {
  const value = raw.trim();

  if (value.length === 0) {
    return { ok: false, error: 'Please enter a username' };
  }
  if (value.length < USERNAME_MIN_LENGTH) {
    return {
      ok: false,
      error: `Username must be at least ${USERNAME_MIN_LENGTH} characters`,
    };
  }
  if (value.length > USERNAME_MAX_LENGTH) {
    return {
      ok: false,
      error: `Username must be at most ${USERNAME_MAX_LENGTH} characters`,
    };
  }
  if (!ALLOWED_PATTERN.test(value)) {
    return {
      ok: false,
      error: 'Username can only contain letters, numbers, spaces, hyphens and underscores',
    };
  }

  return { ok: true, value };
}
