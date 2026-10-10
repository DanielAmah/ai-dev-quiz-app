import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react';
import type { Profile } from '@/types';
import { isProfile } from '@/services/progressValidation';
import { readValue, removeValue, writeValue } from '@/services/storage';

const KEY = 'profile';
const VERSION = 1;

interface ProfileContextValue {
  profile: Profile | null;
  saveProfile: (profile: Profile) => void;
  clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(() => readValue(KEY, VERSION, isProfile));

  const saveProfile = useCallback((next: Profile) => {
    setProfile(next);
    writeValue(KEY, VERSION, next);
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(null);
    removeValue(KEY);
  }, []);

  const value = useMemo(
    () => ({ profile, saveProfile, clearProfile }),
    [profile, saveProfile, clearProfile],
  );
  return <ProfileContext value={value}>{children}</ProfileContext>;
}

export function useProfile(): ProfileContextValue {
  const ctx = use(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}
