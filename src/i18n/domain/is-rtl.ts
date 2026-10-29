import type { LocaleId } from '../config/locales';

const RTL_LOCALES = new Set<LocaleId>(['ar-SA']);

export function isRtl(locale: LocaleId): boolean {
  return RTL_LOCALES.has(locale);
}
