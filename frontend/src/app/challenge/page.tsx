"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Loading } from "@/components/Loading";
import { useProfile } from "@/hooks/useProfile";
import { Challenge } from "@/types";
import { api, getUserId, type Challenge as ApiChallenge } from "@/lib/api";
import { CheckBadgeIcon, FlagIcon, FireIcon } from "@heroicons/react/24/outline";

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
  if (pct === 0) return "Day 1. Start strong. The hardest part is getting going.";
  if (pct < 0.3) return "Good start. Don't let up now.";
  if (pct < 0.5) return "You're building momentum. Keep going.";
  if (pct < 0.75) return "More than halfway there. You've got this.";
  if (pct < 1) return "Almost done. Finish what you started.";
  return "Challenge complete. You did it.";
}

// Days are counted from when the challenge started (weekStart).
function toChallenge(c: ApiChallenge): Challenge {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    target: c.target,
    current: c.progress,
    deadline: new Date(new Date(c.weekStart).getTime() + c.target * 864e5).toISOString(),
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChallengePage() {
  const { profile, ready, error } = useProfile();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return; // useProfile sends the user to onboarding
    api.challenge
      .current(userId)
      .then((r) => setChallenge(r.challenge && toChallenge(r.challenge)))
      .catch(() => setSaveError("Couldn't load your challenge."))
      .finally(() => setLoaded(true));
  }, []);

  function save(request: Promise<ApiChallenge | null>) {
    setSaveError("");
    request
      .then((c) => setChallenge(c && toChallenge(c)))
      .catch(() => setSaveError("Couldn't save that change. Try again."));
  }

  function startPreset(preset: typeof PRESETS[0]) {
    const userId = getUserId();
    if (userId) save(api.challenge.start({ userId, ...preset }));
  }

  function completeDay() {
    if (!challenge || challenge.current >= challenge.target) return;
    save(api.challenge.updateProgress(challenge.id, challenge.current + 1));
  }

  // A finished challenge stays on record as completed; only an unfinished one is marked skipped.
  function abandonChallenge() {
    if (!challenge) return;
    if (challenge.current >= challenge.target) setChallenge(null);
    else save(api.challenge.skip(challenge.id).then(() => null));
  }

  if (!ready || !loaded) return <Loading error={error} />;

  const pct = challenge ? challenge.current / challenge.target : 0;
  const daysLeft = challenge
    ? Math.max(0, challenge.target - challenge.current)
    : 0;
  const complete = challenge ? challenge.current >= challenge.target : false;

  return (
    <div className="flex flex-col md:flex-row h-dvh overflow-hidden font-sans" style={{ background: "var(--uw-bg)", color: "var(--uw-ink)" }}>
      <Sidebar balance={profile?.currentBalance} />

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div
          className="flex items-end justify-between gap-4 px-5 md:px-10 pt-8 md:pt-10 pb-4 shrink-0"
        >
          <div>
            <h1 className="text-[32px] md:text-[40px] leading-[1.08] font-normal tracking-[-0.035em] text-[var(--uw-ink)] mb-2">Your challenge</h1>
            <p className="text-[16px]" style={{ color: "var(--uw-muted)" }}>
              {challenge ? "Active challenge" : "No active challenge. Pick one."}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 md:px-10 py-4 md:py-6">
          {saveError && (
            <p role="alert" className="max-w-xl mb-4 rounded-lg px-4 py-3 text-[14px] bg-[var(--uw-red-bg)] text-[var(--uw-red)]">{saveError}</p>
          )}
          {challenge ? (
            <div className="max-w-xl space-y-4">
              {/* Active challenge card */}
              <div
                className="rounded-[20px] px-5 md:px-7 py-6"
                style={{
                  background: "var(--uw-surface)",
                  border: complete ? "1px solid var(--uw-green-line)" : "1px solid var(--uw-line)",
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p
                      className="text-[13px] font-medium mb-2"
                      style={{ color: complete ? "var(--uw-green)" : "var(--uw-accent-text)" }}
                    >
                      {complete ? "Complete" : "In progress"}
                    </p>
                    <h2 className="text-[28px] font-normal tracking-[-0.03em] text-[var(--uw-ink)] leading-tight">
                      {challenge.title}
                    </h2>
                  </div>
                  {complete ? (
                    <CheckBadgeIcon aria-hidden className="w-8 h-8 shrink-0" style={{ color: "var(--uw-green)" }} />
                  ) : (
                    <FlagIcon aria-hidden className="w-8 h-8 shrink-0" style={{ color: "var(--uw-accent-text)" }} />
                  )}
                </div>

                <p className="text-[13px] leading-relaxed mb-6" style={{ color: "var(--uw-muted)" }}>
                  {challenge.description}
                </p>

                {/* Progress */}
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[12px]" style={{ color: "var(--uw-muted)" }}>
                    {challenge.current} of {challenge.target} days
                  </span>
                  <span className="text-[12px] font-medium" style={{ color: complete ? "var(--uw-green)" : "var(--uw-accent-text)" }}>
                    {Math.round(pct * 100)}%
                  </span>
                </div>
                <div
                  className="rounded-full overflow-hidden mb-5"
                  style={{ height: 8, background: "var(--uw-raised)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct * 100}%`,
                      background: complete
                        ? "var(--uw-green)"
                        : "var(--uw-accent)",
                    }}
                  />
                </div>

                {/* Stats row */}
                <div
                  className="flex items-center gap-6 py-4 mb-5"
                  style={{ borderTop: "1px solid var(--uw-raised)", borderBottom: "1px solid var(--uw-raised)" }}
                >
                  <div>
                    <p className="text-[13px] mb-1 font-medium" style={{ color: "var(--uw-faint)" }}>
                      Days left
                    </p>
                    <p className="text-2xl font-medium text-[var(--uw-ink)] tabular-nums">{daysLeft}</p>
                  </div>
                  <div
                    className="w-px self-stretch"
                    style={{ background: "var(--uw-raised)" }}
                  />
                  <div>
                    <p className="text-[13px] mb-1 font-medium" style={{ color: "var(--uw-faint)" }}>
                      Streak
                    </p>
                    <p className="text-2xl font-medium text-[var(--uw-ink)] tabular-nums">
                      {challenge.current}
                    </p>
                  </div>
                  <div
                    className="w-px self-stretch"
                    style={{ background: "var(--uw-raised)" }}
                  />
                  <div>
                    <p className="text-[13px] mb-1 font-medium" style={{ color: "var(--uw-faint)" }}>
                      Deadline
                    </p>
                    <p className="text-[14px] font-medium text-[var(--uw-ink)]">
                      {new Date(challenge.deadline).toLocaleDateString("en-CA", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Motivational line */}
                <p className="text-[13px] italic mb-5" style={{ color: "var(--uw-muted)" }}>
                  &ldquo;{getMotivation(pct)}&rdquo;
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {!complete && (
                    <button
                      onClick={completeDay}
                      className="flex-1 py-3 rounded-xl text-[13px] font-medium transition-all duration-100"
                      style={{ background: "var(--uw-accent)", color: "#fff" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--uw-accent-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--uw-accent)")}
                    >
                      Complete today
                    </button>
                  )}
                  <button
                    onClick={abandonChallenge}
                    className="px-4 py-3 rounded-xl text-[12px] font-medium transition-all duration-100"
                    style={{
                      background: "transparent",
                      color: "var(--uw-faint)",
                      border: "1px solid var(--uw-line)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--uw-red)";
                      e.currentTarget.style.borderColor = "var(--uw-red-line)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--uw-faint)";
                      e.currentTarget.style.borderColor = "var(--uw-line)";
                    }}
                  >
                    {complete ? "Start new challenge" : "Give up"}
                  </button>
                </div>
              </div>

              {/* Streak callout */}
              {challenge.current > 0 && (
                <div
                  className="rounded-[20px] px-5 py-4 flex items-center gap-4"
                  style={{ background: "var(--uw-surface)", border: "1px solid var(--uw-line)" }}
                >
                  <FireIcon aria-hidden className="w-7 h-7 shrink-0" style={{ color: "var(--uw-amber)" }} />
                  <div>
                    <p className="text-[14px] font-medium text-[var(--uw-ink)]">
                      {challenge.current} day streak
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--uw-faint)" }}>
                      {challenge.current === 1
                        ? "One day down. Keep it going."
                        : challenge.current < 3
                        ? "Building momentum. Don't break the chain."
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
                className="rounded-[20px] px-6 py-5"
                style={{ background: "var(--uw-surface)", border: "1px solid var(--uw-line)" }}
              >
                <p className="text-[13px] mb-1 font-medium" style={{ color: "var(--uw-faint)" }}>
                  No active challenge
                </p>
                <h2 className="text-[16px] font-medium text-[var(--uw-ink)] mb-1">
                  Start a challenge to build better habits
                </h2>
                <p className="text-[13px]" style={{ color: "var(--uw-faint)" }}>
                  Small wins add up. Pick one and stick to it.
                </p>
              </div>

              <div className="space-y-3">
                {PRESETS.map((preset, i) => (
                  <div
                    key={i}
                    className="rounded-[20px] px-5 py-5 flex items-start justify-between gap-4"
                    style={{ background: "var(--uw-surface)", border: "1px solid var(--uw-line)" }}
                  >
                    <div className="flex-1">
                      <p className="text-[14px] font-medium text-[var(--uw-ink)] mb-1">{preset.title}</p>
                      <p className="text-[12px] leading-snug" style={{ color: "var(--uw-muted)" }}>
                        {preset.description}
                      </p>
                      <p className="text-[11px] mt-2" style={{ color: "var(--uw-faint)" }}>
                        {preset.target} day challenge
                      </p>
                    </div>
                    <button
                      onClick={() => startPreset(preset)}
                      className="shrink-0 px-4 py-2 rounded-xl text-[12px] font-medium transition-all duration-100"
                      style={{
                        background: "rgb(37 111 130 / 0.1)",
                        color: "var(--uw-accent-text)",
                        border: "1px solid rgb(37 111 130 / 0.2)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--uw-accent)";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgb(37 111 130 / 0.1)";
                        e.currentTarget.style.color = "var(--uw-accent-text)";
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
