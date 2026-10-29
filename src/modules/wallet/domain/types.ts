import type { HiveOperation } from '../hive-broadcast';

export type BroadcastTransactionResult = {
  transactionId: string;
};

export type HiveSignerPort = {
  sign(payload: { operations: readonly HiveOperation[] }): Promise<BroadcastTransactionResult>;
};
