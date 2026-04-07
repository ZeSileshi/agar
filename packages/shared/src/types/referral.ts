export type ReferralStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface Referral {
  id: string;
  referrerId: string;       // Person making the referral
  referredForId: string;    // Person being referred FOR (the "client")
  candidateId: string;      // Person being recommended
  status: ReferralStatus;
  message?: string;         // Why the referrer thinks they're a good match
  compatibilityScore?: number;
  createdAt: string;
  respondedAt?: string;
  expiresAt: string;
}

export interface ReferralInvite {
  id: string;
  referrerId: string;
  inviteePhone?: string;
  inviteeEmail?: string;
  referredForId: string;
  message?: string;
  createdAt: string;
  acceptedAt?: string;
  isRegistered: boolean;
}

export interface ReferralStats {
  userId: string;
  totalReferralsMade: number;
  totalReferralsReceived: number;
  successfulMatches: number;
  pendingReferrals: number;
}
