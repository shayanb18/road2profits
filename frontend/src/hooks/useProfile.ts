import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FinancialProfile } from "@/types";

export function useProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("uniwallet-profile");
    if (!raw) {
      router.replace("/onboarding");
      return;
    }
    try {
      setProfile(JSON.parse(raw) as FinancialProfile);
      setReady(true);
    } catch {
      router.replace("/onboarding");
    }
  }, [router]);

  const updateProfile = useCallback((updated: FinancialProfile) => {
    localStorage.setItem("uniwallet-profile", JSON.stringify(updated));
    setProfile(updated);
  }, []);

  return { profile, ready, updateProfile };
}
