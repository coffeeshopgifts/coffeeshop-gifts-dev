'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { isOk } from '@/shared/domain/result';
import { resolveObject, type ProjectedObjectWithCounts } from '@/modules/query-api';

import {
  listChildren,
  objectDescription,
  objectImage,
  objectName,
  objectTitle,
} from '../domain/object-fields';

type Props = {
  objectId: string;
  newsfeed?: boolean;
};

export function ObjectPageView({ objectId, newsfeed = false }: Props) {
  const [data, setData] = useState<ProjectedObjectWithCounts | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError(null);
    void resolveObject({ object_id: objectId }, controller.signal).then((result) => {
      if (controller.signal.aborted) {
        return;
      }
      if (!isOk(result)) {
        setError('Could not load this object.');
        return;
      }
      setData(result.value);
    });
    return () => controller.abort();
  }, [objectId]);

  if (error) {
    return <p className="text-body text-error">{error}</p>;
  }
  if (!data) {
    return <p className="text-body text-fg-secondary">Loading…</p>;
  }

  const fields = data.fields;
  const name = objectName(data.object_id, fields);
  const title = objectTitle(fields);
  const description = objectDescription(fields);
  const image = objectImage(fields);
  const children = listChildren(fields);
  const type = data.object_type;

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="max-h-48 w-auto rounded-card border border-border" />
        ) : null}
        <p className="text-body-sm text-fg-secondary">{type}</p>
        <h1 className="text-display text-fg">{name}</h1>
        {title ? <p className="text-section text-fg-secondary">{title}</p> : null}
      </header>
      {description ? (
        <p className="whitespace-pre-wrap text-body text-fg">{description}</p>
      ) : null}
      {newsfeed || type === 'newsfeed' ? (
        <p className="text-body text-fg-secondary">Newsfeed for this object loads from the chain. Posts UI is next.</p>
      ) : null}
      {type === 'map' ? (
        <p className="text-body text-fg-secondary">Map view comes next. This object is type map.</p>
      ) : null}
      {children.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {children.map((child) => (
            <li key={child.object_id}>
              <Link
                href={`/object/${child.object_id}`}
                suppressHydrationWarning
                className="block rounded-card border border-border bg-surface p-card-padding hover:border-accent"
              >
                {child.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={child.image} alt="" className="mb-3 max-h-32 w-full object-cover" />
                ) : null}
                <h2 className="text-section text-fg">{child.name}</h2>
                {child.title ? <p className="mt-1 text-body-sm text-fg-secondary">{child.title}</p> : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
