import { z } from 'zod';

export const projectedObjectSchema = z.object({
  object_id: z.string(),
  object_type: z.string(),
  semantic_type: z.string().nullable().optional(),
  weight: z.number().nullable().optional(),
  fields: z.record(z.string(), z.unknown()),
  hasAdministrativeAuthority: z.boolean().optional().default(false),
  hasOwnershipAuthority: z.boolean().optional().default(false),
});

export type ProjectedObject = z.infer<typeof projectedObjectSchema>;

export const projectedObjectWithCountsSchema = projectedObjectSchema.extend({
  followers_count: z.number().int().optional(),
  posts_count: z.number().int().optional(),
  updates_count: z.number().int().optional(),
  is_following: z.boolean().optional(),
  viewer_bell: z.boolean().optional(),
});

export type ProjectedObjectWithCounts = z.infer<typeof projectedObjectWithCountsSchema>;

export const paginatedProjectedObjectsSchema = z.object({
  items: z.array(projectedObjectWithCountsSchema),
  cursor: z.string().nullable(),
  hasMore: z.boolean(),
});

export type PaginatedProjectedObjects = z.infer<typeof paginatedProjectedObjectsSchema>;
