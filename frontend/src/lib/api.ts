/**
 * UniWallet Frontend API Client
 * ─────────────────────────────
 * Set NEXT_PUBLIC_API_URL in frontend/.env.local (defaults to http://localhost:3001).
 *
 * Usage:
 *   import { api } from "@/lib/api"
 *   const dashboard = await api.dashboard.get(userId)
 *   const goal = await api.savings.contribute(goalId, { amount: 50, note: "side hustle" })
 */

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ─── Types (mirror of backend src/types/index.ts) ────────────────────────────

export type StudentType = "living_at_home" | "dorm" | "off_campus";
export type PayFrequency = "weekly" | "biweekly" | "monthly";
export type BillCategory =
  | "rent" | "tuition" | "utilities" | "phone" | "transit"
  | "groceries" | "subscriptions" | "insurance" | "other";
export type Priority = "high" | "medium" | "low";
export type BudgetStatus = "safe" | "warning" | "over_budget";
export type ChallengeStatus = "active" | "completed" | "failed" | "skipped";
export type SideHustleType = "gig" | "freelance" | "part_time" | "online" | "campus" | "tutoring";
export type LocationType = "remote" | "local" | "hybrid";
export type SavingMethod = "round_up" | "percentage" | "fixed_weekly" | "spare_change" | "manual";
export type GoalCategory = "emergency" | "education" | "travel" | "tech" | "general" | "housing";
export type EducationCategory = "budgeting" | "credit" | "investing" | "taxes" | "side_hustles" | "savings";

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { message: string } | null;
}

