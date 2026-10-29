import type { LocaleId } from '../config/locales';
import { DEFAULT_LOCALE, LOCALES, LOCALE_STORAGE_KEY } from '../config/locales';
import type { Messages } from '../types';

import enUS from '../locales/en-US.json';
import arSA from '../locales/ar-SA.json';

const CATALOGS: Record<LocaleId, Messages> = {
  'en-US': enUS,
  'ar-SA': arSA,
};

export function resolveClientLocale(): LocaleId {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && (LOCALES as readonly string[]).includes(stored)) {
    return stored as LocaleId;
  }
  const nav = navigator.language;
  if (nav.startsWith('ar')) {
    return 'ar-SA';
  }
  return DEFAULT_LOCALE;
}

export function loadMessages(locale: LocaleId): Messages {
  return CATALOGS[locale] ?? CATALOGS[DEFAULT_LOCALE];
}

export function persistLocale(locale: LocaleId): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }
}
