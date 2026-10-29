'use client';

type KeychainSignBufferResult = string | { signature?: string; sig?: string };

type KeychainResponse = {
  success: boolean;
  error?: string;
  result?: KeychainSignBufferResult;
};

export type KeychainBroadcastResponse = {
  success: boolean;
  error?: string;
  result?: unknown;
};

export type KeychainWireOperation = readonly [string, Record<string, unknown>];

export type HiveKeychainWindow = Window & {
  hive_keychain?: {
    requestSignBuffer: (
      username: string,
      message: string,
      keyType: string,
      callback: (response: KeychainResponse) => void,
    ) => void;
    requestBroadcast: (
      account: string,
      operations: KeychainWireOperation[],
      key: 'Posting' | 'Active' | 'Memo',
      callback: (response: KeychainBroadcastResponse) => void,
      rpc?: string | null,
    ) => void;
  };
};

function extractSignatureFromResult(result: unknown): string | null {
  if (typeof result === 'string' && result.trim().length > 0) {
    return result.trim();
  }
  if (result && typeof result === 'object') {
    const o = result as Record<string, unknown>;
    const sig = o.signature ?? o.sig;
    if (typeof sig === 'string' && sig.trim().length > 0) {
      return sig.trim();
    }
  }
  return null;
}

export async function signBufferWithKeychain(
  username: string,
  message: string,
): Promise<{ signature: string; signedMessage: string }> {
  const win = window as HiveKeychainWindow;
  const kc = win.hive_keychain;
  if (!kc?.requestSignBuffer) {
    throw new Error('Hive Keychain extension not found');
  }
  return new Promise((resolve, reject) => {
    kc.requestSignBuffer(username, message, 'Posting', (response) => {
      const signature = extractSignatureFromResult(response.result);
      if (!response.success || !signature) {
        reject(new Error(response.error ?? 'Sign failed'));
        return;
      }
      resolve({ signature, signedMessage: message });
    });
  });
}

export function buildKeychainConnectMessage(username: string): string {
  return `waivio-pages-starter:connect:${username}:${Date.now()}`;
}

export async function connectAccountWithKeychain(username: string): Promise<void> {
  const trimmed = username.trim().replace(/^@/, '');
  if (!trimmed) {
    throw new Error('Username is required');
  }
  await signBufferWithKeychain(trimmed, buildKeychainConnectMessage(trimmed));
}

export function isKeychainAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const kc = (window as HiveKeychainWindow).hive_keychain;
  return Boolean(kc?.requestSignBuffer && kc?.requestBroadcast);
}

const KEYCHAIN_POLL_MS = 200;
const KEYCHAIN_POLL_TIMEOUT_MS = 5000;

/** Re-check after mount: extension injects `hive_keychain` after DOM/SSR hydration. */
export function subscribeToKeychainAvailability(
  onChange: (available: boolean) => void,
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let cancelled = false;

  const check = () => {
    if (!cancelled) {
      onChange(isKeychainAvailable());
    }
  };

  check();

  const intervalId = window.setInterval(() => {
    if (isKeychainAvailable()) {
      window.clearInterval(intervalId);
      check();
    }
  }, KEYCHAIN_POLL_MS);

  const onLoad = () => check();
  window.addEventListener('load', onLoad);

  const timeoutId = window.setTimeout(() => {
    window.clearInterval(intervalId);
    check();
  }, KEYCHAIN_POLL_TIMEOUT_MS);

  return () => {
    cancelled = true;
    window.clearInterval(intervalId);
    window.clearTimeout(timeoutId);
    window.removeEventListener('load', onLoad);
  };
}
