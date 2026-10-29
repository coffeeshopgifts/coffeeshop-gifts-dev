'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_LOCALE,
  I18nProvider,
  loadMessages,
  persistLocale,
  resolveClientLocale,
  type LocaleId,
  LOCALES,
} from '@/i18n';
import { WalletProvider } from '@/modules/wallet';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<LocaleId>(() => {
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

  const switchLocale = (next: LocaleId) => {
    persistLocale(next);
    setLocale(next);
  };

  return (
    <I18nProvider locale={locale} messages={messages}>
      <WalletProvider>
        <LocaleSwitcher current={locale} onChange={switchLocale} />
        {children}
      </WalletProvider>
    </I18nProvider>
  );
}

function LocaleSwitcher({
  current,
  onChange,
}: {
  current: LocaleId;
  onChange: (locale: LocaleId) => void;
}) {
  return (
    <div className="fixed end-3 top-3 z-50 flex gap-2">
      {LOCALES.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`rounded-btn border border-border px-2 py-1 text-body-sm ${
            current === id ? 'bg-accent text-accent-fg' : 'bg-surface text-fg'
          }`}
        >
          {id === 'en-US' ? 'EN' : 'AR'}
        </button>
      ))}
    </div>
  );
}
