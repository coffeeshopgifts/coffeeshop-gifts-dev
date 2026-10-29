'use client';

import type { HiveOperation } from '../hive-broadcast';
import type { BroadcastTransactionResult } from '../domain/types';
import { broadcastWithKeychain } from './keychain-signer';
import { connectAccountWithKeychain } from './keychain-provider';

const STORAGE_USERNAME_KEY = 'waivio_starter_keychain_username';

export class WalletFacade {
  private username: string | null = null;

  getUsername(): string | null {
    return this.username;
  }

  async connect(username: string): Promise<void> {
    const trimmed = username.trim().replace(/^@/, '');
    if (!trimmed) {
      throw new Error('Username is required');
    }
    await connectAccountWithKeychain(trimmed);
    this.username = trimmed;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_USERNAME_KEY, trimmed);
    }
  }

  disconnect(): void {
    this.username = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_USERNAME_KEY);
    }
  }

  hydrateFromStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = localStorage.getItem(STORAGE_USERNAME_KEY);
    if (stored) {
      this.username = stored;
    }
  }

  async broadcast(operations: readonly HiveOperation[]): Promise<BroadcastTransactionResult> {
    if (!this.username) {
      throw new Error('Connect Keychain first');
    }
    return broadcastWithKeychain({ operations });
  }
}

let facade: WalletFacade | null = null;

export function getWalletFacade(): WalletFacade {
  if (!facade) {
    facade = new WalletFacade();
  }
  return facade;
}

export { STORAGE_USERNAME_KEY };
