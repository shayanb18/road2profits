import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { openai } from "../lib/openai";
import { ok, fail, serverError } from "../lib/response";
import { computeForecast } from "../services/forecast.service";
import { validate } from "../middleware/validate";
import { ChatSchema } from "../middleware/schemas";
import { rateLimit } from "../middleware/rateLimit";
import { ChatInput } from "../types";

const router = Router();

// POST /api/ai/chat
router.post(
  "/chat",
  rateLimit({ windowMs: 60_000, max: 10, keyFn: (req) => req.body?.userId ?? req.ip ?? "anon" }),
  validate(ChatSchema),
  async (req: Request, res: Response) => {
  try {
    const { userId, message }: ChatInput = req.body;
    if (!userId || !message) {
      return fail(res, "Missing required fields: userId, message");
    }

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
    });
    if (!profile) return fail(res, "Profile not found", 404);

    const bills = await prisma.bill.findMany({ where: { userId } });
    const insight = computeForecast(
      profile.currentBalance,
      profile.nextPayDate,
      bills
    );

    const recentMessages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: 6,
    });

    const history = recentMessages
      .reverse()
      .map((m: { role: string; content: string }) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const unpaidBills = bills.filter((b) => !b.isPaid);
    const financialContext = `
Student Financial Summary:
- Name: ${profile.name}
- School: ${profile.school}
- Living situation: ${profile.studentType}
- City: ${profile.city}
- Current balance: $${profile.currentBalance.toFixed(2)}
- Monthly income: $${profile.monthlyIncome.toFixed(2)}
- Pay frequency: ${profile.payFrequency}
- Days until next payday: ${insight.daysUntilNextPay}
- Budget status: ${insight.status}
- Projected balance after upcoming bills: $${insight.projectedBalance.toFixed(2)}
- Total unpaid bills: $${insight.totalUnpaidBills.toFixed(2)}
- Upcoming unpaid bills: ${unpaidBills.map((b) => `${b.name} ($${b.amount} due ${new Date(b.dueDate).toLocaleDateString()})`).join(", ") || "None"}
- Budget recommendations: ${insight.recommendations.join(" | ")}
`.trim();

    const systemPrompt = `You are UniWallet's AI financial coach — a supportive, direct, and student-friendly money advisor.

The student's financial context is provided below. Use it to give personalized, grounded advice.
DO NOT invent numbers. All math is pre-computed. Just explain and advise clearly.

Rules:
- Keep responses SHORT (2–4 sentences max)
- Be supportive but honest
- Use plain English, no jargon
- Give actionable next steps
- Never lecture or moralize
- If they're doing well, acknowledge it

${financialContext}`;

    await prisma.chatMessage.create({
      data: { userId, role: "user", content: message },
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const aiText =
      completion.choices[0]?.message?.content ?? "I couldn't generate a response. Please try again.";

    const saved = await prisma.chatMessage.create({
      data: { userId, role: "assistant", content: aiText },
    });

    return ok(res, {
      message: {
        id: saved.id,
        userId: saved.userId,
        role: saved.role,
        content: saved.content,
        timestamp: saved.timestamp.toISOString(),
      },
    });
  } catch (err) {
    return serverError(res, err);
  }
}
);

// GET /api/ai/history/:userId
router.get("/history/:userId", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const messages = await prisma.chatMessage.findMany({
      where: { userId: req.params.userId },
      orderBy: { timestamp: "asc" },
      take: limit,
    });

    return ok(
      res,
      messages.map((m: { id: string; userId: string; role: string; content: string; timestamp: Date }) => ({
        ...m,
        timestamp: m.timestamp.toISOString(),
      }))
    );
  } catch (err) {
    return serverError(res, err);
  }
});

export default router;
