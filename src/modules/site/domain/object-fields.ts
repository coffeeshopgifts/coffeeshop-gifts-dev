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
    children.push({
      object_id: rec.object_id,
      object_type: typeof rec.object_type === 'string' ? rec.object_type : 'list',
      name: objectName(rec.object_id, nested),
      title: objectTitle(nested),
      description: objectDescription(nested),
      image: objectImage(nested),
    });
  }
  return children;
}
