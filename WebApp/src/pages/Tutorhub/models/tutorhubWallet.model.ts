export type WalletTransactionType =
  | "top_up"
  | "lesson_payment"
  | "teacher_payout"
  | "platform_fee"
  | "tool_usage"
  | "refund";

export interface TutorhubWallet {
  uid: string;
  balance: number;
  currency: "credits";
  updatedAt: number;
}

export interface WalletTransaction {
  id: string;
  uid: string;
  amount: number;
  type: WalletTransactionType;
  description: string;
  relatedUserId?: string;
  bookingId?: string;
  createdAt: number;
}