import { api } from '@/services/api/apiClient';

// ── Types ───────────────────────────────────────────────────────────────────
// Mirrors GET /referrals (Drovery_Backend WalletController.getReferrals →
// ReferralsResponseDto). Dates are serialized as ISO strings over the wire.

export type ReferralStatus = 'PENDING' | 'REWARDED';

export interface ReferralRewardPerReferral {
  /** Credits minted to the referrer when a referee completes their first delivery. */
  referrer: number;
  /** Credits minted to the referee when they complete their first delivery. */
  referee: number;
  currency: string;
}

export interface ReferralStats {
  total: number;
  pending: number;
  rewarded: number;
}

export interface ReferralItem {
  id: string;
  refereeName: string | null;
  status: ReferralStatus;
  rewardedAt: string | null;
  createdAt: string;
}

export interface Referrals {
  /** The user's unique referral code to share with others. */
  referralCode: string;
  rewardPerReferral: ReferralRewardPerReferral;
  stats: ReferralStats;
  referrals: ReferralItem[];
}

export const referralApi = {
  getReferrals() {
    return api.get<Referrals>('/referrals');
  },
};
