import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { ok, fail, serverError } from "../lib/response";
import {
  EDUCATION_MODULES,
  getModulesByCategory,
  getModuleById,
  suggestNextModule,
} from "../services/education.service";
import { EducationCategory } from "../types";

const router = Router();

// GET /api/education/modules?category=budgeting
router.get("/modules", async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const modules = getModulesByCategory(category as string | undefined);
    return ok(res, modules);
  } catch (err) {
    return serverError(res, err);
  }
});

// GET /api/education/modules/:moduleId
router.get("/modules/:moduleId", async (req: Request, res: Response) => {
  try {
    const module = getModuleById(req.params.moduleId);
    if (!module) return fail(res, "Module not found", 404);
    return ok(res, module);
  } catch (err) {
    return serverError(res, err);
  }
});

// GET /api/education/:userId — user's progress summary
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: req.params.userId },
    });
    if (!profile) return fail(res, "Profile not found", 404);

    const progressRecords = await prisma.educationProgress.findMany({
      where: { userId: req.params.userId },
    });

    const progressMap = new Map(progressRecords.map((p) => [p.moduleId, p]));
    const completedIds = progressRecords
      .filter((p) => p.completed)
      .map((p) => p.moduleId);
    const totalXp = progressRecords.reduce((sum: number, p) => sum + p.xpEarned, 0);

    // Category breakdown
    const categories: EducationCategory[] = [
      "budgeting", "credit", "investing", "taxes", "side_hustles", "savings",
    ];
    const categoryProgress: Record<string, { completed: number; total: number }> = {};
    for (const cat of categories) {
      const catModules = EDUCATION_MODULES.filter((m) => m.category === cat);
      const catCompleted = catModules.filter((m) => completedIds.includes(m.id));
      categoryProgress[cat] = {
        completed: catCompleted.length,
        total: catModules.length,
      };
    }

    const modulesWithProgress = EDUCATION_MODULES.map((module) => {
      const progress = progressMap.get(module.id);
      return {
        ...module,
        progress: progress
          ? {
              moduleId: progress.moduleId,
              title: progress.title,
              category: progress.category as EducationCategory,
              completed: progress.completed,
              completedAt: progress.completedAt
                ? progress.completedAt.toISOString()
                : null,
              xpEarned: progress.xpEarned,
            }
          : null,
      };
    });

    const nextSuggestedModule = suggestNextModule(completedIds);

    return ok(res, {
      totalXp,
      completedModules: completedIds.length,
      totalModules: EDUCATION_MODULES.length,
      modules: modulesWithProgress,
      categoryProgress,
      nextSuggestedModule,
    });
  } catch (err) {
    return serverError(res, err);
  }
});

// POST /api/education/:userId/complete/:moduleId — mark module as complete
router.post("/:userId/complete/:moduleId", async (req: Request, res: Response) => {
  try {
    const module = getModuleById(req.params.moduleId);
    if (!module) return fail(res, "Module not found", 404);

    const profile = await prisma.profile.findUnique({
      where: { id: req.params.userId },
    });
    if (!profile) return fail(res, "Profile not found", 404);

    const existing = await prisma.educationProgress.findFirst({
      where: { userId: req.params.userId, moduleId: req.params.moduleId },
    });

    let progress;
    if (existing) {
      if (existing.completed) {
        return ok(res, {
          alreadyCompleted: true,
          message: "Module already completed",
          progress: {
            moduleId: existing.moduleId,
            title: existing.title,
            category: existing.category as EducationCategory,
            completed: existing.completed,
            completedAt: existing.completedAt?.toISOString() ?? null,
            xpEarned: existing.xpEarned,
          },
        });
      }
      progress = await prisma.educationProgress.update({
        where: { id: existing.id },
        data: {
          completed: true,
          completedAt: new Date(),
          xpEarned: module.xpReward,
        },
      });
    } else {
      progress = await prisma.educationProgress.create({
        data: {
          userId: req.params.userId,
          moduleId: module.id,
          title: module.title,
          category: module.category,
          completed: true,
          completedAt: new Date(),
          xpEarned: module.xpReward,
        },
      });
    }

    return ok(res, {
      alreadyCompleted: false,
      xpEarned: module.xpReward,
      message: `🎉 Nice work! You earned ${module.xpReward} XP for completing "${module.title}"`,
      progress: {
        moduleId: progress.moduleId,
        title: progress.title,
        category: progress.category as EducationCategory,
        completed: progress.completed,
        completedAt: progress.completedAt?.toISOString() ?? null,
        xpEarned: progress.xpEarned,
      },
    });
  } catch (err) {
    return serverError(res, err);
  }
});

export default router;
