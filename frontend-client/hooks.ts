/**
 * UniWallet React Hooks
 * ────────────────────────────────────────────────────────────────────────────
 * Drop this into src/hooks/useUniWallet.ts in your frontend.
 * These are standalone hooks — no external state library needed.
 *
 * Requires: React 18+, api.ts in the same project
 *
 * Usage:
 *   const { data, loading, error } = useDashboard(userId)
 *   const { chat, messages, loading } = useAICoach(userId)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import api, {
  Dashboard,
  Profile,
  Bill,
  BudgetInsight,
  Challenge,
  SavingsGoal,
  SavingsGoalWithContributions,
  ChatMessage,
  SideHustle,
  EducationSummary,
  EducationModule,
  BillCategory,
  Priority,
  GoalCategory,
  SavingMethod,
  PayFrequency,
  ApiError,
} from "./api";

// ─── Generic async state hook ─────────────────────────────────────────────────

function useAsync<T>(
  fn: () => Promise<T>,
  deps: React.DependencyList = []
): { data: T | null; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useDashboard(userId: string | null) {
  return useAsync<Dashboard>(
    () => {
      if (!userId) return Promise.reject(new ApiError("No user ID"));
      return api.dashboard.get(userId);
    },
    [userId]
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function useProfile(userId: string | null) {
  return useAsync<Profile>(
    () => {
      if (!userId) return Promise.reject(new ApiError("No user ID"));
      return api.profile.get(userId);
    },
    [userId]
  );
}

// ─── Bills ────────────────────────────────────────────────────────────────────

export function useBills(userId: string | null, filter?: "paid" | "unpaid") {
  const { data, loading, error, refetch } = useAsync<Bill[]>(
    () => {
      if (!userId) return Promise.reject(new ApiError("No user ID"));
      return api.bills.list(userId, filter);
    },
    [userId, filter]
  );

  const markPaid = useCallback(async (billId: string) => {
    await api.bills.markPaid(billId);
    refetch();
  }, [refetch]);

  const deleteBill = useCallback(async (billId: string) => {
    await api.bills.delete(billId);
    refetch();
  }, [refetch]);

  const createBill = useCallback(async (body: {
    name: string; amount: number; dueDate: string;
    category: BillCategory; priority?: Priority; recurring?: boolean;
  }) => {
    if (!userId) return;
    await api.bills.create({ userId, ...body });
    refetch();
  }, [userId, refetch]);

  return { bills: data ?? [], loading, error, refetch, markPaid, deleteBill, createBill };
}

// ─── Forecast ─────────────────────────────────────────────────────────────────

export function useForecast(userId: string | null) {
  return useAsync<BudgetInsight>(
    () => {
      if (!userId) return Promise.reject(new ApiError("No user ID"));
      return api.forecast.run(userId);
    },
    [userId]
  );
}

// ─── AI Coach ─────────────────────────────────────────────────────────────────

export function useAICoach(userId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    if (!userId) return;
    setHistoryLoading(true);
    api.ai.history(userId, 20)
      .then(setMessages)
      .catch((err) => setError(err.message))
      .finally(() => setHistoryLoading(false));
  }, [userId]);

  const chat = useCallback(async (message: string) => {
    if (!userId || !message.trim()) return;

    // Optimistic user message
    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      userId,
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      const { message: aiMsg } = await api.ai.chat(userId, message);
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "AI coach unavailable");
      // Remove the optimistic user message on failure
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { messages, loading, historyLoading, error, chat };
}

// ─── Challenge ────────────────────────────────────────────────────────────────

export function useChallenge(userId: string | null) {
  const { data, loading, error, refetch } = useAsync<Challenge>(
    () => {
      if (!userId) return Promise.reject(new ApiError("No user ID"));
      return api.challenge.get(userId);
    },
    [userId]
  );

  const updateProgress = useCallback(async (progress: number) => {
    if (!data) return;
    await api.challenge.updateProgress(data.id, progress);
    refetch();
  }, [data, refetch]);

  return { challenge: data, loading, error, refetch, updateProgress };
}

// ─── Side Hustles ─────────────────────────────────────────────────────────────

export function useSideHustles(opts?: {
  city?: string;
  mode?: "remote" | "local";
  tags?: string[];
  limit?: number;
}) {
  return useAsync<SideHustle[]>(
    () => api.sideHustles.list(opts),
    [opts?.city, opts?.mode, opts?.tags?.join(","), opts?.limit]
  );
}

// ─── Savings Goals ────────────────────────────────────────────────────────────

export function useSavingsGoals(userId: string | null) {
  const { data, loading, error, refetch } = useAsync<SavingsGoal[]>(
    () => {
      if (!userId) return Promise.reject(new ApiError("No user ID"));
      return api.savings.list(userId);
    },
    [userId]
  );

  const createGoal = useCallback(async (body: {
    title: string;
    description?: string;
    targetAmount: number;
    targetDate?: string;
    category?: GoalCategory;
    savingMethod?: SavingMethod;
    autoSaveAmount?: number;
    autoSaveFreq?: PayFrequency;
  }) => {
    if (!userId) return;
    const goal = await api.savings.create({ userId, ...body });
    refetch();
    return goal;
  }, [userId, refetch]);

  const contribute = useCallback(async (goalId: string, amount: number, note?: string) => {
    const result = await api.savings.contribute(goalId, { amount, note });
    refetch();
    return result;
  }, [refetch]);

  const deleteGoal = useCallback(async (goalId: string) => {
    await api.savings.delete(goalId);
    refetch();
  }, [refetch]);

  return {
    goals: data ?? [],
    loading,
    error,
    refetch,
    createGoal,
    contribute,
    deleteGoal,
  };
}

export function useSavingsGoal(userId: string | null, goalId: string | null) {
  return useAsync<SavingsGoalWithContributions>(
    () => {
      if (!userId || !goalId) return Promise.reject(new ApiError("No user or goal ID"));
      return api.savings.get(userId, goalId);
    },
    [userId, goalId]
  );
}

// ─── Education ────────────────────────────────────────────────────────────────

export function useEducation(userId: string | null) {
  const { data, loading, error, refetch } = useAsync<EducationSummary>(
    () => {
      if (!userId) return Promise.reject(new ApiError("No user ID"));
      return api.education.progress(userId);
    },
    [userId]
  );

  const completeModule = useCallback(async (moduleId: string) => {
    if (!userId) return;
    const result = await api.education.complete(userId, moduleId);
    refetch();
    return result;
  }, [userId, refetch]);

  return {
    education: data,
    loading,
    error,
    refetch,
    completeModule,
    totalXp: data?.totalXp ?? 0,
    completedModules: data?.completedModules ?? 0,
    totalModules: data?.totalModules ?? 0,
  };
}

export function useEducationModules(category?: string) {
  return useAsync<EducationModule[]>(
    () => api.education.modules(category as any),
    [category]
  );
}

// ─── Onboarding helper ────────────────────────────────────────────────────────

export function useOnboarding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProfile = useCallback(async (body: {
    name: string;
    school: string;
    studentType: "living_at_home" | "dorm" | "off_campus";
    currentBalance: number;
    monthlyIncome: number;
    payFrequency: "weekly" | "biweekly" | "monthly";
    nextPayDate: string;
    city: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const profile = await api.profile.create(body);
      // Store userId — all subsequent calls use this
      localStorage.setItem("uniwallet_user_id", profile.id);
      return profile;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to create profile";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createProfile, loading, error };
}
