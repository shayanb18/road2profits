// Bill type matches Prisma schema
interface Bill {
  id: string;
  userId: string;
  name: string;
  amount: number;
  dueDate: Date;
  category: string;
  priority: string;
  recurring: boolean;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
}
import { BudgetInsight, BillResponse, Priority } from "../types";

const PRIORITY_MAP: Record<string, Priority> = {
  rent: "high",
  tuition: "high",
  utilities: "high",
  groceries: "high",
  phone: "medium",
  transit: "medium",
  insurance: "medium",
  subscriptions: "low",
  other: "low",
};

function derivePriority(bill: Bill): Priority {
  if (
    bill.priority === "high" ||
    bill.priority === "medium" ||
    bill.priority === "low"
  ) {
    return bill.priority as Priority;
  }
  return PRIORITY_MAP[bill.category] ?? "low";
}

function toResponse(bill: Bill): BillResponse {
  return {
    id: bill.id,
    userId: bill.userId,
    name: bill.name,
    amount: bill.amount,
    dueDate: bill.dueDate.toISOString(),
    category: bill.category as BillResponse["category"],
    priority: derivePriority(bill),
    recurring: bill.recurring,
    isPaid: bill.isPaid,
    createdAt: bill.createdAt.toISOString(),
    updatedAt: bill.updatedAt.toISOString(),
  };
}

function priorityScore(p: Priority): number {
  return { high: 3, medium: 2, low: 1 }[p];
}

export function computeForecast(
  currentBalance: number,
  monthlyIncome: number,
  nextPayDate: Date,
  bills: Bill[]
): BudgetInsight {
  const now = new Date();
  const daysUntilNextPay = Math.max(
    0,
    Math.ceil(
      (nextPayDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  // Only consider unpaid bills due before next pay date
  const unpaidUpcoming = bills.filter(
    (b) => !b.isPaid && new Date(b.dueDate) <= nextPayDate
  );

  const totalDue = unpaidUpcoming.reduce((sum, b) => sum + b.amount, 0);
  const projectedBalance = currentBalance - totalDue;

  const status: BudgetInsight["status"] =
    projectedBalance >= 100
      ? "safe"
      : projectedBalance >= 0
      ? "warning"
      : "over_budget";

  const overUnderAmount = Math.abs(projectedBalance);

  // Sort by priority then due date
  const sorted = [...unpaidUpcoming].sort((a, b) => {
    const ps = priorityScore(derivePriority(b)) - priorityScore(derivePriority(a));
    if (ps !== 0) return ps;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  // Next bill due (soonest unpaid)
  const nextBillRaw = [...bills]
    .filter((b) => !b.isPaid)
    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )[0];

  const nextBillDue = nextBillRaw
    ? {
        name: nextBillRaw.name,
        amount: nextBillRaw.amount,
        dueDate: nextBillRaw.dueDate.toISOString(),
        priority: derivePriority(nextBillRaw),
      }
    : null;

  const recommendations = buildRecommendations(
    status,
    projectedBalance,
    daysUntilNextPay,
    sorted,
    currentBalance
  );

  return {
    status,
    projectedBalance: Math.round(projectedBalance * 100) / 100,
    overUnderAmount: Math.round(overUnderAmount * 100) / 100,
    daysUntilNextPay,
    nextBillDue,
    priorityPayments: sorted.map(toResponse),
    totalUnpaidBills: totalDue,
    recommendations,
  };
}

function buildRecommendations(
  status: BudgetInsight["status"],
  projectedBalance: number,
  daysUntilPay: number,
  sortedBills: Bill[],
  currentBalance: number
): string[] {
  const recs: string[] = [];

  if (status === "over_budget") {
    recs.push(
      `You're short $${Math.abs(projectedBalance).toFixed(2)} before your next payday. Focus on high-priority bills first.`
    );
    const lowPri = sortedBills.filter((b) => derivePriority(b) === "low");
    if (lowPri.length > 0) {
      recs.push(
        `Consider pausing ${lowPri.map((b) => b.name).join(", ")} — these are low priority and can wait.`
      );
    }
  } else if (status === "warning") {
    recs.push(
      `You're cutting it close — only $${projectedBalance.toFixed(2)} left after upcoming bills.`
    );
    recs.push("Avoid non-essential spending until your next paycheck.");
  } else {
    recs.push(
      `You're in good shape with $${projectedBalance.toFixed(2)} projected after bills.`
    );
    if (currentBalance > 200) {
      recs.push(
        "Consider putting a portion toward your savings goal this week."
      );
    }
  }

  if (daysUntilPay <= 3) {
    recs.push("Payday is almost here — hang tight and only spend on essentials.");
  }

  const highPri = sortedBills.filter((b) => derivePriority(b) === "high");
  if (highPri.length > 0) {
    recs.push(
      `Pay these first: ${highPri.map((b) => b.name).join(", ")}.`
    );
  }

  return recs;
}
