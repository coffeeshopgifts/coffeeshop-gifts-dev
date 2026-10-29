import { z } from 'zod';

import { projectedObjectWithCountsSchema } from './projected-object.schema';

export const searchObjectResultSchema = z.object({
  object_id: z.string(),
  object_type: z.string(),
  name: z.string().nullable(),
  image_url: z.string().nullable(),
  parent_name: z.string().nullable(),
});

export const searchUserResultSchema = z.object({
  name: z.string(),
  profile_image: z.string().nullable(),
  reputation: z.number(),
  followers_count: z.number().int(),
  is_following: z.boolean(),
});

export const searchResponseSchema = z.object({
  objects: z.array(searchObjectResultSchema),
  users: z.array(searchUserResultSchema),
});

export type SearchResponse = z.infer<typeof searchResponseSchema>;

export const searchCountsResponseSchema = z.object({
  type_counts: z.record(z.string(), z.number().int()),
  total_users: z.number().int(),
});

export type SearchCountsResponse = z.infer<typeof searchCountsResponseSchema>;

export const discoverObjectsResponseSchema = z.object({
  items: z.array(projectedObjectWithCountsSchema),
  cursor: z.string().nullable(),
  hasMore: z.boolean(),
});

export type DiscoverObjectsResponse = z.infer<typeof discoverObjectsResponseSchema>;

export const discoverUsersResponseSchema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      displayName: z.string(),
      avatarUrl: z.string().nullable(),
      reputation: z.number().int(),
      followerCount: z.number().int(),
      is_following: z.boolean(),
    }),
  ),
  cursor: z.string().nullable(),
  hasMore: z.boolean(),
});

export type DiscoverUsersResponse = z.infer<typeof discoverUsersResponseSchema>;

export const userProfileSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  bio: z.string(),
  avatarUrl: z.string().nullable(),
  coverImageUrl: z.string().nullable(),
  followerCount: z.number().int(),
  followingCount: z.number().int(),
  postingCount: z.number().int(),
  reputation: z.number().int(),
  is_following: z.boolean(),
  viewer_bell: z.boolean(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

export const resolveObjectBodySchema = z.object({
  object_id: z.string().min(1),
  update_types: z.array(z.string()).optional(),
  include_rejected: z.boolean().optional(),
});

export const resolveObjectResponseSchema = projectedObjectWithCountsSchema;

export const currencyMarketResponseSchema = z.object({
  current: z.record(z.string(), z.unknown()),
  weekly: z.record(z.string(), z.unknown()),
});

export type CurrencyMarketResponse = z.infer<typeof currencyMarketResponseSchema>;

export const waivWalletResponseSchema = z.object({
  account: z.string(),
  balance: z.string(),
  display: z.record(z.string(), z.unknown()).optional(),
});

export type WaivWalletResponse = z.infer<typeof waivWalletResponseSchema>;

export const hiveWalletResponseSchema = z.object({
  account: z.string(),
  balance: z.record(z.string(), z.unknown()).optional(),
  display: z.record(z.string(), z.unknown()).optional(),
});

export type HiveWalletResponse = z.infer<typeof hiveWalletResponseSchema>;

export const singlePostSchema = z.object({
  authorName: z.string(),
  permlink: z.string(),
  title: z.string().optional(),
  body: z.string().optional(),
  createdAt: z.string().optional(),
});

export type SinglePost = z.infer<typeof singlePostSchema>;

export const resolveNestedResponseSchema = z.object({
  items: z.array(projectedObjectWithCountsSchema),
});

export type ResolveNestedResponse = z.infer<typeof resolveNestedResponseSchema>;

export const paginatedUserFollowListSchema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      displayName: z.string().optional(),
      avatarUrl: z.string().nullable().optional(),
      reputation: z.number().optional(),
      is_following: z.boolean().optional(),
    }),
  ),
  cursor: z.string().nullable().optional(),
  hasMore: z.boolean().optional(),
});

export type PaginatedUserFollowList = z.infer<typeof paginatedUserFollowListSchema>;
