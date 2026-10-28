"use client";

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
  const payDate = new Date(forecast.nextPayDate).toLocaleDateString("en-CA", {
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
    const days = Math.ceil(
      (new Date(forecast.nextPayDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
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
      style={{ background: "#1a1a1a", color: "#3b82f6", border: "1px solid #2a2a2a" }}
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
    <div className="flex flex-col md:flex-row h-dvh overflow-hidden font-sans" style={{ background: "#0a0a0a", color: "#f0f0f0" }}>
      <Sidebar balance={profile?.currentBalance} />

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div
          className="flex items-center justify-between gap-4 px-4 md:px-8 py-4 shrink-0"
          style={{ borderBottom: "1px solid #1a1a1a" }}
        >
          <div>
            <h1 className="text-[15px] font-semibold text-white leading-none mb-0.5">Ask Your Money Coach</h1>
            <p className="text-[12px]" style={{ color: "#555" }}>Straight talk, no jargon</p>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={aiDown ? { background: "#141414", border: "1px solid #222" } : { background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}
            title={aiDown ? "The AI coach is unavailable, so replies come from built-in rules." : undefined}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${aiDown ? "" : "animate-pulse"}`} style={{ background: aiDown ? "#555" : "#22c55e" }} />
            <span className="text-[11px] font-medium shrink-0" style={{ color: aiDown ? "#888" : "#22c55e" }}>{aiDown ? "Basic replies" : "Online"}</span>
          </div>
        </div>

        {/* Suggested prompts */}
        <div
          className="flex items-center gap-2.5 px-4 md:px-8 py-3 shrink-0 overflow-x-auto"
          style={{ borderBottom: "1px solid #141414" }}
        >
          <span className="text-[11px] shrink-0" style={{ color: "#444" }}>Try:</span>
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => send(prompt)}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all duration-100"
              style={{
                background: "rgba(59,130,246,0.08)",
                color: "#3b82f6",
                border: "1px solid rgba(59,130,246,0.2)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(59,130,246,0.15)";
                e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(59,130,246,0.08)";
                e.currentTarget.style.borderColor = "rgba(59,130,246,0.2)";
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
          {[greeting, ...messages].map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "coach" && (
                <CoachAvatar />
              )}
              <div
                className="max-w-lg rounded-2xl px-4 py-3"
                style={
                  msg.role === "user"
                    ? { background: "#3b82f6", color: "#fff", borderBottomRightRadius: 4 }
                    : { background: "#141414", color: "#ddd", border: "1px solid #222", borderBottomLeftRadius: 4 }
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
                className="rounded-2xl px-4 py-3 flex items-center gap-1"
                style={{ background: "#141414", border: "1px solid #222", borderBottomLeftRadius: 4 }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: "#555", animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 px-4 md:px-8 py-4" style={{ borderTop: "1px solid #1a1a1a" }}>
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your money..."
              className="flex-1 rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
              style={{
                background: "#111",
                border: "1px solid #222",
                color: "#f0f0f0",
                colorScheme: "dark",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#333")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#222")}
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="px-5 py-3 rounded-xl text-[13px] font-semibold transition-all duration-100 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: "#3b82f6", color: "#fff" }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) e.currentTarget.style.background = "#2563eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#3b82f6";
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
