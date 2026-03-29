import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { ok, fail, serverError } from "../lib/response";
import { formatSavingsGoal, SAVING_METHOD_DESCRIPTIONS } from "../services/savings.service";
import { validate } from "../middleware/validate";
import { CreateSavingsGoalSchema, UpdateSavingsGoalSchema, ContributionSchema } from "../middleware/schemas";
import { SavingsGoalInput, ContributionInput } from "../types";

const router = Router();

// GET /api/savings/:userId
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const goals = await prisma.savingsGoal.findMany({
      where: { userId: req.params.userId },
      orderBy: { createdAt: "asc" },
    });
    return ok(res, goals.map(formatSavingsGoal));
  } catch (err) {
    return serverError(res, err);
  }
});

// GET /api/savings/:userId/:goalId
router.get("/:userId/:goalId", async (req: Request, res: Response) => {
  try {
    const goal = await prisma.savingsGoal.findFirst({
      where: { id: req.params.goalId, userId: req.params.userId },
      include: { contributions: { orderBy: { contributedAt: "desc" }, take: 10 } },
    });
    if (!goal) return fail(res, "Savings goal not found", 404);

    return ok(res, {
      ...formatSavingsGoal(goal),
      recentContributions: goal.contributions.map((c: { id: string; amount: number; note: string | null; contributedAt: Date }) => ({
        id: c.id,
        amount: c.amount,
        note: c.note,
        contributedAt: c.contributedAt.toISOString(),
      })),
    });
  } catch (err) {
    return serverError(res, err);
  }
});

// POST /api/savings — create goal
router.post("/", validate(CreateSavingsGoalSchema), async (req: Request, res: Response) => {
  try {
    const body: SavingsGoalInput = req.body;
    const { userId, title, targetAmount } = body;

    if (!userId || !title || !targetAmount) {
      return fail(res, "Missing required fields: userId, title, targetAmount");
    }

    const goal = await prisma.savingsGoal.create({
      data: {
        userId,
        title,
        description: body.description ?? "",
        targetAmount,
        currentAmount: 0,
        targetDate: body.targetDate ? new Date(body.targetDate) : null,
        category: body.category ?? "general",
        savingMethod: body.savingMethod ?? "manual",
        autoSaveAmount: body.autoSaveAmount ?? null,
        autoSaveFreq: body.autoSaveFreq ?? null,
        isActive: true,
      },
    });

    return ok(res, formatSavingsGoal(goal), 201);
  } catch (err) {
    return serverError(res, err);
  }
});

// PUT /api/savings/:goalId — update goal
router.put("/:goalId", validate(UpdateSavingsGoalSchema), async (req: Request, res: Response) => {
  try {
    const existing = await prisma.savingsGoal.findUnique({
      where: { id: req.params.goalId },
    });
    if (!existing) return fail(res, "Savings goal not found", 404);

    const body = req.body;
    const goal = await prisma.savingsGoal.update({
      where: { id: req.params.goalId },
      data: {
        ...body,
        targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
      },
    });

    return ok(res, formatSavingsGoal(goal));
  } catch (err) {
    return serverError(res, err);
  }
});

// DELETE /api/savings/:goalId
router.delete("/:goalId", async (req: Request, res: Response) => {
  try {
    const existing = await prisma.savingsGoal.findUnique({
      where: { id: req.params.goalId },
    });
    if (!existing) return fail(res, "Savings goal not found", 404);

    await prisma.savingsGoal.delete({ where: { id: req.params.goalId } });
    return ok(res, { deleted: true });
  } catch (err) {
    return serverError(res, err);
  }
});

// POST /api/savings/:goalId/contribute — add contribution
router.post("/:goalId/contribute", validate(ContributionSchema), async (req: Request, res: Response) => {
  try {
    const { amount, note }: ContributionInput = req.body;

    const goal = await prisma.savingsGoal.findUnique({
      where: { id: req.params.goalId },
    });
    if (!goal) return fail(res, "Savings goal not found", 404);

    const [contribution, updatedGoal] = await prisma.$transaction([
      prisma.savingsContribution.create({
        data: { goalId: req.params.goalId, amount, note: note ?? null },
      }),
      prisma.savingsGoal.update({
        where: { id: req.params.goalId },
        data: { currentAmount: { increment: amount } },
      }),
    ]);

    return ok(res, {
      contribution: {
        id: contribution.id,
        amount: contribution.amount,
        note: contribution.note,
        contributedAt: contribution.contributedAt.toISOString(),
      },
      goal: formatSavingsGoal(updatedGoal),
    });
  } catch (err) {
    return serverError(res, err);
  }
});

// GET /api/savings/methods — return all saving method descriptions
router.get("/meta/methods", async (_req: Request, res: Response) => {
  try {
    const methods = Object.entries(SAVING_METHOD_DESCRIPTIONS).map(
      ([id, description]) => ({ id, description })
    );
    return ok(res, methods);
  } catch (err) {
    return serverError(res, err);
  }
});

export default router;
