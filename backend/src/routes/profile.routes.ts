import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { ok, fail, serverError } from "../lib/response";
import { validate } from "../middleware/validate";
import { CreateProfileSchema, UpdateProfileSchema } from "../middleware/schemas";

const router = Router();

function formatProfile(p: {
  id: string; name: string; school: string; studentType: string;
  currentBalance: number; monthlyIncome: number; payFrequency: string;
  nextPayDate: Date; city: string; createdAt: Date; updatedAt: Date;
}) {
  return {
    ...p,
    nextPayDate: p.nextPayDate.toISOString(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

// GET /api/profile/:userId
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { id: req.params.userId } });
    if (!profile) return fail(res, "Profile not found", 404);
    return ok(res, formatProfile(profile));
  } catch (err) {
    return serverError(res, err);
  }
});

// POST /api/profile — create
router.post("/", validate(CreateProfileSchema), async (req: Request, res: Response) => {
  try {
    const profile = await prisma.profile.create({
      data: { ...req.body, nextPayDate: new Date(req.body.nextPayDate) },
    });
    return ok(res, formatProfile(profile), 201);
  } catch (err) {
    return serverError(res, err);
  }
});

// PUT /api/profile/:userId — update
router.put("/:userId", validate(UpdateProfileSchema), async (req: Request, res: Response) => {
  try {
    const existing = await prisma.profile.findUnique({ where: { id: req.params.userId } });
    if (!existing) return fail(res, "Profile not found", 404);

    const profile = await prisma.profile.update({
      where: { id: req.params.userId },
      data: { ...req.body, nextPayDate: req.body.nextPayDate ? new Date(req.body.nextPayDate) : undefined },
    });
    return ok(res, formatProfile(profile));
  } catch (err) {
    return serverError(res, err);
  }
});

export default router;
