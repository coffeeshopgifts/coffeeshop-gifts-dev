import {
  discoverObjectsResponseSchema,
  discoverUsersResponseSchema,
  searchCountsResponseSchema,
  searchResponseSchema,
  type DiscoverObjectsResponse,
  type DiscoverUsersResponse,
  type SearchCountsResponse,
  type SearchResponse,
} from '../../domain/api-responses.schema';
import { queryApiFetch } from '../../infrastructure/query-api.client';

export type SearchParams = {
  q: string;
  limit?: number;
  type?: 'all' | 'objects' | 'users';
  signal?: AbortSignal;
};

export async function fetchSearch(params: SearchParams) {
  return queryApiFetch<SearchResponse>('/search', searchResponseSchema, {
    query: {
      q: params.q,
      limit: params.limit ?? 10,
      type: params.type ?? 'all',
    },
    signal: params.signal,
  });
}

export async function fetchSearchCounts(q: string, signal?: AbortSignal) {
  return queryApiFetch<SearchCountsResponse>('/search/counts', searchCountsResponseSchema, {
    query: { q },
    signal,
  });
}

export type DiscoverObjectsParams = {
  object_type?: string;
  q?: string;
  tags?: string[];
  sort?: 'newest' | 'oldest' | 'rank';
  cursor?: string;
  limit?: number;
  signal?: AbortSignal;
};

export async function fetchDiscoverObjects(params: DiscoverObjectsParams) {
  return queryApiFetch<DiscoverObjectsResponse>(
    '/discover/objects',
    discoverObjectsResponseSchema,
    {
      query: {
        object_type: params.object_type,
        q: params.q,
        tags: params.tags?.join(','),
        sort: params.sort ?? 'newest',
        cursor: params.cursor,
        limit: params.limit ?? 20,
      },
      signal: params.signal,
    },
  );
}

export type DiscoverUsersParams = {
  q?: string;
  cursor?: string;
  limit?: number;
  signal?: AbortSignal;
};

export async function fetchDiscoverUsers(params: DiscoverUsersParams) {
  return queryApiFetch<DiscoverUsersResponse>('/discover/users', discoverUsersResponseSchema, {
    query: {
      q: params.q,
      cursor: params.cursor,
      limit: params.limit ?? 20,
    },
    signal: params.signal,
  });
}
