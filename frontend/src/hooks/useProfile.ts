import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FinancialProfile } from "@/types";
import { api, ApiError, getUserId, clearUserId } from "@/lib/api";

// Loads the profile and bills from the backend and maps them to the shape the pages use.
export function useProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      router.replace("/onboarding");
      return;
    }
    Promise.all([api.profile.get(userId), api.bills.list(userId)])
      .then(([p, bills]) =>
        setProfile({
          currentBalance: p.currentBalance,
          monthlyIncome: p.monthlyIncome,
          payFrequency: p.payFrequency,
          nextPayDate: p.nextPayDate,
          studentType: p.studentType,
          bills: bills.map((b) => ({
            id: b.id,
            name: b.name,
            amount: b.amount,
            dueDate: b.dueDate,
            priority: b.priority,
            paid: b.isPaid,
          })),
        })
      )
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          clearUserId();
          router.replace("/onboarding");
        } else {
          setError("Can't reach the UniWallet server. Check that the backend is running, then refresh.");
        }
      });
  }, [router]);

  const setBillPaid = useCallback(async (billId: string, paid: boolean) => {
    const bill = paid ? await api.bills.markPaid(billId) : await api.bills.update(billId, { isPaid: false });
    setProfile((p) => p && { ...p, bills: p.bills.map((b) => (b.id === billId ? { ...b, paid: bill.isPaid } : b)) });
  }, []);

  return { profile, ready: profile !== null, error, setBillPaid };
}
