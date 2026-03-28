import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { ok, fail, serverError } from "../lib/response";
import { validate } from "../middleware/validate";
import { CreateBillSchema, UpdateBillSchema } from "../middleware/schemas";

const router = Router();

function formatBill(bill: any) {
  return {
    ...bill,
    dueDate: new Date(bill.dueDate).toISOString(),
    createdAt: new Date(bill.createdAt).toISOString(),
    updatedAt: new Date(bill.updatedAt).toISOString(),
  };
}

// GET /api/bills/:userId
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const { paid } = req.query;
    const where: any = { userId: req.params.userId };
    if (paid === "true") where.isPaid = true;
    if (paid === "false") where.isPaid = false;

    const bills = await prisma.bill.findMany({
      where,
      orderBy: { dueDate: "asc" },
    });
    return ok(res, bills.map(formatBill));
  } catch (err) {
    return serverError(res, err);
  }
});

// POST /api/bills
router.post("/", validate(CreateBillSchema), async (req: Request, res: Response) => {
  try {
    const bill = await prisma.bill.create({
      data: {
        ...req.body,
        dueDate: new Date(req.body.dueDate),
      },
    });
    return ok(res, formatBill(bill), 201);
  } catch (err) {
    return serverError(res, err);
  }
});

// PUT /api/bills/:billId
router.put("/:billId", validate(UpdateBillSchema), async (req: Request, res: Response) => {
  try {
    const existing = await prisma.bill.findUnique({
      where: { id: req.params.billId },
    });
    if (!existing) return fail(res, "Bill not found", 404);

    const body = req.body;
    const bill = await prisma.bill.update({
      where: { id: req.params.billId },
      data: {
        ...body,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      },
    });

    return ok(res, formatBill(bill));
  } catch (err) {
    return serverError(res, err);
  }
});

// DELETE /api/bills/:billId
router.delete("/:billId", async (req: Request, res: Response) => {
  try {
    const existing = await prisma.bill.findUnique({
      where: { id: req.params.billId },
    });
    if (!existing) return fail(res, "Bill not found", 404);

    await prisma.bill.delete({ where: { id: req.params.billId } });
    return ok(res, { deleted: true });
  } catch (err) {
    return serverError(res, err);
  }
});

// POST /api/bills/:billId/pay
router.post("/:billId/pay", async (req: Request, res: Response) => {
  try {
    const bill = await prisma.bill.update({
      where: { id: req.params.billId },
      data: { isPaid: true },
    });
    return ok(res, formatBill(bill));
  } catch (err) {
    return serverError(res, err);
  }
});

export default router;
