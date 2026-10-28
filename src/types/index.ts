// ─── Enums ────────────────────────────────────────────────────────────────────

export type StudentType = "living_at_home" | "dorm" | "off_campus";
export type PayFrequency = "weekly" | "biweekly" | "monthly";
export type BillCategory =
  | "rent"
  | "tuition"
  | "utilities"
  | "phone"
  | "transit"
  | "groceries"
  | "subscriptions"
  | "insurance"
  | "other";
export type Priority = "high" | "medium" | "low";
export type BudgetStatus = "safe" | "warning" | "over_budget";
export type ChallengeStatus = "active" | "completed" | "failed" | "skipped";
export type SideHustleType =
  | "gig"
  | "freelance"
  | "part_time"
  | "online"
  | "campus"
  | "tutoring";
export type LocationType = "remote" | "local" | "hybrid";
export type SavingMethod =
  | "round_up"
  | "percentage"
  | "fixed_weekly"
  | "spare_change"
  | "manual";
export type GoalCategory =
  | "emergency"
  | "education"
  | "travel"
  | "tech"
  | "general"
  | "housing";
export type EducationCategory =
  | "budgeting"
  | "credit"
  | "investing"
  | "taxes"
  | "side_hustles"
  | "savings";

// ─── API Response Wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: { message: string } | null;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface ProfileInput {
  name: string;
  school: string;
  studentType: StudentType;
  currentBalance: number;
  monthlyIncome: number;
  payFrequency: PayFrequency;
  nextPayDate: string; // ISO string
  city: string;
}

export interface ProfileResponse {
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

// ─── Bills ────────────────────────────────────────────────────────────────────

export interface BillInput {
  userId: string;
  name: string;
  amount: number;
  dueDate: string; // ISO string
  category: BillCategory;
  priority?: Priority;
  recurring?: boolean;
}

export interface BillResponse {
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

// ─── Budget Insight ───────────────────────────────────────────────────────────

export interface BudgetInsight {
  status: BudgetStatus;
  projectedBalance: number;
  overUnderAmount: number;
  daysUntilNextPay: number;
  nextBillDue: {
    name: string;
    amount: number;
    dueDate: string;
    priority: Priority;
  } | null;
  priorityPayments: BillResponse[];
  totalUnpaidBills: number;
  recommendations: string[];
}

// ─── Challenge ────────────────────────────────────────────────────────────────

export interface ChallengeResponse {
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

// ─── AI Chat ──────────────────────────────────────────────────────────────────

export interface ChatInput {
  userId: string;
  message: string;
}

export interface ChatMessageResponse {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// ─── Side Hustles ─────────────────────────────────────────────────────────────

export interface SideHustleResponse {
  id: string;
  title: string;
  type: SideHustleType;
  estimatedEarnings: string; // e.g. "$15–25/hr"
  flexibility: "low" | "medium" | "high";
  locationType: LocationType;
  description: string;
  city: string | null;
  tags: string[];
}

// ─── Savings Goals ────────────────────────────────────────────────────────────

export interface SavingsGoalInput {
  userId: string;
  title: string;
  description?: string;
  targetAmount: number;
  targetDate?: string; // ISO string
  category?: GoalCategory;
  savingMethod?: SavingMethod;
  autoSaveAmount?: number;
  autoSaveFreq?: PayFrequency;
}

export interface SavingsGoalResponse {
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

export interface ContributionInput {
  amount: number;
  note?: string;
}

// ─── Education ────────────────────────────────────────────────────────────────

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

export interface EducationProgressResponse {
  moduleId: string;
  title: string;
  category: EducationCategory;
  completed: boolean;
  completedAt: string | null;
  xpEarned: number;
}

export interface EducationSummaryResponse {
  totalXp: number;
  completedModules: number;
  totalModules: number;
  modules: (EducationModule & { progress: EducationProgressResponse | null })[];
  categoryProgress: Record<
    EducationCategory,
    { completed: number; total: number }
  >;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardResponse {
  profile: ProfileResponse;
  budgetInsight: BudgetInsight;
  upcomingBills: BillResponse[];
  activeChallenge: ChallengeResponse | null;
  savingsGoals: SavingsGoalResponse[];
  sideHustles: SideHustleResponse[];
  educationSummary: {
    totalXp: number;
    completedModules: number;
    totalModules: number;
    nextSuggestedModule: EducationModule | null;
  };
  recentChatMessage: ChatMessageResponse | null;
}
