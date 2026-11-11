"use client";

import { formatDay } from "@/lib/dates";
import { useMemo } from "react";
import Link from "next/link";
import { Sidebar, StartOver } from "@/components/Sidebar";
import { Loading } from "@/components/Loading";
import { useProfile } from "@/hooks/useProfile";
import { computeForecast } from "@/lib/forecast";
import { CARD, CHIP, chipStyle, PRIORITY_TONE, type Tone } from "@/components/ui";
import { ExclamationTriangleIcon, ExclamationCircleIcon, LightBulbIcon } from "@heroicons/react/24/outline";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  safe: {
    label: "You're on track",
    accent: "var(--uw-green)",
    glow: "var(--uw-green-bg)",
    tone: "green" as Tone,
    badge: "Safe",
  },
  warning: {
    label: "Heads up, it's tight",
    accent: "var(--uw-amber)",
    glow: "var(--uw-amber-bg)",
    tone: "amber" as Tone,
    badge: "Tight",
  },
  over_budget: {
    label: "You're over budget",
    accent: "var(--uw-red)",
    glow: "var(--uw-red-bg)",
    tone: "red" as Tone,
    badge: "Over budget",
  },
};

const PRIORITY_CFG = {
  high: { dot: "var(--uw-red)", label: "High" },
  medium: { dot: "var(--uw-amber)", label: "Medium" },
  low: { dot: "var(--uw-muted)", label: "Low" },
};

const INSIGHT_CFG = {
  danger: { border: "var(--uw-red)", bg: "var(--uw-red-bg)", Icon: ExclamationTriangleIcon, color: "var(--uw-red)" },
  warning: { border: "var(--uw-amber)", bg: "var(--uw-amber-bg)", Icon: ExclamationCircleIcon, color: "var(--uw-amber)" },
  tip: { border: "var(--uw-accent)", bg: "rgb(37 111 130 / 0.07)", Icon: LightBulbIcon, color: "var(--uw-accent-text)" },
};

