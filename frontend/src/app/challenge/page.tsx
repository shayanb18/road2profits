"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useProfile } from "@/hooks/useProfile";
import { Challenge } from "@/types";

// ─── Presets ──────────────────────────────────────────────────────────────────

const PRESETS: Omit<Challenge, "id" | "current" | "deadline">[] = [
  {
    title: "No takeout this week",
    description: "Cook at home every day until your next payday. Takeout adds up fast.",
    target: 7,
  },
  {
    title: "No non-essential spending until payday",
    description: "Only spend on rent, groceries, and bills. Everything else can wait.",
    target: 7,
  },
  {
    title: "Spend under $30 on food this week",
    description: "Plan your meals and stick to a tight grocery budget for 7 days.",
    target: 7,
  },
];

function getMotivation(pct: number): string {
  if (pct === 0) return "Day 1. Start strong — the hardest part is getting going.";
  if (pct < 0.3) return "Good start. Don't let up now.";
  if (pct < 0.5) return "You're building momentum. Keep going.";
  if (pct < 0.75) return "More than halfway there. You've got this.";
  if (pct < 1) return "Almost done. Finish what you started.";
  return "Challenge complete. You did it.";
}

const CHALLENGE_KEY = "uniwallet-challenge";

function Loading() {
  return (
    <div className="flex h-screen items-center justify-center" style={{ background: "#0a0a0a" }}>
      <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: "#333" }} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChallengePage() {
  const { ready } = useProfile();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [challengeReady, setChallengeReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHALLENGE_KEY);
      if (raw) setChallenge(JSON.parse(raw) as Challenge);
    } catch {}
    setChallengeReady(true);
  }, []);

  function saveChallenge(c: Challenge) {
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(c));
    setChallenge(c);
  }

  function startPreset(preset: typeof PRESETS[0]) {
    const now = new Date();
    const deadline = new Date(now.getTime() + preset.target * 24 * 60 * 60 * 1000);
    saveChallenge({
      id: String(Date.now()),
      ...preset,
      current: 0,
      deadline: deadline.toISOString().split("T")[0],
    });
  }

  function completeDay() {
    if (!challenge || challenge.current >= challenge.target) return;
    const updated = { ...challenge, current: challenge.current + 1 };
    saveChallenge(updated);
  }

  function abandonChallenge() {
    localStorage.removeItem(CHALLENGE_KEY);
    setChallenge(null);
  }

  if (!ready || !challengeReady) return <Loading />;

  const pct = challenge ? challenge.current / challenge.target : 0;
  const daysLeft = challenge
    ? Math.max(0, challenge.target - challenge.current)
    : 0;
  const complete = challenge ? challenge.current >= challenge.target : false;

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: "#0a0a0a", color: "#f0f0f0" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-8 py-4 shrink-0"
          style={{ borderBottom: "1px solid #1a1a1a" }}
        >
          <div>
            <h1 className="text-[15px] font-semibold text-white leading-none mb-0.5">Your Challenge</h1>
            <p className="text-[12px]" style={{ color: "#555" }}>
              {challenge ? "Active challenge" : "No active challenge — pick one"}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {challenge ? (
            <div className="max-w-xl space-y-4">
              {/* Active challenge card */}
              <div
                className="rounded-2xl px-7 py-6"
                style={{
                  background: complete
                    ? "rgba(34,197,94,0.06)"
                    : "rgba(59,130,246,0.05)",
                  border: complete
                    ? "1px solid rgba(34,197,94,0.2)"
                    : "1px solid rgba(59,130,246,0.15)",
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p
                      className="text-[11px] uppercase tracking-widest font-medium mb-2"
                      style={{ color: complete ? "#22c55e" : "#3b82f6" }}
                    >
                      {complete ? "Complete ✓" : "In Progress"}
                    </p>
                    <h2 className="text-xl font-bold text-white leading-snug">
                      {challenge.title}
                    </h2>
                  </div>
                  <span className="text-3xl shrink-0">{complete ? "🎉" : "🎯"}</span>
                </div>

                <p className="text-[13px] leading-relaxed mb-6" style={{ color: "#888" }}>
                  {challenge.description}
                </p>

                {/* Progress */}
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[12px]" style={{ color: "#666" }}>
                    {challenge.current} of {challenge.target} days
                  </span>
                  <span className="text-[12px] font-semibold" style={{ color: complete ? "#22c55e" : "#3b82f6" }}>
                    {Math.round(pct * 100)}%
                  </span>
                </div>
                <div
                  className="rounded-full overflow-hidden mb-5"
                  style={{ height: 8, background: "#1a1a1a" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct * 100}%`,
                      background: complete
                        ? "linear-gradient(90deg, #15803d, #4ade80)"
                        : "linear-gradient(90deg, #1d4ed8, #3b82f6)",
                    }}
                  />
                </div>

                {/* Stats row */}
                <div
                  className="flex items-center gap-6 py-4 mb-5"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#444" }}>
                      Days left
                    </p>
                    <p className="text-2xl font-bold text-white tabular-nums">{daysLeft}</p>
                  </div>
                  <div
                    className="w-px self-stretch"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#444" }}>
                      Streak 🔥
                    </p>
                    <p className="text-2xl font-bold text-white tabular-nums">
                      {challenge.current}
                    </p>
                  </div>
                  <div
                    className="w-px self-stretch"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#444" }}>
                      Deadline
                    </p>
                    <p className="text-[14px] font-semibold text-white">
                      {new Date(challenge.deadline).toLocaleDateString("en-CA", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Motivational line */}
                <p className="text-[13px] italic mb-5" style={{ color: "#666" }}>
                  &ldquo;{getMotivation(pct)}&rdquo;
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {!complete && (
                    <button
                      onClick={completeDay}
                      className="flex-1 py-3 rounded-xl text-[13px] font-semibold transition-all duration-100"
                      style={{ background: "#3b82f6", color: "#fff" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#2563eb")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#3b82f6")}
                    >
                      ✓ Complete today
                    </button>
                  )}
                  <button
                    onClick={abandonChallenge}
                    className="px-4 py-3 rounded-xl text-[12px] font-medium transition-all duration-100"
                    style={{
                      background: "transparent",
                      color: "#444",
                      border: "1px solid #222",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#ef4444";
                      e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#444";
                      e.currentTarget.style.borderColor = "#222";
                    }}
                  >
                    {complete ? "Start new challenge" : "Give up"}
                  </button>
                </div>
              </div>

              {/* Streak callout */}
              {challenge.current > 0 && (
                <div
                  className="rounded-2xl px-5 py-4 flex items-center gap-4"
                  style={{ background: "#111", border: "1px solid #222" }}
                >
                  <span className="text-2xl">🔥</span>
                  <div>
                    <p className="text-[14px] font-semibold text-white">
                      {challenge.current} day streak
                    </p>
                    <p className="text-[12px]" style={{ color: "#555" }}>
                      {challenge.current === 1
                        ? "One day down. Keep it going."
                        : challenge.current < 3
                        ? "Building momentum — don't break the chain."
                        : "Solid streak. This is becoming a habit."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* No challenge — show presets */
            <div className="max-w-xl space-y-4">
              <div
                className="rounded-2xl px-6 py-5"
                style={{ background: "#111", border: "1px solid #222" }}
              >
                <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: "#555" }}>
                  No active challenge
                </p>
                <h2 className="text-[16px] font-semibold text-white mb-1">
                  Start a challenge to build better habits
                </h2>
                <p className="text-[13px]" style={{ color: "#555" }}>
                  Small wins add up. Pick one and stick to it.
                </p>
              </div>

              <div className="space-y-3">
                {PRESETS.map((preset, i) => (
                  <div
                    key={i}
                    className="rounded-2xl px-5 py-5 flex items-start justify-between gap-4"
                    style={{ background: "#111", border: "1px solid #1e1e1e" }}
                  >
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-white mb-1">{preset.title}</p>
                      <p className="text-[12px] leading-snug" style={{ color: "#666" }}>
                        {preset.description}
                      </p>
                      <p className="text-[11px] mt-2" style={{ color: "#444" }}>
                        {preset.target} day challenge
                      </p>
                    </div>
                    <button
                      onClick={() => startPreset(preset)}
                      className="shrink-0 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-100"
                      style={{
                        background: "rgba(59,130,246,0.1)",
                        color: "#3b82f6",
                        border: "1px solid rgba(59,130,246,0.2)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#3b82f6";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(59,130,246,0.1)";
                        e.currentTarget.style.color = "#3b82f6";
                      }}
                    >
                      Start
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
