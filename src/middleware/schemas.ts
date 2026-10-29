import { z } from "zod";

// ─── Profile ──────────────────────────────────────────────────────────────────

export const CreateProfileSchema = z.object({
  name: z.string().min(1).max(100),
  school: z.string().min(1).max(200),
  studentType: z.enum(["living_at_home", "dorm", "off_campus"]),
  currentBalance: z.number().min(0).default(0),
  monthlyIncome: z.number().min(0).default(0),
  payFrequency: z.enum(["weekly", "biweekly", "monthly"]).default("biweekly"),
  nextPayDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  city: z.string().min(1).max(100),
});

export const UpdateProfileSchema = CreateProfileSchema.partial();

// ─── Bills ────────────────────────────────────────────────────────────────────

export const CreateBillSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1).max(200),
  amount: z.number().positive(),
  dueDate: z.string().min(1),
  category: z.enum([
    "rent", "tuition", "utilities", "phone", "transit",
    "groceries", "subscriptions", "insurance", "other",
  ]),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  recurring: z.boolean().default(false),
});

// isPaid lets the frontend undo "mark paid"; POST /:billId/pay only sets it to true
export const UpdateBillSchema = CreateBillSchema.omit({ userId: true }).partial().extend({ isPaid: z.boolean().optional() });

// ─── AI Chat ──────────────────────────────────────────────────────────────────

export const ChatSchema = z.object({
  userId: z.string().min(1),
  message: z.string().min(1).max(1000),
});

// ─── Challenge ────────────────────────────────────────────────────────────────

export const UpdateProgressSchema = z.object({
  progress: z.number().min(0),
});

export const StartChallengeSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(500).default(""),
  target: z.number().int().min(1).max(31),
});

// ─── Savings Goals ────────────────────────────────────────────────────────────

export const CreateSavingsGoalSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional().default(""),
  targetAmount: z.number().positive(),
  targetDate: z.string().min(1).optional(),
  category: z
    .enum(["emergency", "education", "travel", "tech", "general", "housing"])
    .default("general"),
  savingMethod: z
    .enum(["round_up", "percentage", "fixed_weekly", "spare_change", "manual"])
    .default("manual"),
  autoSaveAmount: z.number().positive().optional(),
  autoSaveFreq: z.enum(["weekly", "biweekly", "monthly"]).optional(),
});

export const UpdateSavingsGoalSchema = CreateSavingsGoalSchema.omit({ userId: true }).partial();

export const ContributionSchema = z.object({
  amount: z.number().positive(),
  note: z.string().max(300).optional(),
});
