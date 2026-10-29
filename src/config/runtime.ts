export function getQueryApiUrl(): string {
  return process.env.NEXT_PUBLIC_QUERY_API_URL ?? 'http://localhost:7000';
}

export function getQueryApiVersion(): string {
  return process.env.NEXT_PUBLIC_QUERY_API_VERSION ?? '1';
}

export function getOdlNetworkId(): string {
  return process.env.NEXT_PUBLIC_ODL_NETWORK ?? 'odl-mainnet';
}

export function getHiveCustomJsonId(): string {
  return process.env.NEXT_PUBLIC_HIVE_CUSTOM_JSON_ID ?? getOdlNetworkId();
}

export function getBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? '';
}
