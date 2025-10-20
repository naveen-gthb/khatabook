import { doc, runTransaction, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Transaction } from "@/types/transaction";

export const updateTotal = async (
  userId: string,
  amount: number,
  type: "lent" | "received"
) => {
  const totalsRef = doc(db, "totals", userId);

  try {
    await runTransaction(db, async (transaction) => {
      const totalsDoc = await transaction.get(totalsRef);

      if (!totalsDoc.exists()) {
        const newTotals = {
          totalLent: type === "lent" ? amount : 0,
          totalReceived: type === "received" ? amount : 0,
        };
        transaction.set(totalsRef, newTotals);
        return;
      }

      const currentTotals = totalsDoc.data();
      const newTotals = { ...currentTotals };

      if (type === "lent") {
        newTotals.totalLent = (currentTotals.totalLent || 0) + amount;
      } else if (type === "received") {
        newTotals.totalReceived = (currentTotals.totalReceived || 0) + amount;
      }

      transaction.update(totalsRef, newTotals);
    });
  } catch (error) {
    console.error("Error updating totals: ", error);
  }
};
