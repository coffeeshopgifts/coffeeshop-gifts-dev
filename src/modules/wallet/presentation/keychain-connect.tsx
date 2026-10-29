'use client';

import { useCallback, useState, type FormEvent } from 'react';

import { useI18n } from '@/i18n';

import { useWallet } from './wallet-provider';

export function KeychainConnect() {
  const { t } = useI18n();
  const { username, keychainAvailable, connect, disconnect } = useWallet();
  const [input, setInput] = useState(username ?? '');
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setConnecting(true);
      try {
        await connect(input);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('wallet.connectError'));
      } finally {
        setConnecting(false);
      }
    },
    [connect, input, t],
  );

  if (username) {
    return (
      <div className="rounded-card border border-border bg-surface p-card-padding">
        <p className="text-body text-fg">
          {t('wallet.connectedAs')} <strong>@{username}</strong>
        </p>
        <button
          type="button"
          onClick={() => disconnect()}
          className="mt-3 rounded-btn bg-secondary px-4 py-2 text-body-sm text-secondary-fg"
        >
          {t('wallet.disconnect')}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-card border border-border bg-surface p-card-padding"
    >
      {!keychainAvailable ? (
        <p className="mb-3 text-body-sm text-error" role="alert">
          {t('wallet.keychainMissing')}
        </p>
      ) : null}
      <label className="block text-body-sm text-fg-secondary" htmlFor="hive-username">
        {t('wallet.usernameLabel')}
      </label>
      <input
        id="hive-username"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="@username"
        className="mt-1 w-full rounded-btn border border-border bg-surface-control px-3 py-2 text-body text-fg"
        autoComplete="username"
      />
      {error ? (
        <p className="mt-2 text-body-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={!keychainAvailable || connecting}
        className="mt-3 rounded-btn bg-accent px-4 py-2 text-body-sm text-accent-fg disabled:opacity-50"
      >
        {connecting ? t('wallet.connecting') : t('wallet.connect')}
      </button>
    </form>
  );
}
