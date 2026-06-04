import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import type { TutorhubWallet, WalletTransaction } from "../models/tutorhubWallet.model";

const WALLETS_COLLECTION = "tutorhub_wallets";
const TRANSACTIONS_COLLECTION = "tutorhub_wallet_transactions";

export async function getWallet(uid: string): Promise<TutorhubWallet> {
  const snap = await getDoc(doc(db, WALLETS_COLLECTION, uid));

  if (snap.exists()) {
    return snap.data() as TutorhubWallet;
  }

  const wallet: TutorhubWallet = {
    uid,
    balance: 0,
    currency: "credits",
    updatedAt: Date.now(),
  };

  await setDoc(doc(db, WALLETS_COLLECTION, uid), wallet);
  return wallet;
}

export async function addWalletTransaction(
  transaction: Omit<WalletTransaction, "id" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
    ...transaction,
    createdAt: Date.now(),
  });

  return docRef.id;
}