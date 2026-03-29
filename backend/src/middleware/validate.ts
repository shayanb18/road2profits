import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { fail } from "../lib/response";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = (result.error as ZodError).errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      fail(res, `Validation error — ${errors}`, 422);
      return;
    }
    req.body = result.data;
    next();
  };
}
