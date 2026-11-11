"use client";

import { daysUntil, formatDay } from "@/lib/dates";
import { useState, useRef, useEffect, useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Loading } from "@/components/Loading";
import { useProfile } from "@/hooks/useProfile";
import { computeForecast } from "@/lib/forecast";
import { FinancialProfile, ForecastResult } from "@/types";
import { api, getUserId } from "@/lib/api";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

// ─── Rule-based fallback, used when the AI coach endpoint is unavailable ──────

function getCoachResponse(
  message: string,
  profile: FinancialProfile,
  forecast: ForecastResult
): string {
  const msg = message.toLowerCase();
  const balance = profile.currentBalance.toFixed(2);
  const projected = forecast.projectedBalance.toFixed(2);
  const payDate = formatDay(forecast.nextPayDate, {
    month: "short",
    day: "numeric",
  });
  const unpaid = profile.bills.filter((b) => !b.paid);
  const lowBills = unpaid.filter((b) => b.priority === "low");

  if (msg.includes("broke") || msg.includes("money")) {
    const statusLine = {
      safe: `Good news — you're not broke. You've got $${balance} right now.`,
      warning: `You're not broke yet, but it's tight. You have $${balance} but your bills will eat most of it.`,
      over_budget: `Honestly? Yes, it's rough. You have $${balance} but you need more than that to cover your bills.`,
    }[forecast.status];
    return `${statusLine} Before your next payday on ${payDate}, you're projected to have ${forecast.projectedBalance < 0 ? `-$${Math.abs(forecast.projectedBalance).toFixed(2)}` : `$${projected}`}.`;
  }

  if (msg.includes("afford")) {
    if (forecast.projectedBalance < 0) {
      return `Short answer: not everything. You're projected to be $${forecast.amountOver.toFixed(2)} short before payday on ${payDate}. You'll need to delay or skip some non-essential bills.`;
    }
    return `After your upcoming bills, you should have $${projected} left before payday on ${payDate}. Stick to essentials and you'll be fine.`;
  }

  if (msg.includes("cut") || msg.includes("save")) {
    if (lowBills.length === 0) {
      return "All your bills are medium or high priority — nothing obvious to cut right now. If you need to free up cash, look at your daily spending habits.";
    }
    const savings = lowBills.reduce((s, b) => s + b.amount, 0);
    const list = lowBills.map((b) => `${b.name} ($${b.amount})`).join(", ");
    return `Your low-priority bills are: ${list}. Cutting all of them saves you $${savings} before payday. Honestly, do it.`;
  }

  if (msg.includes("rent") || msg.includes("housing")) {
    const rent = unpaid.find(
      (b) => b.name.toLowerCase().includes("rent") || b.priority === "high"
    );
    if (rent) {
      const pct = Math.round((rent.amount / profile.currentBalance) * 100);
      return `Your ${rent.name} is $${rent.amount} — that's ${pct}% of your current balance. ${pct > 60 ? "That's a huge chunk. You really can't afford to delay it." : "It's your biggest bill. Pay it first."}`;
    }
    return "I don't see a rent bill in your list. If you have one, add it to get more accurate advice.";
  }

  if (msg.includes("payday") || msg.includes("pay day") || msg.includes("next pay")) {
    const days = daysUntil(forecast.nextPayDate);
    return `Your next payday is ${payDate} — ${days > 0 ? `${days} day${days !== 1 ? "s" : ""} away` : "today!"}. ${days > 7 ? "That's a while. Be careful with spending." : days > 3 ? "Almost there. Stay disciplined." : "Nearly there — hold tight."}`;
  }

  // Default summary
  const statusSummary = {
    safe: `Your finances look okay right now.`,
    warning: `You're cutting it close before payday — not broke, but tight.`,
    over_budget: `You're projected to run short before payday.`,
  }[forecast.status];

  const biggestBill = unpaid.reduce<typeof unpaid[0] | null>(
    (max, b) => (!max || b.amount > max.amount ? b : max),
    null
  );

  return `${statusSummary} You have $${balance} right now and you're projected to have ${forecast.projectedBalance < 0 ? `-$${Math.abs(forecast.projectedBalance).toFixed(2)}` : `$${projected}`} before payday on ${payDate}. ${biggestBill ? `Your biggest bill is ${biggestBill.name} at $${biggestBill.amount}.` : ""} What do you want to know?`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "coach";
  text: string;
}

const SUGGESTED_PROMPTS = ["Why am I broke?", "What should I cut?", "Can I afford anything?", "When's my payday?"];

