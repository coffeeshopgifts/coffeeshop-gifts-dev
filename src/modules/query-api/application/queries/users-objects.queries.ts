import {
  paginatedUserFollowListSchema,
  resolveNestedResponseSchema,
  resolveObjectResponseSchema,
  userProfileSchema,
  type UserProfile,
} from '../../domain/api-responses.schema';
import { queryApiFetch } from '../../infrastructure/query-api.client';

export async function fetchUserProfile(name: string, signal?: AbortSignal) {
  const encoded = encodeURIComponent(name);
  return queryApiFetch<UserProfile>(`/users/${encoded}/profile`, userProfileSchema, {
    signal,
  });
}

export async function resolveObject(
  body: { object_id: string; update_types?: string[]; include_rejected?: boolean },
  signal?: AbortSignal,
) {
  return queryApiFetch(`/objects/resolve`, resolveObjectResponseSchema, {
    method: 'POST',
    body,
    signal,
  });
}

export async function resolveObjectsNested(
  body: { ids: string[]; update_types?: string[] },
  signal?: AbortSignal,
) {
  return queryApiFetch('/objects/resolve-nested', resolveNestedResponseSchema, {
    method: 'POST',
    body,
    signal,
  });
}

export async function fetchObjectFollowers(
  objectId: string,
  query: { skip?: number; limit?: number } = {},
  signal?: AbortSignal,
) {
  const encoded = encodeURIComponent(objectId);
  return queryApiFetch(`/objects/${encoded}/followers`, paginatedUserFollowListSchema, {
    query: {
      skip: query.skip ?? 0,
      limit: query.limit ?? 20,
    },
    signal,
  });
}
