export type BudgetStatus = "safe" | "warning" | "over_budget";

export type BillPriority = "high" | "medium" | "low";

export type StudentType = "living_at_home" | "dorm" | "off_campus";

export type PayFrequency = "weekly" | "biweekly" | "monthly";

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  priority: BillPriority;
  paid: boolean;
}

export interface Insight {
  id: string;
  message: string;
  type: "danger" | "warning" | "tip";
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  deadline: string;
}

export interface FinancialProfile {
  currentBalance: number;
  monthlyIncome: number;
  payFrequency: PayFrequency;
  nextPayDate: string;
  studentType: StudentType;
  bills: Bill[];
}

export interface ForecastResult {
  status: BudgetStatus;
  projectedBalance: number;
  amountOver: number;
  nextPayDate: string;
  nextBillDue: Bill | null;
  prioritizedBills: Bill[];
  insights: Insight[];
  recommendations: string[];
  challenge: Challenge | null;
}