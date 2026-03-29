import { ForecastResult, FinancialProfile } from "@/types";

export const mockProfile: FinancialProfile = {
  currentBalance: 342.50,
  monthlyIncome: 1200,
  payFrequency: "biweekly",
  nextPayDate: "2026-04-04",
  studentType: "off_campus",
  bills: [
    {
      id: "1",
      name: "Rent",
      amount: 750,
      dueDate: "2026-04-01",
      priority: "high",
      paid: false,
    },
    {
      id: "2",
      name: "Hydro",
      amount: 60,
      dueDate: "2026-04-03",
      priority: "high",
      paid: false,
    },
    {
      id: "3",
      name: "Spotify",
      amount: 11,
      dueDate: "2026-04-10",
      priority: "low",
      paid: false,
    },
    {
      id: "4",
      name: "Phone Plan",
      amount: 45,
      dueDate: "2026-04-07",
      priority: "medium",
      paid: false,
    },
  ],
};

export const mockForecast: ForecastResult = {
  status: "warning",
  projectedBalance: -84.50,
  amountOver: 84.50,
  nextPayDate: "2026-04-04",
  nextBillDue: {
    id: "1",
    name: "Rent",
    amount: 750,
    dueDate: "2026-04-01",
    priority: "high",
    paid: false,
  },
  prioritizedBills: [
    {
      id: "1",
      name: "Rent",
      amount: 750,
      dueDate: "2026-04-01",
      priority: "high",
      paid: false,
    },
    {
      id: "2",
      name: "Hydro",
      amount: 60,
      dueDate: "2026-04-03",
      priority: "high",
      paid: false,
    },
    {
      id: "4",
      name: "Phone Plan",
      amount: 45,
      dueDate: "2026-04-07",
      priority: "medium",
      paid: false,
    },
    {
      id: "3",
      name: "Spotify",
      amount: 11,
      dueDate: "2026-04-10",
      priority: "low",
      paid: false,
    },
  ],
  insights: [
    {
      id: "1",
      message: "You will run out of money in 3 days.",
      type: "danger",
    },
    {
      id: "2",
      message: "Rent is 62% of your current balance.",
      type: "warning",
    },
    {
      id: "3",
      message: "Cutting Spotify saves you $11 before payday.",
      type: "tip",
    },
  ],
  recommendations: [
    "Pay rent and hydro before anything else.",
    "Cancel or pause Spotify until after payday.",
    "Avoid any non-essential spending this week.",
  ],
  challenge: {
    id: "1",
    title: "No non-essential spending",
    description: "Avoid takeout and subscriptions until your next payday.",
    target: 7,
    current: 3,
    deadline: "2026-04-04",
  },
};