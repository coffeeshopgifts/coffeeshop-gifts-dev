export function asRecord(value: unknown): Record<string, unknown> | null {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

export function stringField(fields: Record<string, unknown>, key: string): string | null {
  const value = fields[key];
  return typeof value === 'string' && value.trim() ? value : null;
}

export function objectName(objectId: string, fields: Record<string, unknown>): string {
  return stringField(fields, 'name') ?? objectId;
}

export function objectTitle(fields: Record<string, unknown>): string | null {
  return stringField(fields, 'title');
}

export function objectDescription(fields: Record<string, unknown>): string | null {
  return stringField(fields, 'description');
}

export function objectImage(fields: Record<string, unknown>): string | null {
  return stringField(fields, 'image');
}

export type ListChild = {
  object_id: string;
  object_type: string;
  name: string;
  title: string | null;
  description: string | null;
  image: string | null;
  listItemsCount: number | null;
};

export function listChildren(fields: Record<string, unknown>): ListChild[] {
  const raw = fields.listItem;
  if (!Array.isArray(raw)) {
    return [];
  }
  const children: ListChild[] = [];
  for (const item of raw) {
    const rec = asRecord(item);
    if (!rec || typeof rec.object_id !== 'string') {
      continue;
    }
    const nested = asRecord(rec.fields) ?? {};
    const count = rec.listItemsCount;
    children.push({
      object_id: rec.object_id,
      object_type: typeof rec.object_type === 'string' ? rec.object_type : 'list',
      name: objectName(rec.object_id, nested),
      title: objectTitle(nested),
      description: objectDescription(nested),
      image: objectImage(nested),
      listItemsCount: typeof count === 'number' ? count : null,
    });
  }
  const sort = asRecord(fields.sortCustom);
  const include = sort && Array.isArray(sort.include) ? sort.include.filter((id): id is string => typeof id === 'string') : [];
  if (include.length === 0) {
    return children;
  }
  const byId = new Map(children.map((child) => [child.object_id, child]));
  const ordered: ListChild[] = [];
  for (const id of include) {
    const child = byId.get(id);
    if (child) {
      ordered.push(child);
      byId.delete(id);
    }
  }
  for (const child of children) {
    if (byId.has(child.object_id)) {
      ordered.push(child);
    }
  }
  return ordered;
}

export function pageContentHtml(fields: Record<string, unknown>): string | null {
  return stringField(fields, 'pageContent');
}
