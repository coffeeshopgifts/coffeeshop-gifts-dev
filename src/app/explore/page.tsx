'use client';

import { useCallback, useState } from 'react';

import { useI18n } from '@/i18n';
import {
  fetchDiscoverObjects,
  fetchSearch,
  fetchUserProfile,
  type DiscoverObjectsResponse,
  type SearchResponse,
  type UserProfile,
} from '@/modules/query-api';
import { useInfiniteScroll } from '@/shared';
import { isOk } from '@/shared/domain/result';

export default function ExplorePage() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [discoverItems, setDiscoverItems] = useState<DiscoverObjectsResponse['items']>([]);
  const [discoverCursor, setDiscoverCursor] = useState<string | null>(null);
  const [discoverHasMore, setDiscoverHasMore] = useState(false);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(async () => {
    setError(null);
    const result = await fetchSearch({ q: query.trim() });
    if (!isOk(result)) {
      setError(t('explore.error'));
      return;
    }
    setSearchResult(result.value);
  }, [query, t]);

  const loadDiscover = useCallback(
    async (cursor?: string | null, replace = false) => {
      setDiscoverLoading(true);
      setError(null);
      const result = await fetchDiscoverObjects({
        q: query.trim() || undefined,
        cursor: cursor ?? undefined,
        limit: 12,
      });
      setDiscoverLoading(false);
      if (!isOk(result)) {
        setError(t('explore.error'));
        return;
      }
      const page = result.value;
      setDiscoverItems((prev) => (replace ? page.items : [...prev, ...page.items]));
      setDiscoverCursor(page.cursor);
      setDiscoverHasMore(page.hasMore);
    },
    [query, t],
  );

  const loadProfile = useCallback(async () => {
    setError(null);
    const name = profileName.trim().replace(/^@/, '');
    if (!name) {
      return;
    }
    const result = await fetchUserProfile(name);
    if (!isOk(result)) {
      setProfile(null);
      setError(t('explore.error'));
      return;
    }
    setProfile(result.value);
  }, [profileName, t]);

  const { sentinelRef } = useInfiniteScroll({
    hasMore: discoverHasMore,
    isLoading: discoverLoading,
    onLoadMore: () => {
      if (discoverCursor) {
        void loadDiscover(discoverCursor, false);
      }
    },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-section text-fg">{t('explore.title')}</h1>

      <section className="space-y-3 rounded-card border border-border bg-surface p-card-padding">
        <h2 className="text-body font-semibold text-fg">{t('explore.search')}</h2>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('explore.searchPlaceholder')}
            className="flex-1 rounded-btn border border-border bg-surface-control px-3 py-2 text-body"
          />
          <button
            type="button"
            onClick={() => void runSearch()}
            className="rounded-btn bg-accent px-4 py-2 text-body-sm text-accent-fg"
          >
            {t('explore.search')}
          </button>
        </div>
        {searchResult ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-body-sm font-semibold text-fg">Objects</h3>
              <ul className="mt-2 space-y-1 text-body-sm text-fg-secondary">
                {searchResult.objects.map((o) => (
                  <li key={o.object_id}>
                    {o.name ?? o.object_id} <span className="text-fg">({o.object_type})</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-body-sm font-semibold text-fg">Users</h3>
              <ul className="mt-2 space-y-1 text-body-sm text-fg-secondary">
                {searchResult.users.map((u) => (
                  <li key={u.name}>
                    @{u.name}
                    {u.is_following ? ' · following' : ''}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </section>

      <section className="space-y-3 rounded-card border border-border bg-surface p-card-padding">
        <h2 className="text-body font-semibold text-fg">{t('explore.discover')}</h2>
        <button
          type="button"
          onClick={() => void loadDiscover(null, true)}
          className="rounded-btn bg-secondary px-4 py-2 text-body-sm text-secondary-fg"
        >
          {t('explore.discover')}
        </button>
        <ul className="space-y-2">
          {discoverItems.map((item) => (
            <li
              key={item.object_id}
              className="rounded-btn border border-border px-3 py-2 text-body-sm text-fg"
            >
              <span className="font-medium">{String(item.fields.name ?? item.object_id)}</span>
              <span className="text-fg-secondary"> · {item.object_type}</span>
            </li>
          ))}
        </ul>
        <div ref={sentinelRef} aria-hidden className="h-1" />
      </section>

      <section className="space-y-3 rounded-card border border-border bg-surface p-card-padding">
        <h2 className="text-body font-semibold text-fg">{t('explore.profile')}</h2>
        <div className="flex gap-2">
          <input
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder={t('explore.profilePlaceholder')}
            className="flex-1 rounded-btn border border-border bg-surface-control px-3 py-2 text-body"
          />
          <button
            type="button"
            onClick={() => void loadProfile()}
            className="rounded-btn bg-accent px-4 py-2 text-body-sm text-accent-fg"
          >
            {t('explore.loadProfile')}
          </button>
        </div>
        {profile ? (
          <div className="text-body-sm text-fg">
            <p className="font-semibold">{profile.displayName}</p>
            <p className="text-fg-secondary">@{profile.name}</p>
            <p className="mt-2">{profile.bio || '—'}</p>
            <p className="mt-2 text-fg-secondary">
              {profile.followerCount} followers · {profile.followingCount} following · rep{' '}
              {profile.reputation}
              {profile.is_following ? ' · you follow' : ''}
            </p>
          </div>
        ) : null}
      </section>

      {error ? (
        <p className="text-body-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
