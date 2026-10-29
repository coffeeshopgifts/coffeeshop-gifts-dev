'use client';

import { KeychainConnect } from '@/modules/wallet';
import { useI18n } from '@/i18n';

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-display text-fg">{t('home.title')}</h1>
        <p className="mt-2 text-body text-fg-secondary">{t('home.subtitle')}</p>
        <p className="mt-4 text-body text-fg">{t('home.getStarted')}</p>
      </header>
      <KeychainConnect />
      <section className="rounded-card border border-border bg-surface p-card-padding text-body-sm text-fg-secondary">
        <p>
          This starter uses <code className="text-fg">output: &quot;export&quot;</code> — no server
          actions, API routes, middleware, or SSR data fetching. All query-api calls run in the
          browser; broadcasts go through Hive Keychain.
        </p>
      </section>
    </div>
  );
}
