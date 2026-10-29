import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { ok, fail, serverError } from "../lib/response";
import { computeForecast } from "../services/forecast.service";
import { generateChallenge, formatChallenge } from "../services/challenge.service";
import { validate } from "../middleware/validate";
import { StartChallengeSchema, UpdateProgressSchema } from "../middleware/schemas";

const router = Router();

// GET /api/challenge/:userId
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: req.params.userId },
    });
    if (!profile) return fail(res, "Profile not found", 404);

    // Find active challenge this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
    weekStart.setHours(0, 0, 0, 0);

    let challenge = await prisma.challenge.findFirst({
      where: {
        userId: req.params.userId,
        weekStart: { gte: weekStart },
        status: "active",
      },
    });

    if (!challenge) {
      const bills = await prisma.bill.findMany({
        where: { userId: req.params.userId },
      });
      const insight = computeForecast(
        profile.currentBalance,
        profile.nextPayDate,
        bills
      );

      const template = generateChallenge(insight);

      // Get streak from previous challenge
      const prev = await prisma.challenge.findFirst({
        where: { userId: req.params.userId },
        orderBy: { createdAt: "desc" },
      });
      const streak = prev?.status === "completed" ? (prev.streak + 1) : 0;

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

    return ok(res, formatChallenge(challenge));
  } catch (err) {
    return serverError(res, err);
  }
});

// PUT /api/challenge/:challengeId/progress
router.put("/:challengeId/progress", validate(UpdateProgressSchema), async (req: Request, res: Response) => {
  try {
    const { progress } = req.body;
    if (progress === undefined) return fail(res, "Missing field: progress");

    const challenge = await prisma.challenge.findUnique({
      where: { id: req.params.challengeId },
    });
    if (!challenge) return fail(res, "Challenge not found", 404);

    const newProgress = Math.min(progress, challenge.target);
    const newStatus =
      newProgress >= challenge.target ? "completed" : challenge.status;

    const updated = await prisma.challenge.update({
      where: { id: req.params.challengeId },
      data: { progress: newProgress, status: newStatus },
    });

    return ok(res, formatChallenge(updated));
  } catch (err) {
    return serverError(res, err);
  }
});

// GET /api/challenge/:userId/current
// The user's latest challenge (active or completed), or null if they have none or gave it up.
// Unlike GET /:userId, this never creates one.
router.get("/:userId/current", async (req: Request, res: Response) => {
  try {
    const latest = await prisma.challenge.findFirst({
      where: { userId: req.params.userId },
      orderBy: { createdAt: "desc" },
    });
    const current = latest && latest.status !== "skipped" ? formatChallenge(latest) : null;
    return ok(res, { challenge: current });
  } catch (err) {
    return serverError(res, err);
  }
});

// POST /api/challenge — start a challenge the user picked. Any active one is marked skipped.
router.post("/", validate(StartChallengeSchema), async (req: Request, res: Response) => {
  try {
    const { userId, title, description, target } = req.body;
    const profile = await prisma.profile.findUnique({ where: { id: userId } });
    if (!profile) return fail(res, "Profile not found", 404);

    const prev = await prisma.challenge.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    await prisma.challenge.updateMany({
      where: { userId, status: "active" },
      data: { status: "skipped" },
    });
    const challenge = await prisma.challenge.create({
      data: {
        userId,
        title,
        description,
        target,
        progress: 0,
        streak: prev?.status === "completed" ? prev.streak + 1 : 0,
        rewardLabel: "",
        status: "active",
        weekStart: new Date(),
      },
    });
    return ok(res, formatChallenge(challenge), 201);
  } catch (err) {
    return serverError(res, err);
  }
});

// POST /api/challenge/:challengeId/skip — give up on a challenge
router.post("/:challengeId/skip", async (req: Request, res: Response) => {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: req.params.challengeId },
    });
    if (!challenge) return fail(res, "Challenge not found", 404);

    const updated = await prisma.challenge.update({
      where: { id: req.params.challengeId },
      data: { status: "skipped" },
    });
    return ok(res, formatChallenge(updated));
  } catch (err) {
    return serverError(res, err);
  }
});

export default router;
