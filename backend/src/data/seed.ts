import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding UniWallet database...");

  // ─── Seed Profile ─────────────────────────────────────────────────────────
  const profile = await prisma.profile.upsert({
    where: { id: "seed-user-001" },
    update: {},
    create: {
      id: "seed-user-001",
      name: "Alex Chen",
      school: "Wilfrid Laurier University",
      studentType: "off_campus",
      currentBalance: 847.50,
      monthlyIncome: 1400,
      payFrequency: "biweekly",
      nextPayDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
      city: "Waterloo",
    },
  });
  console.log(`✅ Profile: ${profile.name} (id: ${profile.id})`);

  // ─── Seed Bills ───────────────────────────────────────────────────────────
  await prisma.bill.deleteMany({ where: { userId: profile.id } });

  const bills = await prisma.bill.createMany({
    data: [
      {
        userId: profile.id,
        name: "Rent",
        amount: 650,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        category: "rent",
        priority: "high",
        recurring: true,
        isPaid: false,
      },
      {
        userId: profile.id,
        name: "Hydro Bill",
        amount: 45,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        category: "utilities",
        priority: "high",
        recurring: true,
        isPaid: false,
      },
      {
        userId: profile.id,
        name: "Phone Plan",
        amount: 55,
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        category: "phone",
        priority: "medium",
        recurring: true,
        isPaid: false,
      },
      {
        userId: profile.id,
        name: "GRT Bus Pass",
        amount: 51,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        category: "transit",
        priority: "medium",
        recurring: true,
        isPaid: false,
      },
      {
        userId: profile.id,
        name: "Netflix",
        amount: 18,
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        category: "subscriptions",
        priority: "low",
        recurring: true,
        isPaid: false,
      },
      {
        userId: profile.id,
        name: "Spotify",
        amount: 11,
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        category: "subscriptions",
        priority: "low",
        recurring: true,
        isPaid: true,
      },
    ],
  });
  console.log(`✅ Bills: ${bills.count} created`);

  // ─── Seed Savings Goals ───────────────────────────────────────────────────
  await prisma.savingsGoal.deleteMany({ where: { userId: profile.id } });

  const emergencyFund = await prisma.savingsGoal.create({
    data: {
      userId: profile.id,
      title: "Emergency Fund",
      description: "3 months of living expenses buffer",
      targetAmount: 2000,
      currentAmount: 320,
      targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      category: "emergency",
      savingMethod: "fixed_weekly",
      autoSaveAmount: 25,
      autoSaveFreq: "weekly",
      isActive: true,
    },
  });

  await prisma.savingsContribution.createMany({
    data: [
      { goalId: emergencyFund.id, amount: 100, note: "First contribution", contributedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { goalId: emergencyFund.id, amount: 100, note: "Weekly save", contributedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) },
      { goalId: emergencyFund.id, amount: 120, note: "Side hustle earnings", contributedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    ],
  });

  await prisma.savingsGoal.create({
    data: {
      userId: profile.id,
      title: "New Laptop",
      description: "MacBook Air for school and dev work",
      targetAmount: 1400,
      currentAmount: 175,
      targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      category: "tech",
      savingMethod: "percentage",
      autoSaveAmount: 70,
      autoSaveFreq: "biweekly",
      isActive: true,
    },
  });

  await prisma.savingsGoal.create({
    data: {
      userId: profile.id,
      title: "TFSA Investment",
      description: "Start investing in index funds",
      targetAmount: 500,
      currentAmount: 0,
      category: "education",
      savingMethod: "manual",
      isActive: true,
    },
  });

  console.log(`✅ Savings goals: 3 created`);

  // ─── Seed Education Progress ───────────────────────────────────────────────
  await prisma.educationProgress.deleteMany({ where: { userId: profile.id } });

  await prisma.educationProgress.createMany({
    data: [
      {
        userId: profile.id,
        moduleId: "budgeting-101",
        title: "Budgeting 101: The 50/30/20 Rule",
        category: "budgeting",
        completed: true,
        completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        xpEarned: 50,
      },
      {
        userId: profile.id,
        moduleId: "emergency-fund",
        title: "Why Every Student Needs an Emergency Fund",
        category: "savings",
        completed: true,
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        xpEarned: 50,
      },
    ],
  });
  console.log(`✅ Education progress: 2 completed modules`);

  // ─── Seed Challenge ────────────────────────────────────────────────────────
  await prisma.challenge.deleteMany({ where: { userId: profile.id } });

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  await prisma.challenge.create({
    data: {
      userId: profile.id,
      title: "Takeout Budget",
      description: "Keep takeout and dining spending under $30 this week. Cook at home as much as possible.",
      progress: 12,
      target: 30,
      streak: 2,
      rewardLabel: "🍳 Home Chef Badge",
      status: "active",
      weekStart,
    },
  });
  console.log(`✅ Challenge: seeded`);

  console.log(`\n🎉 Seed complete! Test user ID: ${profile.id}`);
  console.log(`👉 Try: GET http://localhost:3001/api/dashboard/${profile.id}\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
