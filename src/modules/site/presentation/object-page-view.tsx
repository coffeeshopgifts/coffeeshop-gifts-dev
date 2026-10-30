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
  pageContentHtml,
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
  const html = pageContentHtml(fields);
  const heading = title || name;
  const type = data.object_type;
  const isList = type === 'list' || children.length > 0;

  return (
    <article className="object-page">
      <h1 className="object-title">{heading}</h1>
      {description ? <p className="object-description">{description}</p> : null}
      {html ? <div className="object-html" dangerouslySetInnerHTML={{ __html: html }} /> : null}
      {!isList && image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="object-hero" />
      ) : null}
      {children.length > 0 ? (
        <ul className="checklist">
          {children.map((child) => {
            const label =
              child.listItemsCount != null ? `${child.name}(${child.listItemsCount})` : child.name;
            return (
              <li key={child.object_id} className="checklist-item">
                <Link href={`/object/${child.object_id}`} suppressHydrationWarning>
                  {child.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={child.image} alt={label} />
                  ) : (
                    <span className="checklist-placeholder" />
                  )}
                  <span className="checklist-name">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
      {newsfeed || type === 'newsfeed' ? (
        <p className="text-body text-fg-secondary">Posts for this newsfeed load next.</p>
      ) : null}
    </article>
  );
}