export interface Profile {
  id: string;
  name: string;
  school: string;
  studentType: StudentType;
  currentBalance: number;
  monthlyIncome: number;
  payFrequency: PayFrequency;
  nextPayDate: string;
  city: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  id: string;
  userId: string;
  name: string;
  amount: number;
  dueDate: string;
  category: BillCategory;
  priority: Priority;
  recurring: boolean;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetInsight {
  status: BudgetStatus;
  projectedBalance: number;
  overUnderAmount: number;
  daysUntilNextPay: number;
  nextBillDue: { name: string; amount: number; dueDate: string; priority: Priority } | null;
  priorityPayments: Bill[];
  totalUnpaidBills: number;
  recommendations: string[];
}

export interface Challenge {
  id: string;
  userId: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  streak: number;
  rewardLabel: string;
  status: ChallengeStatus;
  weekStart: string;
  progressPercent: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface SideHustle {
  id: string;
  title: string;
  type: SideHustleType;
  estimatedEarnings: string;
  flexibility: "low" | "medium" | "high";
  locationType: LocationType;
  description: string;
  city: string | null;
  tags: string[];
}

export interface SavingsGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  category: GoalCategory;
  savingMethod: SavingMethod;
  autoSaveAmount: number | null;
  autoSaveFreq: string | null;
  isActive: boolean;
  progressPercent: number;
  amountRemaining: number;
  projectedCompletionDate: string | null;
  weeklyRequiredSave: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoalWithContributions extends SavingsGoal {
  recentContributions: Array<{
    id: string;
    amount: number;
    note: string | null;
    contributedAt: string;
  }>;
}

export interface EducationModule {
  id: string;
  title: string;
  category: EducationCategory;
  description: string;
  estimatedMinutes: number;
  xpReward: number;
  tips: string[];
  keyTakeaways: string[];
}

export interface EducationProgressEntry {
  moduleId: string;
  title: string;
  category: EducationCategory;
  completed: boolean;
  completedAt: string | null;
  xpEarned: number;
}

export interface EducationSummary {
  totalXp: number;
  completedModules: number;
  totalModules: number;
  modules: Array<EducationModule & { progress: EducationProgressEntry | null }>;
  categoryProgress: Record<EducationCategory, { completed: number; total: number }>;
  nextSuggestedModule: EducationModule | null;
}

export interface Dashboard {
  profile: Profile;
  budgetInsight: BudgetInsight;
  upcomingBills: Bill[];
  activeChallenge: Challenge | null;
  savingsGoals: SavingsGoal[];
  sideHustles: SideHustle[];
  educationSummary: {
    totalXp: number;
    completedModules: number;
    totalModules: number;
    nextSuggestedModule: EducationModule | null;
  };
  recentChatMessage: ChatMessage | null;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(public message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  const json: ApiResponse<T> = await res.json();

  if (!json.success || json.data === null) {
    throw new ApiError(
      json.error?.message ?? "Request failed",
      res.status
    );
  }

  return json.data;
}

function get<T>(path: string) {
  return request<T>(path, { method: "GET" });
}

function post<T>(path: string, body?: unknown) {
  return request<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

function put<T>(path: string, body?: unknown) {
  return request<T>(path, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

function del<T>(path: string) {
  return request<T>(path, { method: "DELETE" });
}

// ─── API client ───────────────────────────────────────────────────────────────

export const api = {
  // ── Dashboard ──────────────────────────────────────────────────────────────
  dashboard: {
    get: (userId: string) =>
      get<Dashboard>(`/api/dashboard/${userId}`),
  },

  // ── Profile ────────────────────────────────────────────────────────────────
  profile: {
    get: (userId: string) =>
      get<Profile>(`/api/profile/${userId}`),

    create: (body: {
      name: string;
      school: string;
      studentType: StudentType;
      currentBalance: number;
      monthlyIncome: number;
      payFrequency: PayFrequency;
      nextPayDate: string;
      city: string;
    }) => post<Profile>("/api/profile", body),

    update: (userId: string, body: Partial<{
      name: string;
      school: string;
      studentType: StudentType;
      currentBalance: number;
      monthlyIncome: number;
      payFrequency: PayFrequency;
      nextPayDate: string;
      city: string;
    }>) => put<Profile>(`/api/profile/${userId}`, body),
  },

  // ── Bills ──────────────────────────────────────────────────────────────────
  bills: {
    list: (userId: string, filter?: "paid" | "unpaid") => {
      const q = filter === "paid" ? "?paid=true" : filter === "unpaid" ? "?paid=false" : "";
      return get<Bill[]>(`/api/bills/${userId}${q}`);
    },

    create: (body: {
      userId: string;
      name: string;
      amount: number;
      dueDate: string;
      category: BillCategory;
      priority?: Priority;
      recurring?: boolean;
    }) => post<Bill>("/api/bills", body),

    update: (billId: string, body: Partial<{
      name: string;
      amount: number;
      dueDate: string;
      category: BillCategory;
      priority: Priority;
      recurring: boolean;
      isPaid: boolean;
    }>) => put<Bill>(`/api/bills/${billId}`, body),

    delete: (billId: string) =>
      del<{ deleted: boolean }>(`/api/bills/${billId}`),

    markPaid: (billId: string) =>
      post<Bill>(`/api/bills/${billId}/pay`),
  },

  // ── Forecast ───────────────────────────────────────────────────────────────
  forecast: {
    run: (userId: string) =>
      post<BudgetInsight>(`/api/forecast/${userId}`),
  },

  // ── AI Coach ───────────────────────────────────────────────────────────────
  ai: {
    chat: (userId: string, message: string) =>
      post<{ message: ChatMessage }>("/api/ai/chat", { userId, message }),

    history: (userId: string, limit = 20) =>
      get<ChatMessage[]>(`/api/ai/history/${userId}?limit=${limit}`),
  },

  // ── Challenge ──────────────────────────────────────────────────────────────
  challenge: {
    get: (userId: string) =>
      get<Challenge>(`/api/challenge/${userId}`),

    updateProgress: (challengeId: string, progress: number) =>
      put<Challenge>(`/api/challenge/${challengeId}/progress`, { progress }),

    /** Latest active or completed challenge, or null. Never creates one. */
    current: (userId: string) =>
      get<{ challenge: Challenge | null }>(`/api/challenge/${userId}/current`),

    start: (body: { userId: string; title: string; description: string; target: number }) =>
      post<Challenge>("/api/challenge", body),

    skip: (challengeId: string) =>
      post<Challenge>(`/api/challenge/${challengeId}/skip`),
  },

  // ── Side Hustles ───────────────────────────────────────────────────────────
  sideHustles: {
    list: (opts?: { city?: string; mode?: "remote" | "local"; tags?: string[]; limit?: number }) => {
      const params = new URLSearchParams();
      if (opts?.city) params.set("city", opts.city);
      if (opts?.mode) params.set("mode", opts.mode);
      if (opts?.tags?.length) params.set("tags", opts.tags.join(","));
      if (opts?.limit) params.set("limit", String(opts.limit));
      const q = params.toString() ? `?${params.toString()}` : "";
      return get<SideHustle[]>(`/api/side-hustles${q}`);
    },
  },

  // ── Savings Goals ──────────────────────────────────────────────────────────
  savings: {
    list: (userId: string) =>
      get<SavingsGoal[]>(`/api/savings/${userId}`),

    get: (userId: string, goalId: string) =>
      get<SavingsGoalWithContributions>(`/api/savings/${userId}/${goalId}`),

    create: (body: {
      userId: string;
      title: string;
      description?: string;
      targetAmount: number;
      targetDate?: string;
      category?: GoalCategory;
      savingMethod?: SavingMethod;
      autoSaveAmount?: number;
      autoSaveFreq?: PayFrequency;
    }) => post<SavingsGoal>("/api/savings", body),

    update: (goalId: string, body: Partial<{
      title: string;
      description: string;
      targetAmount: number;
      targetDate: string;
      category: GoalCategory;
      savingMethod: SavingMethod;
      autoSaveAmount: number;
      autoSaveFreq: PayFrequency;
      isActive: boolean;
    }>) => put<SavingsGoal>(`/api/savings/${goalId}`, body),

    delete: (goalId: string) =>
      del<{ deleted: boolean }>(`/api/savings/${goalId}`),

    contribute: (goalId: string, body: { amount: number; note?: string }) =>
      post<{ contribution: { id: string; amount: number; note: string | null; contributedAt: string }; goal: SavingsGoal }>(
        `/api/savings/${goalId}/contribute`,
        body
      ),

    methods: () =>
      get<Array<{ id: SavingMethod; description: string }>>("/api/savings/meta/methods"),
  },

  // ── Education ──────────────────────────────────────────────────────────────
  education: {
    modules: (category?: EducationCategory) => {
      const q = category ? `?category=${category}` : "";
      return get<EducationModule[]>(`/api/education/modules${q}`);
    },

    module: (moduleId: string) =>
      get<EducationModule>(`/api/education/modules/${moduleId}`),

    progress: (userId: string) =>
      get<EducationSummary>(`/api/education/${userId}`),

    complete: (userId: string, moduleId: string) =>
      post<{
        alreadyCompleted: boolean;
        xpEarned: number;
        message: string;
        progress: EducationProgressEntry;
      }>(`/api/education/${userId}/complete/${moduleId}`),
  },
};

// ─── Convenience hooks-compatible helpers ─────────────────────────────────────

/** Get userId from localStorage (set it after onboarding) */
export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("uniwallet_user_id");
}

/** Save userId to localStorage after profile creation */
export function setUserId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("uniwallet_user_id", id);
}

/** Clear userId (logout) */
export function clearUserId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("uniwallet_user_id");
}

export { ApiError };
export default api;
