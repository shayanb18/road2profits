import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { ok, fail, serverError } from "../lib/response";
import { computeForecast } from "../services/forecast.service";

const router = Router();

// POST /api/forecast/:userId
router.post("/:userId", async (req: Request, res: Response) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: req.params.userId },
    });
    if (!profile) return fail(res, "Profile not found", 404);

    const bills = await prisma.bill.findMany({
      where: { userId: req.params.userId },
    });

    const insight = computeForecast(
      profile.currentBalance,
      profile.nextPayDate,
      bills
    );

    return ok(res, insight);
  } catch (err) {
    return serverError(res, err);
  }
});

export default router;
