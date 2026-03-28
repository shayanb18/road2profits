import { Router, Request, Response } from "express";
import { ok, serverError } from "../lib/response";
import { filterSideHustles } from "../data/sideHustles";

const router = Router();

// GET /api/side-hustles?city=Toronto&mode=remote&tags=creative,remote
router.get("/", async (req: Request, res: Response) => {
  try {
    const { city, mode, tags, limit } = req.query;

    const tagList = tags
      ? (tags as string).split(",").map((t) => t.trim())
      : undefined;

    const results = filterSideHustles({
      city: city as string | undefined,
      mode: mode as string | undefined,
      tags: tagList,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    return ok(res, results);
  } catch (err) {
    return serverError(res, err);
  }
});

export default router;