function CoachAvatar() {
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-3 mt-0.5"
      style={{ background: "var(--uw-raised)", color: "var(--uw-accent-text)", border: "1px solid var(--uw-line)" }}
    >
      <ChatBubbleLeftRightIcon aria-hidden className="w-3.5 h-3.5" />
    </div>
  );
}


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CoachPage() {
  const { profile, ready, error } = useProfile();
  const forecast = useMemo(() => (profile ? computeForecast(profile) : null), [profile]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [aiDown, setAiDown] = useState(false);
  const nextId = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function send(text: string) {
    const userId = getUserId();
    if (!text.trim() || !profile || !forecast || !userId || typing) return;
    setMessages((m) => [...m, { id: String(nextId.current++), role: "user", text: text.trim() }]);
    setInput("");
    setTyping(true);
    let reply: string;
    try {
      reply = (await api.ai.chat(userId, text.trim())).message.content;
      setAiDown(false);
    } catch {
      reply = getCoachResponse(text, profile, forecast);
      setAiDown(true);
    }
    setMessages((m) => [...m, { id: String(nextId.current++), role: "coach", text: reply }]);
    setTyping(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  if (!ready || !forecast || !profile) return <Loading error={error} />;

  const statusLine = {
    safe: "Your finances look solid right now. You're on track.",
    warning: "Heads up: your balance will be tight before payday.",
    over_budget: "Your numbers aren't looking great before payday. Let's figure it out.",
  }[forecast.status];
  const greeting: Message = {
    id: "greeting",
    role: "coach",
    text: `Hey. I'm your money coach. No fluff, just straight talk. ${statusLine} Ask me anything.`,
  };

  return (
    <div className="flex flex-col md:flex-row h-dvh overflow-hidden font-sans" style={{ background: "var(--uw-bg)", color: "var(--uw-ink)" }}>
      <Sidebar balance={profile?.currentBalance} />

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div
          className="flex items-end justify-between gap-4 px-5 md:px-10 pt-8 md:pt-10 pb-4 shrink-0"
        >
          <div>
            <h1 className="text-[32px] md:text-[40px] leading-[1.08] font-normal tracking-[-0.035em] text-[var(--uw-ink)] mb-2">Money coach</h1>
            <p className="text-[16px]" style={{ color: "var(--uw-muted)" }}>Answers use your own balance, bills and payday.</p>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={aiDown ? { background: "var(--uw-surface)", border: "1px solid var(--uw-line)" } : { background: "var(--uw-green-bg)", border: "1px solid var(--uw-green-line)" }}
            title={aiDown ? "The AI coach is unavailable, so replies come from built-in rules." : undefined}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${aiDown ? "" : "animate-pulse"}`} style={{ background: aiDown ? "var(--uw-faint)" : "var(--uw-green)" }} />
            <span className="text-[13px] font-medium shrink-0" style={{ color: aiDown ? "var(--uw-muted)" : "var(--uw-green)" }}>{aiDown ? "Basic replies" : "Online"}</span>
          </div>
        </div>

        {/* Suggested prompts */}
        <div
          className="flex items-center gap-2.5 px-4 md:px-8 py-3 shrink-0 overflow-x-auto"
          style={{ borderBottom: "1px solid var(--uw-line)" }}
        >
          <span className="text-[13px] shrink-0" style={{ color: "var(--uw-muted)" }}>Try</span>
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => send(prompt)}
              className="shrink-0 h-9 px-4 rounded-full text-[14px] font-medium bg-[var(--uw-surface)] text-[var(--uw-ink)] border border-[var(--uw-line)] transition-[transform,border-color] duration-150 hover:-translate-y-px hover:border-[var(--uw-accent)]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 md:px-10 py-4 md:py-6 space-y-4">
          {[greeting, ...messages].map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "coach" && (
                <CoachAvatar />
              )}
              <div
                className="max-w-lg rounded-[20px] px-4 py-3"
                style={
                  msg.role === "user"
                    ? { background: "var(--uw-accent)", color: "#fff", borderBottomRightRadius: 4 }
                    : { background: "var(--uw-surface)", color: "var(--uw-ink)", border: "1px solid var(--uw-line)", borderBottomLeftRadius: 4 }
                }
              >
                <p className="text-[14px] leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex justify-start">
              <CoachAvatar />
              <div
                className="rounded-[20px] px-4 py-3 flex items-center gap-1"
                style={{ background: "var(--uw-surface)", border: "1px solid var(--uw-line)", borderBottomLeftRadius: 4 }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: "var(--uw-faint)", animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 px-4 md:px-8 py-4" style={{ borderTop: "1px solid var(--uw-line)" }}>
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your money..."
              className="flex-1 rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
              style={{
                background: "var(--uw-surface)",
                border: "1px solid var(--uw-line)",
                color: "var(--uw-ink)",
                colorScheme: "light",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--uw-line)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--uw-line)")}
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="px-5 py-3 rounded-xl text-[13px] font-medium transition-all duration-100 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: "var(--uw-accent)", color: "#fff" }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) e.currentTarget.style.background = "var(--uw-accent-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--uw-accent)";
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
