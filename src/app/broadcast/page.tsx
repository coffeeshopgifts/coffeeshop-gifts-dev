'use client';

import { useCallback, useState } from 'react';
import { z } from 'zod';

import { getHiveCustomJsonId } from '@/config/runtime';
import { useI18n } from '@/i18n';
import {
  buildOdlObjectFollowOp,
  buildTransferOp,
  buildVoteOp,
  useWallet,
  type HiveOperation,
} from '@/modules/wallet';
import { fail, ok, type Result } from '@/shared/domain/result';

const voteSchema = z.object({
  author: z.string().min(1),
  permlink: z.string().min(1),
  weight: z.coerce.number().int().min(1).max(10000),
});

const transferSchema = z.object({
  to: z.string().min(3),
  amount: z.string().regex(/^\d+(\.\d{1,3})?\s+HIVE$/i, 'Use format: 0.001 HIVE'),
  memo: z.string().max(256),
});

const followSchema = z.object({
  objectId: z.string().min(3),
});

export default function BroadcastPage() {
  const { t } = useI18n();
  const { username, broadcast } = useWallet();
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [voteForm, setVoteForm] = useState({ author: '', permlink: '', weight: '10000' });
  const [transferForm, setTransferForm] = useState({ to: '', amount: '0.001 HIVE', memo: '' });
  const [followObjectId, setFollowObjectId] = useState('');

  const runBroadcast = useCallback(
    async (build: () => Result<HiveOperation, string>) => {
      if (!username) {
        setError(t('broadcast.needConnect'));
        return;
      }
      setPending(true);
      setError(null);
      setTxId(null);
      const built = build();
      if (!built.ok) {
        setPending(false);
        setError(built.error);
        return;
      }
      try {
        const result = await broadcast([built.value]);
        setTxId(result.transactionId);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('broadcast.error'));
      } finally {
        setPending(false);
      }
    },
    [broadcast, t, username],
  );

  return (
    <div className="space-y-8">
      <h1 className="text-section text-fg">{t('broadcast.title')}</h1>
      {!username ? (
        <p className="text-body-sm text-error" role="alert">
          {t('broadcast.needConnect')}
        </p>
      ) : null}

      <section className="space-y-3 rounded-card border border-border bg-surface p-card-padding">
        <h2 className="text-body font-semibold">{t('broadcast.vote')}</h2>
        <div className="grid gap-2 md:grid-cols-3">
          <input
            placeholder={t('broadcast.author')}
            value={voteForm.author}
            onChange={(e) => setVoteForm((f) => ({ ...f, author: e.target.value }))}
            className="rounded-btn border border-border bg-surface-control px-3 py-2 text-body-sm"
          />
          <input
            placeholder={t('broadcast.permlink')}
            value={voteForm.permlink}
            onChange={(e) => setVoteForm((f) => ({ ...f, permlink: e.target.value }))}
            className="rounded-btn border border-border bg-surface-control px-3 py-2 text-body-sm"
          />
          <input
            placeholder={t('broadcast.weight')}
            value={voteForm.weight}
            onChange={(e) => setVoteForm((f) => ({ ...f, weight: e.target.value }))}
            className="rounded-btn border border-border bg-surface-control px-3 py-2 text-body-sm"
          />
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            void runBroadcast(() => {
              const parsed = voteSchema.safeParse({
                ...voteForm,
                weight: Number(voteForm.weight),
              });
              if (!parsed.success) {
                return fail(parsed.error.issues[0]?.message ?? 'Invalid vote');
              }
              if (!username) {
                return fail(t('broadcast.needConnect'));
              }
              return ok(
                buildVoteOp(
                  username,
                  parsed.data.author,
                  parsed.data.permlink,
                  parsed.data.weight,
                ),
              );
            })
          }
          className="rounded-btn bg-accent px-4 py-2 text-body-sm text-accent-fg disabled:opacity-50"
        >
          {t('broadcast.submit')}
        </button>
      </section>

      <section className="space-y-3 rounded-card border border-border bg-surface p-card-padding">
        <h2 className="text-body font-semibold">{t('broadcast.transfer')}</h2>
        <div className="grid gap-2 md:grid-cols-3">
          <input
            placeholder={t('broadcast.to')}
            value={transferForm.to}
            onChange={(e) => setTransferForm((f) => ({ ...f, to: e.target.value }))}
            className="rounded-btn border border-border bg-surface-control px-3 py-2 text-body-sm"
          />
          <input
            placeholder={t('broadcast.amount')}
            value={transferForm.amount}
            onChange={(e) => setTransferForm((f) => ({ ...f, amount: e.target.value }))}
            className="rounded-btn border border-border bg-surface-control px-3 py-2 text-body-sm"
          />
          <input
            placeholder={t('broadcast.memo')}
            value={transferForm.memo}
            onChange={(e) => setTransferForm((f) => ({ ...f, memo: e.target.value }))}
            className="rounded-btn border border-border bg-surface-control px-3 py-2 text-body-sm"
          />
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            void runBroadcast(() => {
              const parsed = transferSchema.safeParse(transferForm);
              if (!parsed.success) {
                return fail(parsed.error.issues[0]?.message ?? 'Invalid transfer');
              }
              if (!username) {
                return fail(t('broadcast.needConnect'));
              }
              return ok(
                buildTransferOp({
                  from: username,
                  to: parsed.data.to.replace(/^@/, ''),
                  amount: parsed.data.amount.toUpperCase(),
                  memo: parsed.data.memo,
                }),
              );
            })
          }
          className="rounded-btn bg-accent px-4 py-2 text-body-sm text-accent-fg disabled:opacity-50"
        >
          {t('broadcast.submit')}
        </button>
      </section>

      <section className="space-y-3 rounded-card border border-border bg-surface p-card-padding">
        <h2 className="text-body font-semibold">{t('broadcast.odlFollow')}</h2>
        <input
          placeholder={t('broadcast.objectId')}
          value={followObjectId}
          onChange={(e) => setFollowObjectId(e.target.value)}
          className="w-full rounded-btn border border-border bg-surface-control px-3 py-2 text-body-sm"
        />
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            void runBroadcast(() => {
              const parsed = followSchema.safeParse({ objectId: followObjectId });
              if (!parsed.success) {
                return fail(parsed.error.issues[0]?.message ?? 'Invalid object id');
              }
              if (!username) {
                return fail(t('broadcast.needConnect'));
              }
              return ok(
                buildOdlObjectFollowOp({
                  id: getHiveCustomJsonId(),
                  objectId: parsed.data.objectId,
                  method: 'follow',
                  required_posting_auths: [username],
                }),
              );
            })
          }
          className="rounded-btn bg-accent px-4 py-2 text-body-sm text-accent-fg disabled:opacity-50"
        >
          {t('broadcast.submit')}
        </button>
      </section>

      {txId ? (
        <p className="text-body-sm text-fg">
          {t('broadcast.success')}: <code>{txId}</code>
        </p>
      ) : null}
      {error ? (
        <p className="text-body-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
