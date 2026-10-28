import { BudgetInsight, ChallengeResponse } from "../types";

interface ChallengeTemplate {
  title: string;
  description: string;
  target: number;
  rewardLabel: string;
}

export function generateChallenge(insight: BudgetInsight): ChallengeTemplate {
  const templates: ChallengeTemplate[] = [];

  if (insight.status === "over_budget") {
    templates.push({
      title: "No-Spend Days",
      description:
        "You're over budget. Complete 5 no-spend days before your next payday to get back on track.",
      target: 5,
      rewardLabel: "Budget Survivor Badge",
    });
    templates.push({
      title: "Cut Subscriptions",
      description:
        "Cancel or pause at least 1 subscription service this week to free up cash.",
      target: 1,
      rewardLabel: "Subscription Slayer",
    });
  } else if (insight.status === "warning") {
    templates.push({
      title: "Takeout Budget",
      description:
        "Keep takeout and dining spending under $30 this week. Cook at home as much as possible.",
      target: 30,
      rewardLabel: "Home Chef Badge",
    });
    templates.push({
      title: "Expense Logger",
      description:
        "Log every expense for 5 days straight. Awareness is the first step to saving.",
      target: 5,
      rewardLabel: "Money Tracker Badge",
    });
  } else {
    templates.push({
      title: "Save $20 This Week",
      description:
        "You're doing well! Challenge yourself to save an extra $20 toward your savings goal this week.",
      target: 20,
      rewardLabel: "Saver Streak Badge",
    });
    templates.push({
      title: "Learn & Earn",
      description:
        "Complete 2 financial education modules this week to boost your money IQ.",
      target: 2,
      rewardLabel: "Scholar Badge",
    });
    templates.push({
      title: "Side Hustle Day",
      description:
        "Spend at least 2 hours this week pursuing a side hustle or skill-building activity.",
      target: 2,
      rewardLabel: "Hustle Mode Badge",
    });
  }

  // Pick deterministically based on day of week
  const idx = new Date().getDay() % templates.length;
  return templates[idx];
}

export function formatChallenge(
  dbChallenge: {
    id: string;
    userId: string;
    title: string;
    description: string;
    progress: number;
    target: number;
    streak: number;
    rewardLabel: string;
    status: string;
    weekStart: Date;
  }
): ChallengeResponse {
  const progressPercent = Math.min(
    100,
    Math.round((dbChallenge.progress / dbChallenge.target) * 100)
  );
  return {
    id: dbChallenge.id,
    userId: dbChallenge.userId,
    title: dbChallenge.title,
    description: dbChallenge.description,
    progress: dbChallenge.progress,
    target: dbChallenge.target,
    streak: dbChallenge.streak,
    rewardLabel: dbChallenge.rewardLabel,
    status: dbChallenge.status as ChallengeResponse["status"],
    weekStart: dbChallenge.weekStart.toISOString(),
    progressPercent,
  };
}
