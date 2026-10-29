'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { fetchUserProfile, type UserProfile } from '@/modules/query-api';
import { isOk } from '@/shared/domain/result';
import { KeychainConnect } from '@/modules/wallet';

type Props = {
  name: string;
};

export function ProfilePageView({ name }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setProfile(null);
    setError(null);
    void fetchUserProfile(name, controller.signal).then((result) => {
      if (controller.signal.aborted) {
        return;
      }
      if (!isOk(result)) {
        setError('Could not load this profile.');
        return;
      }
      setProfile(result.value);
    });
    return () => controller.abort();
  }, [name]);

  return (
    <div className="space-y-6">
      {error ? <p className="text-body text-error">{error}</p> : null}
      {!error && !profile ? <p className="text-body text-fg-secondary">Loading…</p> : null}
      {profile ? (
        <header className="space-y-2">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="" className="h-20 w-20 rounded-full border border-border" />
          ) : null}
          <h1 className="text-display text-fg">{profile.displayName || profile.name}</h1>
          <p className="text-body-sm text-fg-secondary">
            <Link href={`/@${profile.name}`} suppressHydrationWarning>
              @{profile.name}
            </Link>
          </p>
          {profile.bio ? <p className="whitespace-pre-wrap text-body text-fg">{profile.bio}</p> : null}
        </header>
      ) : null}
      <KeychainConnect />
    </div>
  );
}
