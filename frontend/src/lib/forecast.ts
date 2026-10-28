import { daysUntil } from "./dates";
import { FinancialProfile, ForecastResult, Bill, BillPriority, Insight } from "@/types";

export const PRIORITY_RANK: Record<BillPriority, number> = { high: 0, medium: 1, low: 2 };

export function sortBills(bills: Bill[]): Bill[] {
  return [...bills]
    .filter((b) => !b.paid)
    .sort((a, b) => {
      const diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return diff !== 0 ? diff : PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    });
}

export function computeForecast(profile: FinancialProfile): ForecastResult {
  const { currentBalance, nextPayDate, bills = [] } = profile;
  const payDate = new Date(nextPayDate);
  const now = new Date();

  const unpaid = bills.filter((b) => !b.paid);

  const dueBefore = unpaid
    .filter((b) => new Date(b.dueDate) <= payDate)
    .sort((a, b) => {
      const diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return diff !== 0 ? diff : PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    });

  const prioritizedBills = sortBills(bills);
  const totalDue = dueBefore.reduce((s, b) => s + b.amount, 0);
  const projectedBalance = currentBalance - totalDue;

  let status: ForecastResult["status"];
  if (projectedBalance < 0) status = "over_budget";
  else if (projectedBalance < currentBalance * 0.2) status = "warning";
  else status = "safe";

  const nextBillDue = prioritizedBills.length > 0 ? prioritizedBills[0] : null;
  const insights: Insight[] = [];

  // Shortfall or very low remaining
  if (projectedBalance < 0) {
    insights.push({
      id: "shortfall",
      type: "danger",
      message: `You're $${Math.abs(projectedBalance).toFixed(2)} short before payday — act now.`,
    });
  } else if (projectedBalance < 50) {
    insights.push({
      id: "low-balance",
      type: "danger",
      message: `You'll only have $${projectedBalance.toFixed(2)} left after bills. Very little cushion.`,
    });
  }

  // Bills due in the next 2 days
  for (const bill of unpaid) {
    const days = daysUntil(bill.dueDate, now);
    if (days >= 0 && days <= 2) {
      insights.push({
        id: `due-soon-${bill.id}`,
        type: "danger",
        message: `${bill.name} ($${bill.amount}) is due ${
          days === 0 ? "today" : days === 1 ? "tomorrow" : "in 2 days"
        }.`,
      });
    }
  }

  // Single bill eating more than 50% of balance
  for (const bill of unpaid) {
    if (currentBalance > 0 && bill.amount / currentBalance > 0.5) {
      insights.push({
        id: `heavy-${bill.id}`,
        type: "warning",
        message: `Your ${bill.name} takes up ${Math.round(
          (bill.amount / currentBalance) * 100
        )}% of what you have right now.`,
      });
      break;
    }
  }

  // Low-priority bills that could be cut
  const lowBills = unpaid.filter((b) => b.priority === "low");
  if ((status === "warning" || status === "over_budget") && lowBills.length > 0) {
    const savings = lowBills.reduce((s, b) => s + b.amount, 0);
    insights.push({
      id: "cut-low",
      type: "tip",
      message: `Cutting ${lowBills.map((b) => b.name).join(", ")} saves you $${savings} before payday.`,
    });
  }

  // Payday coming soon
  const daysUntilPay = daysUntil(nextPayDate, now);
  if (daysUntilPay > 0 && daysUntilPay <= 3 && status !== "over_budget") {
    insights.push({
      id: "pay-soon",
      type: "tip",
      message: `Payday is in ${daysUntilPay} day${
        daysUntilPay !== 1 ? "s" : ""
      }. Almost there — hold tight.`,
    });
  }

  // Positive tip when healthy
  if (status === "safe" && projectedBalance > 100 && insights.length < 3) {
    insights.push({
      id: "on-track",
      type: "tip",
      message: `You're on track. Consider putting $${Math.floor(
        projectedBalance * 0.3
      )} aside into savings before payday.`,
    });
  }

  // Recommendations
  const recommendations: string[] = [];
  if (status === "over_budget") {
    const highNames = dueBefore
      .filter((b) => b.priority === "high")
      .map((b) => b.name)
      .join(" and ");
    if (highNames) recommendations.push(`Pay ${highNames} before anything else.`);
    if (lowBills.length > 0)
      recommendations.push(`Pause ${lowBills.map((b) => b.name).join(", ")} until after payday.`);
    recommendations.push("Avoid all non-essential spending this week.");
  } else if (status === "warning") {
    recommendations.push("Your balance will be tight — pay bills in order of due date.");
    if (lowBills.length > 0)
      recommendations.push(`Consider pausing ${lowBills.map((b) => b.name).join(", ")}.`);
    recommendations.push("Hold off on big purchases until after payday.");
  } else {
    recommendations.push("You're in good shape — stay on top of your bills.");
    recommendations.push("Make sure all bills are scheduled so nothing slips.");
    if (projectedBalance > 150)
      recommendations.push(
        `You have room to save — even $${Math.floor(projectedBalance * 0.2)} set aside helps.`
      );
  }

  return {
    status,
    projectedBalance,
    amountOver: projectedBalance < 0 ? Math.abs(projectedBalance) : 0,
    nextPayDate,
    nextBillDue,
    prioritizedBills,
    insights,
    recommendations,
    challenge: null,
  };
}
