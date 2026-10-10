import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/common/Button';
import { useProfile } from '@/state';
import { validateUsername } from '@/utils/validateUsername';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { profile, saveProfile, clearProfile } = useProfile();
  const inputId = useId();
  const errorId = `${inputId}-error`;

  const [username, setUsername] = useState(profile?.username ?? '');
  const [error, setError] = useState<string | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);

  function runValidation(): string | null {
    const result = validateUsername(username);
    if (!result.ok) {
      setError(result.error);
      return null;
    }
    setError(null);
    return result.value;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = runValidation();
    if (value === null) {
      setSavedName(null);
      return;
    }
    saveProfile({ username: value });
    setUsername(value);
    setSavedName(value);
  }

  function handleClear() {
    clearProfile();
    setUsername('');
    setError(null);
    setSavedName(null);
  }

  return (
    <section className={styles.page}>
      <h1 className={styles.heading}>Profile</h1>
      <p className={styles.intro}>
        Your profile is stored locally in this browser. Nothing is sent to a server.
      </p>

      {profile && (
        <div className={styles.greeting}>
          <span>Signed in as {profile.username}</span>
          <Button variant="danger" onClick={handleClear}>
            Clear profile
          </Button>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.label} htmlFor={inputId}>
          Username
        </label>
        <input
          id={inputId}
          className={`${styles.input} ${error ? styles.inputInvalid : ''}`.trim()}
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          onBlur={runValidation}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          autoComplete="off"
        />
        {error && (
          <p id={errorId} className={styles.error} role="alert">
            {error}
          </p>
        )}
        {savedName && !error && (
          <p className={styles.success} role="status">
            Saved — you&rsquo;re set, {savedName}
          </p>
        )}
        <Button type="submit" variant="primary">
          Save profile
        </Button>
      </form>
    </section>
  );
}
