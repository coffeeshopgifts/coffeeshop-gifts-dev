'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_LOCALE,
  I18nProvider,
  loadMessages,
  resolveClientLocale,
  type LocaleId,
} from '@/i18n';
import { WalletProvider } from '@/modules/wallet';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [locale] = useState<LocaleId>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_LOCALE;
    }
    return resolveClientLocale();
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar-SA' ? 'rtl' : 'ltr';
    document.documentElement.dataset.theme = 'light';
  }, [locale]);

  const messages = useMemo(() => loadMessages(locale), [locale]);

  return (
    <I18nProvider locale={locale} messages={messages}>
      <WalletProvider>{children}</WalletProvider>
    </I18nProvider>
  );
}
