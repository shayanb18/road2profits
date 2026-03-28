import { Response } from "express";
import { ApiResponse } from "../types";

export function ok<T>(res: Response, data: T, status = 200): void {
  const body: ApiResponse<T> = { success: true, data, error: null };
  res.status(status).json(body);
}

export function fail(res: Response, message: string, status = 400): void {
  const body: ApiResponse<null> = {
    success: false,
    data: null,
    error: { message },
  };
  res.status(status).json(body);
}

export function serverError(res: Response, err: unknown): void {
  const message =
    err instanceof Error ? err.message : "An unexpected error occurred";
  console.error("[SERVER ERROR]", err);
  const body: ApiResponse<null> = {
    success: false,
    data: null,
    error: { message },
  };
  res.status(500).json(body);
}
