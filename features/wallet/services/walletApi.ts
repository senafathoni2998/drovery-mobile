import { api } from '@/services/api/apiClient';

// ── Types ───────────────────────────────────────────────────────────────────
// Mirrors WalletResponseDto / WalletTransactionDto on the backend
// (src/wallet/dto/wallet-response.dto.ts).

export type WalletTxnType = 'CREDIT' | 'DEBIT';

export type WalletTxnReason =
  | 'REFERRAL_REWARD'
  | 'REFEREE_REWARD'
  | 'CHECKOUT_SPEND'
  | 'CHECKOUT_REFUND';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: WalletTxnType;
  reason: WalletTxnReason;
  /** Positive magnitude; sign carried by `type`. */
  amount: number;
  /** Running balance snapshot after this transaction was applied. */
  balanceAfter: number;
  /** Delivery that triggered this transaction (provenance only). */
  deliveryId: string | null;
  /** Referral that triggered this transaction (provenance only). */
  referralId: string | null;
  createdAt: string;
}

export interface Wallet {
  /** Current credit balance in the given currency. */
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const walletApi = {
  getWallet(page = 1, limit = 20) {
    const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
    return api.get<Wallet>(`/wallet?${qs.toString()}`);
  },
};
