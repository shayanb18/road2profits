"use client";

import { formatDay } from "@/lib/dates";
import { useMemo } from "react";
import Link from "next/link";
import { Sidebar, StartOver } from "@/components/Sidebar";
import { Loading } from "@/components/Loading";
import { useProfile } from "@/hooks/useProfile";
import { computeForecast } from "@/lib/forecast";
import { ExclamationTriangleIcon, ExclamationCircleIcon, LightBulbIcon } from "@heroicons/react/24/outline";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  safe: {
    label: "You're on track",
    accent: "#22c55e",
    glow: "rgba(34,197,94,0.12)",
    badge: "Safe",
  },
  warning: {
    label: "Heads up, it's tight",
    accent: "#eab308",
    glow: "rgba(234,179,8,0.12)",
    badge: "Warning",
  },
  over_budget: {
    label: "You're over budget",
    accent: "#ef4444",
    glow: "rgba(239,68,68,0.12)",
    badge: "Over Budget",
  },
};

const PRIORITY_CFG = {
  high: { dot: "#ef4444", label: "high" },
  medium: { dot: "#eab308", label: "med" },
  low: { dot: "var(--uw-muted)", label: "low" },
};

const INSIGHT_CFG = {
  danger: { border: "#ef4444", bg: "rgba(239,68,68,0.07)", Icon: ExclamationTriangleIcon, color: "#ef4444" },
  warning: { border: "#eab308", bg: "rgba(234,179,8,0.07)", Icon: ExclamationCircleIcon, color: "#eab308" },
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
          className="flex items-center justify-between gap-4 px-4 md:px-8 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--uw-line)" }}
        >
          <div>
            <h1 className="text-[15px] font-semibold text-white leading-none mb-0.5">Dashboard</h1>
            <p className="text-[12px]" style={{ color: "var(--uw-faint)" }}>Your financial snapshot</p>
          </div>
          <span
            className="text-[11px] px-3 py-1.5 rounded-lg"
            style={{ background: "var(--uw-surface)", color: "var(--uw-faint)", border: "1px solid var(--uw-line)" }}
          >
            {new Date().toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5">

          {/* ── Status Banner ── */}
          <div
            className="rounded-2xl px-5 md:px-8 py-6 md:py-7"
            style={{
              background: `linear-gradient(135deg, ${s.glow} 0%, rgba(255,255,255,0.01) 100%)`,
              border: `1px solid ${s.accent}22`,
              boxShadow: `0 0 60px ${s.glow}`,
            }}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              {/* Left: status headline */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
                    style={{
                      background: `${s.accent}18`,
                      color: s.accent,
                      border: `1px solid ${s.accent}30`,
                    }}
                  >
                    {s.badge}
                  </span>
                </div>
                <p className="text-2xl md:text-3xl font-bold tracking-tight mb-2" style={{ color: s.accent }}>
                  {s.label}
                </p>
                <div className="mt-4">
                  <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: "var(--uw-faint)" }}>
                    You&apos;ll have this much before payday
                  </p>
                  <p className="text-4xl font-bold tabular-nums" style={{ color: forecast.projectedBalance < 0 ? "#ef4444" : "#f0f0f0" }}>
                    {forecast.projectedBalance < 0 ? "-" : ""}$
                    {Math.abs(forecast.projectedBalance).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Right: key stats */}
              <div
                className="flex flex-wrap gap-x-8 gap-y-4 shrink-0 pt-5 md:pt-1 md:pl-8 border-t md:border-t-0 md:border-l"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <div>
                  <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--uw-faint)" }}>
                    Current balance
                  </p>
                  <p className="text-xl font-semibold text-white tabular-nums">
                    ${profile.currentBalance.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--uw-faint)" }}>
                    Next payday
                  </p>
                  <p className="text-xl font-semibold text-white">
                    {formatDay(forecast.nextPayDate, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--uw-faint)" }}>
                    Next bill due
                  </p>
                  <p className="text-xl font-semibold text-white">
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
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--uw-surface)", border: "1px solid var(--uw-line)" }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--uw-line)" }}>
                <p className="text-[11px] uppercase tracking-[0.16em] font-medium" style={{ color: "var(--uw-muted)" }}>
                  Bills Priority
                </p>
                <span className="text-[10px]" style={{ color: "var(--uw-faint)" }}>by due date</span>
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
                          style={{ background: i === 0 ? "rgba(255,255,255,0.04)" : "transparent" }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono w-4 tabular-nums text-center" style={{ color: "var(--uw-faint)" }}>
                              {i + 1}
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: pc.dot }} />
                            <span className="text-[13px] font-medium" style={{ color: i === 0 ? "var(--uw-ink)" : "var(--uw-muted)" }}>
                              {bill.name}
                            </span>
                            <span
                              className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                              style={{ background: `${pc.dot}14`, color: pc.dot, border: `1px solid ${pc.dot}25` }}
                            >
                              {pc.label}
                            </span>
                          </div>
                          <span className="text-[13px] font-semibold tabular-nums" style={{ color: i === 0 ? "#fff" : "#555" }}>
                            ${bill.amount}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-5 py-3 flex justify-between" style={{ borderTop: "1px solid var(--uw-line)" }}>
                    <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--uw-faint)" }}>Total</span>
                    <span className="text-[13px] font-semibold tabular-nums" style={{ color: "var(--uw-muted)" }}>
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
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--uw-surface)", border: "1px solid var(--uw-line)" }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--uw-line)" }}>
                <p className="text-[11px] uppercase tracking-[0.16em] font-medium" style={{ color: "var(--uw-muted)" }}>
                  Insights
                </p>
                <span className="text-[10px]" style={{ color: "var(--uw-faint)" }}>
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
                        style={{ background: ic.bg, border: `1px solid ${ic.border}20`, borderLeft: `3px solid ${ic.border}` }}
                      >
                        <ic.Icon aria-hidden className="w-4 h-4 shrink-0 mt-0.5" style={{ color: ic.color }} />
                        <p className="text-[13px] leading-snug" style={{ color: "var(--uw-ink)" }}>{insight.message}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[13px] text-center py-4" style={{ color: "var(--uw-faint)" }}>No alerts. Looking good.</p>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--uw-surface)", border: "1px solid var(--uw-line)" }}>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--uw-line)" }}>
                <p className="text-[11px] uppercase tracking-[0.16em] font-medium" style={{ color: "var(--uw-muted)" }}>
                  What to do
                </p>
              </div>
              <div className="p-4 space-y-3">
                {forecast.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-[11px] font-mono shrink-0 mt-0.5 tabular-nums" style={{ color: "var(--uw-faint)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-[13px] leading-snug" style={{ color: "var(--uw-muted)" }}>{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Chat CTA ── */}
          <Link
            href="/coach"
            className="flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-150"
            style={{
              background: "rgb(37 111 130 / 0.08)",
              border: "1px solid rgb(37 111 130 / 0.2)",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgb(37 111 130 / 0.13)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgb(37 111 130 / 0.35)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgb(37 111 130 / 0.08)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgb(37 111 130 / 0.2)";
            }}
          >
            <div>
              <p className="text-[14px] font-semibold" style={{ color: "var(--uw-accent-text)" }}>
                Chat with your AI Coach
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--uw-faint)" }}>
                Ask anything about your money — no jargon, just honest answers
              </p>
            </div>
            <span className="text-[20px] shrink-0 ml-4" style={{ color: "var(--uw-accent-text)" }}>→</span>
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
