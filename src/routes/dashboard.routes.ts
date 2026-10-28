import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { ok, fail, serverError } from "../lib/response";
import { computeForecast } from "../services/forecast.service";
import { generateChallenge, formatChallenge } from "../services/challenge.service";
import { formatSavingsGoal } from "../services/savings.service";
import { filterSideHustles } from "../data/sideHustles";
import { EDUCATION_MODULES, suggestNextModule } from "../services/education.service";

const router = Router();

// GET /api/dashboard/:userId
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: req.params.userId },
    });
    if (!profile) return fail(res, "Profile not found", 404);

    // Fetch all data in parallel
    const [bills, savingsGoals, educationProgress, recentChat] =
      await Promise.all([
        prisma.bill.findMany({
          where: { userId: req.params.userId },
          orderBy: { dueDate: "asc" },
        }),
        prisma.savingsGoal.findMany({
          where: { userId: req.params.userId, isActive: true },
          orderBy: { createdAt: "asc" },
        }),
        prisma.educationProgress.findMany({
          where: { userId: req.params.userId },
        }),
        prisma.chatMessage.findFirst({
          where: { userId: req.params.userId, role: "assistant" },
          orderBy: { timestamp: "desc" },
        }),
      ]);

    // Budget insight
    const insight = computeForecast(
      profile.currentBalance,
      profile.nextPayDate,
      bills
    );

    // Active challenge (create if needed)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    let challenge = await prisma.challenge.findFirst({
      where: {
        userId: req.params.userId,
        weekStart: { gte: weekStart },
        status: "active",
      },
    });

    if (!challenge) {
      const template = generateChallenge(insight);
      const prev = await prisma.challenge.findFirst({
        where: { userId: req.params.userId },
        orderBy: { createdAt: "desc" },
      });
      const streak = prev?.status === "completed" ? prev.streak + 1 : 0;

      challenge = await prisma.challenge.create({
        data: {
          userId: req.params.userId,
          title: template.title,
          description: template.description,
          progress: 0,
          target: template.target,
          streak,
          rewardLabel: template.rewardLabel,
          status: "active",
          weekStart,
        },
      });
    }

    // Upcoming unpaid bills (next 14 days)
    const twoWeeksOut = new Date();
    twoWeeksOut.setDate(twoWeeksOut.getDate() + 14);
    const upcomingBills = bills
      .filter((b: { isPaid: boolean; dueDate: Date }) => !b.isPaid && new Date(b.dueDate) <= twoWeeksOut)
      .map((b: {
        id: string; userId: string; name: string; amount: number;
        dueDate: Date; category: string; priority: string;
        recurring: boolean; isPaid: boolean; createdAt: Date; updatedAt: Date;
      }) => ({
        id: b.id,
        userId: b.userId,
        name: b.name,
        amount: b.amount,
        dueDate: b.dueDate.toISOString(),
        category: b.category,
        priority: b.priority,
        recurring: b.recurring,
        isPaid: b.isPaid,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      }));

    // Side hustles — show if warning/over_budget
    const sideHustles =
      insight.status !== "safe"
        ? filterSideHustles({ city: profile.city, limit: 3 })
        : [];

    // Education summary
    const completedIds = educationProgress
      .filter((p: { completed: boolean }) => p.completed)
      .map((p: { moduleId: string }) => p.moduleId);
    const totalXp = educationProgress.reduce(
      (sum: number, p: { xpEarned: number }) => sum + p.xpEarned, 0
    );
    const nextSuggestedModule = suggestNextModule(completedIds);

    return ok(res, {
      profile: {
        id: profile.id,
        name: profile.name,
        school: profile.school,
        studentType: profile.studentType,
        currentBalance: profile.currentBalance,
        monthlyIncome: profile.monthlyIncome,
        payFrequency: profile.payFrequency,
        nextPayDate: profile.nextPayDate.toISOString(),
        city: profile.city,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
      },
      budgetInsight: insight,
      upcomingBills,
      activeChallenge: formatChallenge(challenge),
      savingsGoals: savingsGoals.map(formatSavingsGoal),
      sideHustles,
      educationSummary: {
        totalXp,
        completedModules: completedIds.length,
        totalModules: EDUCATION_MODULES.length,
        nextSuggestedModule,
      },
      recentChatMessage: recentChat
        ? {
            id: recentChat.id,
            userId: recentChat.userId,
            role: recentChat.role,
            content: recentChat.content,
            timestamp: recentChat.timestamp.toISOString(),
          }
        : null,
    });
  } catch (err) {
    return serverError(res, err);
  }
});

export default router;
