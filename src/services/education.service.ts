import { EducationModule } from "../types";

export const EDUCATION_MODULES: EducationModule[] = [
  {
    id: "budgeting-101",
    title: "Budgeting 101: The 50/30/20 Rule",
    category: "budgeting",
    description:
      "Learn the most popular student budgeting framework: 50% needs, 30% wants, 20% savings.",
    estimatedMinutes: 5,
    xpReward: 50,
    tips: [
      "Track all spending for one week before setting your budget.",
      "Use free apps like Mint or a spreadsheet to log expenses.",
      "Review your budget every two weeks and adjust.",
    ],
    keyTakeaways: [
      "50% of take-home pay goes to essentials (rent, food, transit).",
      "30% goes to wants (eating out, subscriptions, entertainment).",
      "20% goes directly to savings or debt repayment.",
    ],
  },
  {
    id: "credit-basics",
    title: "Credit Scores: What Students Need to Know",
    category: "credit",
    description:
      "Your credit score follows you for life. Learn what affects it and how to build it early.",
    estimatedMinutes: 7,
    xpReward: 75,
    tips: [
      "Get a student credit card with a low limit — use it for groceries only.",
      "Pay your balance IN FULL every month. Never just the minimum.",
      "Never miss a payment — set up autopay.",
    ],
    keyTakeaways: [
      "Payment history is 35% of your score — the biggest factor.",
      "Keep credit utilization under 30% of your limit.",
      "Length of credit history matters — start building yours now.",
    ],
  },
  {
    id: "emergency-fund",
    title: "Why Every Student Needs an Emergency Fund",
    category: "savings",
    description:
      "One unexpected expense can derail your whole month. Here's how to protect yourself.",
    estimatedMinutes: 5,
    xpReward: 50,
    tips: [
      "Start with a $500 emergency fund goal — it covers most surprises.",
      "Keep it in a separate account so you're not tempted to spend it.",
      "Only use it for true emergencies: car repair, medical, job loss.",
    ],
    keyTakeaways: [
      "Aim for 1–3 months of expenses saved as an emergency buffer.",
      "Even $20/week adds up to over $1,000 in a year.",
      "An emergency fund prevents you from going into debt when life happens.",
    ],
  },
  {
    id: "investing-young",
    title: "Why Investing at 20 is Your Superpower",
    category: "investing",
    description:
      "Compound interest is the eighth wonder of the world. Learn why starting now beats starting at 30.",
    estimatedMinutes: 8,
    xpReward: 100,
    tips: [
      "Open a TFSA (Canada) or Roth IRA (US) — they grow tax-free.",
      "Start with index funds like VFV or XEQT — low fees, diversified.",
      "Invest $25/month if that's all you have. Just start.",
    ],
    keyTakeaways: [
      "$100/month from age 20 becomes ~$350,000 by 65 at 7% growth.",
      "Index funds beat most actively managed funds over the long term.",
      "TFSA room in Canada: $7,000/year and unused room carries forward.",
    ],
  },
  {
    id: "student-taxes",
    title: "Student Taxes: Get Your Money Back",
    category: "taxes",
    description:
      "Most students leave money on the table at tax time. Learn about tuition credits, deductions, and refunds.",
    estimatedMinutes: 6,
    xpReward: 75,
    tips: [
      "Always file your taxes — even with no income. You build TFSA room.",
      "Claim your tuition tax credit using your T2202 from your school.",
      "Use free tax software: SimpleTax (Wealthsimple), TurboTax Free, etc.",
    ],
    keyTakeaways: [
      "Tuition credits can be carried forward or transferred to parents.",
      "Moving expenses for school may be deductible.",
      "Transit passes, textbooks, and interest on student loans may qualify.",
    ],
  },
  {
    id: "side-hustle-basics",
    title: "Side Hustle 101: Turn Skills into Cash",
    category: "side_hustles",
    description:
      "The best side hustle is one you can do between classes. Learn what works for students.",
    estimatedMinutes: 6,
    xpReward: 75,
    tips: [
      "Start with what you already know: tutoring, writing, design, coding.",
      "Use platforms like Fiverr, Upwork, or Kijiji to find your first client.",
      "Track all income — you may need to report it at tax time.",
    ],
    keyTakeaways: [
      "Tutoring pays $20–50/hr and has near-zero startup cost.",
      "Freelance writing and design can be done entirely remotely.",
      "Campus jobs offer flexibility and often count toward co-op credit.",
    ],
  },
  {
    id: "debt-paydown",
    title: "Paying Off Student Loans Without Losing Your Mind",
    category: "budgeting",
    description:
      "Student debt is manageable with a plan. Learn the snowball vs. avalanche strategies.",
    estimatedMinutes: 7,
    xpReward: 75,
    tips: [
      "Don't wait until graduation to start repaying — even $50/month helps.",
      "Pay off highest-interest debt first (avalanche method) to save the most.",
      "If you need motivation, pay off smallest balances first (snowball).",
    ],
    keyTakeaways: [
      "The avalanche method saves the most interest mathematically.",
      "The snowball method gives psychological wins that keep you going.",
      "Government student loans often have grace periods — know your terms.",
    ],
  },
  {
    id: "rrsp-tfsa",
    title: "TFSA vs RRSP: The Student Edition",
    category: "investing",
    description:
      "Two of Canada's most powerful savings tools. Learn which one makes more sense for students.",
    estimatedMinutes: 6,
    xpReward: 100,
    tips: [
      "As a student, start with TFSA — withdrawals are flexible and tax-free.",
      "RRSP is better once you have a higher income (post-graduation).",
      "You can hold savings accounts, ETFs, or stocks inside both accounts.",
    ],
    keyTakeaways: [
      "TFSA: contributions aren't deductible, but growth and withdrawals are tax-free.",
      "RRSP: contributions reduce taxable income — better when you earn more.",
      "Unused TFSA room carries forward indefinitely.",
    ],
  },
];

export function getModulesByCategory(
  category?: string
): EducationModule[] {
  if (!category) return EDUCATION_MODULES;
  return EDUCATION_MODULES.filter((m) => m.category === category);
}

export function getModuleById(id: string): EducationModule | undefined {
  return EDUCATION_MODULES.find((m) => m.id === id);
}

export function suggestNextModule(
  completedIds: string[]
): EducationModule | null {
  const incomplete = EDUCATION_MODULES.filter(
    (m) => !completedIds.includes(m.id)
  );
  // Prioritize high-xp modules first
  incomplete.sort((a, b) => b.xpReward - a.xpReward);
  return incomplete[0] ?? null;
}
