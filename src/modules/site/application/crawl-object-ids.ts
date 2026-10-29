import { getQueryApiUrl, getQueryApiVersion } from '@/config/runtime';
import { CRAWL_SEED_IDS } from '@/config/site';

import { asRecord, listChildren } from '../domain/object-fields';

const MAX_IDS = 2500;

export async function crawlObjectIds(): Promise<string[]> {
  const base = getQueryApiUrl().replace(/\/$/, '');
  const version = getQueryApiVersion();
  const endpoint = `${base}/query/v${version}/objects/resolve`;
  const seen = new Set<string>(CRAWL_SEED_IDS);
  const queue: string[] = [...CRAWL_SEED_IDS];

  while (queue.length > 0 && seen.size < MAX_IDS) {
    const objectId = queue.shift();
    if (!objectId) {
      break;
    }
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ object_id: objectId, update_types: ['listItem'] }),
      });
      if (!response.ok) {
        continue;
      }
      const json: unknown = await response.json();
      const rec = asRecord(json);
      const fields = rec ? asRecord(rec.fields) : null;
      if (!fields) {
        continue;
      }
      for (const child of listChildren(fields)) {
        if (!seen.has(child.object_id) && seen.size < MAX_IDS) {
          seen.add(child.object_id);
          queue.push(child.object_id);
        }
      }
    } catch {
      continue;
    }
  }

  return [...seen];
}
