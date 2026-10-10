import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ProfileProvider } from '@/context/ProfileContext';
import ProfilePage from './ProfilePage';

const STORAGE_KEY = 'ai-dev-quiz:profile';

function renderPage() {
  return render(
    <MemoryRouter>
      <ProfileProvider>
        <ProfilePage />
      </ProfileProvider>
    </MemoryRouter>,
  );
}

function seedProfile(username: string) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, data: { username } }));
}

function storedUsername(): string | undefined {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return undefined;
  return JSON.parse(raw).data.username as string;
}

describe('ProfilePage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('shows an error and does not persist when the name is invalid', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/username/i), 'a');
    await user.click(screen.getByRole('button', { name: /save profile/i }));

    const input = screen.getByLabelText(/username/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent(/at least 2 characters/i);
    expect(storedUsername()).toBeUndefined();
  });

  it('saves a valid name and shows a success confirmation', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/username/i), '  Ada Lovelace  ');
    await user.click(screen.getByRole('button', { name: /save profile/i }));

    expect(screen.getByRole('status')).toHaveTextContent(/Ada Lovelace/);
    expect(storedUsername()).toBe('Ada Lovelace');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('pre-fills from an existing profile and can clear it', async () => {
    const user = userEvent.setup();
    seedProfile('ExistingUser');
    renderPage();

    expect(screen.getByLabelText(/username/i)).toHaveValue('ExistingUser');
    expect(screen.getByText(/signed in as ExistingUser/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /clear profile/i }));

    expect(screen.queryByText(/signed in as/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toHaveValue('');
    expect(storedUsername()).toBeUndefined();
  });
});
