// SavingsGoal type matches Prisma schema
interface SavingsGoalDB {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date | null;
  category: string;
  savingMethod: string;
  autoSaveAmount: number | null;
  autoSaveFreq: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
import { SavingsGoalResponse, SavingMethod, GoalCategory } from "../types";

export function formatSavingsGoal(goal: SavingsGoalDB): SavingsGoalResponse {
  const progressPercent = Math.min(
    100,
    Math.round((goal.currentAmount / goal.targetAmount) * 100)
  );
  const amountRemaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  let projectedCompletionDate: string | null = null;
  let weeklyRequiredSave: number | null = null;

  if (goal.targetDate) {
    const now = new Date();
    const target = new Date(goal.targetDate);
    const weeksLeft = Math.max(
      1,
      Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7))
    );
    weeklyRequiredSave =
      amountRemaining > 0
        ? Math.round((amountRemaining / weeksLeft) * 100) / 100
        : 0;
  }

  if (goal.autoSaveAmount && goal.autoSaveAmount > 0 && amountRemaining > 0) {
    const freqMultiplier =
      goal.autoSaveFreq === "weekly"
        ? 1
        : goal.autoSaveFreq === "biweekly"
        ? 0.5
        : 0.23; // monthly ≈ once/4.3 weeks
    const weeklyRate = goal.autoSaveAmount * freqMultiplier;
    if (weeklyRate > 0) {
      const weeksToComplete = Math.ceil(amountRemaining / weeklyRate);
      const completionDate = new Date();
      completionDate.setDate(
        completionDate.getDate() + weeksToComplete * 7
      );
      projectedCompletionDate = completionDate.toISOString();
    }
  }

  return {
    id: goal.id,
    userId: goal.userId,
    title: goal.title,
    description: goal.description,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    targetDate: goal.targetDate ? goal.targetDate.toISOString() : null,
    category: goal.category as GoalCategory,
    savingMethod: goal.savingMethod as SavingMethod,
    autoSaveAmount: goal.autoSaveAmount,
    autoSaveFreq: goal.autoSaveFreq,
    isActive: goal.isActive,
    progressPercent,
    amountRemaining,
    projectedCompletionDate,
    weeklyRequiredSave,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  };
}

export const SAVING_METHOD_DESCRIPTIONS: Record<SavingMethod, string> = {
  round_up:
    "Round up every purchase to the nearest dollar and save the difference automatically.",
  percentage:
    "Save a fixed percentage of every paycheck (e.g., 10%) automatically.",
  fixed_weekly:
    "Set aside a fixed dollar amount every week regardless of spending.",
  spare_change:
    "Collect small amounts of leftover daily spending into your goal.",
  manual: "Add contributions manually whenever you have extra money.",
};