// ─── Loading screen ───────────────────────────────────────────────────────────


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { profile, ready, error } = useProfile();

  const forecast = useMemo(
    () => (profile ? computeForecast(profile) : null),
    [profile]
  );

  if (!ready || !forecast || !profile) return <Loading error={error} />;

  const s = STATUS_CFG[forecast.status];

  return (
    <div className="flex flex-col md:flex-row h-dvh overflow-hidden font-sans" style={{ background: "var(--uw-bg)", color: "var(--uw-ink)" }}>
      <Sidebar balance={profile?.currentBalance} />

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div
          className="flex items-end justify-between gap-4 px-5 md:px-10 pt-8 md:pt-10 pb-4 shrink-0"
        >
          <div>
            <h1 className="text-[32px] md:text-[40px] leading-[1.08] font-normal tracking-[-0.035em] text-[var(--uw-ink)] mb-2">Dashboard</h1>
            <p className="text-[16px]" style={{ color: "var(--uw-muted)" }}>Your financial snapshot</p>
          </div>
          <span
            className="text-[11px] px-3 py-1.5 rounded-lg"
            style={{ background: "var(--uw-surface)", color: "var(--uw-faint)", border: "1px solid var(--uw-line)" }}
          >
            {new Date().toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 md:px-10 py-4 md:py-6 space-y-5">

          {/* ── Status Banner ── */}
          <div
            className={`${CARD} px-6 md:px-8 py-7 md:py-8`}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              {/* Left: status headline */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={CHIP} style={chipStyle(s.tone)}>
                    <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-current" />
                    {s.badge}
                  </span>
                </div>
                <p className="text-[28px] md:text-[32px] font-normal tracking-[-0.03em] mb-2 text-[var(--uw-ink)]">
                  {s.label}
                </p>
                <div className="mt-4">
                  <p className="text-[13px] mb-1 font-medium" style={{ color: "var(--uw-faint)" }}>
                    You&apos;ll have this much before payday
                  </p>
                  <p className="text-[44px] md:text-[56px] leading-none font-normal tracking-[-0.035em] tabular-nums" style={{ color: forecast.projectedBalance < 0 ? "var(--uw-red)" : "var(--uw-ink)" }}>
                    {forecast.projectedBalance < 0 ? "-" : ""}$
                    {Math.abs(forecast.projectedBalance).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Right: key stats */}
              <div
                className="flex flex-wrap gap-x-8 gap-y-4 shrink-0 pt-5 md:pt-1 md:pl-8 border-t md:border-t-0 md:border-l"
                style={{ borderColor: "var(--uw-raised)" }}
              >
                <div>
                  <p className="text-[13px] mb-2 font-medium" style={{ color: "var(--uw-faint)" }}>
                    Current balance
                  </p>
                  <p className="text-xl font-medium text-[var(--uw-ink)] tabular-nums">
                    ${profile.currentBalance.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] mb-2 font-medium" style={{ color: "var(--uw-faint)" }}>
                    Next payday
                  </p>
                  <p className="text-xl font-medium text-[var(--uw-ink)]">
                    {formatDay(forecast.nextPayDate, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] mb-2 font-medium" style={{ color: "var(--uw-faint)" }}>
                    Next bill due
                  </p>
                  <p className="text-xl font-medium text-[var(--uw-ink)]">
                    {forecast.nextBillDue ? (
                      <>
                        {forecast.nextBillDue.name}{" "}
                        <span className="text-[15px] font-normal" style={{ color: "var(--uw-muted)" }}>
                          ${forecast.nextBillDue.amount}
                        </span>
                      </>
                    ) : (
                      <span style={{ color: "var(--uw-faint)" }}>None</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── 3-column grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Bills priority */}
            <div className="rounded-[20px] overflow-hidden" style={{ background: "var(--uw-surface)", border: "1px solid var(--uw-line)" }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--uw-line)" }}>
                <p className="text-[16px] font-medium text-[var(--uw-ink)]">
                  Pay these first
                </p>
                <span className="text-[13px]" style={{ color: "var(--uw-faint)" }}>by due date</span>
              </div>
              {forecast.prioritizedBills.length > 0 ? (
                <>
                  <div className="p-3 space-y-0.5">
                    {forecast.prioritizedBills.map((bill, i) => {
                      const pc = PRIORITY_CFG[bill.priority];
                      return (
                        <div
                          key={bill.id}
                          className="flex items-center justify-between rounded-xl px-3 py-3"
                          style={{ background: i === 0 ? "var(--uw-raised)" : "transparent" }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[13px] w-4 tabular-nums text-center" style={{ color: "var(--uw-faint)" }}>
                              {i + 1}
                            </span>
                                                        <span className="text-[15px] font-medium" style={{ color: i === 0 ? "var(--uw-ink)" : "var(--uw-muted)" }}>
                              {bill.name}
                            </span>
                            <span className={CHIP} style={chipStyle(PRIORITY_TONE[bill.priority])}>
                              {pc.label}
                            </span>
                          </div>
                          <span className="text-[15px] font-medium tabular-nums" style={{ color: i === 0 ? "var(--uw-ink)" : "var(--uw-muted)" }}>
                            ${bill.amount}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-5 py-3 flex justify-between" style={{ borderTop: "1px solid var(--uw-line)" }}>
                    <span className="text-[13px] font-medium" style={{ color: "var(--uw-faint)" }}>Total</span>
                    <span className="text-[13px] font-medium tabular-nums" style={{ color: "var(--uw-muted)" }}>
                      ${forecast.prioritizedBills.reduce((s, b) => s + b.amount, 0)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="px-5 py-10 text-center">
                  <p className="text-[13px]" style={{ color: "var(--uw-faint)" }}>No upcoming bills.</p>
                </div>
              )}
            </div>

            {/* Insights */}
            <div className="rounded-[20px] overflow-hidden" style={{ background: "var(--uw-surface)", border: "1px solid var(--uw-line)" }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--uw-line)" }}>
                <p className="text-[16px] font-medium text-[var(--uw-ink)]">
                  Insights
                </p>
                <span className="text-[13px]" style={{ color: "var(--uw-faint)" }}>
                  {forecast.insights.length} alert{forecast.insights.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="p-4 space-y-3">
                {forecast.insights.length > 0 ? (
                  forecast.insights.map((insight) => {
                    const ic = INSIGHT_CFG[insight.type as keyof typeof INSIGHT_CFG];
                    return (
                      <div
                        key={insight.id}
                        className="rounded-xl px-4 py-3 flex items-start gap-3"
                        style={{ background: ic.bg, border: `1px solid color-mix(in srgb, ${ic.border} 13%, transparent)`, borderLeft: `3px solid ${ic.border}` }}
                      >
                        <ic.Icon aria-hidden className="w-4 h-4 shrink-0 mt-0.5" style={{ color: ic.color }} />
                        <p className="text-[15px] leading-snug" style={{ color: "var(--uw-ink)" }}>{insight.message}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[13px] text-center py-4" style={{ color: "var(--uw-faint)" }}>No alerts. Looking good.</p>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="rounded-[20px] overflow-hidden" style={{ background: "var(--uw-surface)", border: "1px solid var(--uw-line)" }}>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--uw-line)" }}>
                <p className="text-[16px] font-medium text-[var(--uw-ink)]">
                  What to do
                </p>
              </div>
              <div className="p-4 space-y-3">
                {forecast.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-[13px] shrink-0 mt-0.5 tabular-nums" style={{ color: "var(--uw-faint)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-[15px] leading-snug" style={{ color: "var(--uw-ink)" }}>{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Chat CTA ── */}
          <Link
            href="/coach"
            className="flex items-center justify-between px-6 md:px-8 py-6 rounded-[20px] transition-transform duration-150 hover:-translate-y-0.5"
            style={{ background: "var(--uw-lit)", color: "var(--uw-lit-ink)" }}
          >
            <div>
              <p className="text-[20px] font-medium tracking-[-0.02em]">
                Ask your money coach
              </p>
              <p className="text-[15px] mt-1" style={{ color: "var(--uw-lit-muted)" }}>
                It answers with your own balance, bills and payday.
              </p>
            </div>
            <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0 ml-4 text-[var(--uw-accent)]" aria-hidden>→</span>
          </Link>

          <div className="md:hidden pt-4">
            <StartOver />
          </div>

          <div className="pb-2" />
        </div>
      </div>
    </div>
  );
}
