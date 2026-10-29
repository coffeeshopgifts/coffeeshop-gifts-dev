import type { HiveOperation } from '../hive-broadcast';

const ACTIVE_KEY_OPERATION_TYPES = new Set([
  'transfer',
  'transfer_to_vesting',
  'withdraw_vesting',
  'delegate_vesting_shares',
  'transfer_to_savings',
  'transfer_from_savings',
  'cancel_transfer_from_savings',
]);

export function hiveOperationRequiresActiveKey(op: HiveOperation): boolean {
  if (op.type === 'custom_json') {
    return op.required_auths.length > 0;
  }
  return ACTIVE_KEY_OPERATION_TYPES.has(op.type);
}

export function hivePayloadRequiresActiveKey(
  operations: readonly HiveOperation[],
): boolean {
  return operations.some(hiveOperationRequiresActiveKey);
}

export type HiveKeychainBroadcastKey = 'Posting' | 'Active';

export function resolveKeychainBroadcastKey(
  operations: readonly HiveOperation[],
): HiveKeychainBroadcastKey {
  return hivePayloadRequiresActiveKey(operations) ? 'Active' : 'Posting';
}
