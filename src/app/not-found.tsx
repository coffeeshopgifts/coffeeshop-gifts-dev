'use client';

import { useEffect, useState } from 'react';

import { ObjectPageView, ProfilePageView } from '@/modules/site';

export default function NotFound() {
  const [path, setPath] = useState<string | null>(null);

  useEffect(() => {
    setPath(window.location.pathname);
  }, []);

  if (path === null) {
    return <p className="text-body text-fg-secondary">Loading…</p>;
  }

  const objectMatch = path.match(/^\/object\/([^/]+)(\/newsfeed)?\/?$/);
  if (objectMatch) {
    return <ObjectPageView objectId={decodeURIComponent(objectMatch[1])} newsfeed={Boolean(objectMatch[2])} />;
  }

  const profileMatch = path.match(/^\/@([^/]+)\/?$/);
  if (profileMatch) {
    return <ProfilePageView name={decodeURIComponent(profileMatch[1])} />;
  }

  return (
    <div className="space-y-2">
      <h1 className="text-display text-fg">Not found</h1>
      <p className="text-body text-fg-secondary">No page at {path}</p>
    </div>
  );
}
