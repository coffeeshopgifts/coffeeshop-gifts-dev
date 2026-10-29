export const LOCALES = ['en-US', 'ar-SA'] as const;

export type LocaleId = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: LocaleId = 'en-US';

export const LOCALE_STORAGE_KEY = 'waivio_starter_locale';
