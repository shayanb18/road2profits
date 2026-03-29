"use client";

import { useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useProfile } from "@/hooks/useProfile";
import { computeForecast } from "@/lib/forecast";

const CARD_CFG = {
  danger: {
    border: "#ef4444",
    bg: "rgba(239,68,68,0.07)",
    icon: "⚠",
    color: "#ef4444",
    label: "Urgent",
    labelBg: "rgba(239,68,68,0.1)",
  },
  warning: {
    border: "#eab308",
    bg: "rgba(234,179,8,0.07)",
    icon: "◈",
    color: "#eab308",
    label: "Heads Up",
    labelBg: "rgba(234,179,8,0.1)",
  },
  tip: {
    border: "#3b82f6",
    bg: "rgba(59,130,246,0.07)",
    icon: "→",
    color: "#3b82f6",
    label: "Tip",
    labelBg: "rgba(59,130,246,0.1)",
  },
};

function Loading() {
  return (
    <div className="flex h-screen items-center justify-center" style={{ background: "#0a0a0a" }}>
      <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: "#333" }} />
    </div>
  );
}

export default function InsightsPage() {
  const { profile, ready } = useProfile();

  const forecast = useMemo(
    () => (profile ? computeForecast(profile) : null),
    [profile]
  );

  if (!ready || !forecast || !profile) return <Loading />;

  const unpaidBills = profile.bills.filter((b) => !b.paid);
  const totalBills = unpaidBills.reduce((s, b) => s + b.amount, 0);
  const safeToSpend = Math.max(0, profile.currentBalance - totalBills);
  const committedPct = profile.currentBalance > 0
    ? Math.min(100, (totalBills / profile.currentBalance) * 100)
    : 0;
  const safePct = 100 - committedPct;

  // Largest single bill
  const largestBill = unpaidBills.reduce<typeof unpaidBills[0] | null>(
    (max, b) => (!max || b.amount > max.amount ? b : max),
    null
  );
  const largestBillPct =
    largestBill && profile.currentBalance > 0
      ? Math.round((largestBill.amount / profile.currentBalance) * 100)
      : 0;

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
            <h1 className="text-[15px] font-semibold text-white leading-none mb-0.5">What&apos;s Going On</h1>
            <p className="text-[12px]" style={{ color: "#555" }}>
              {forecast.insights.length} insight{forecast.insights.length !== 1 ? "s" : ""} about your finances
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

          {/* Insight cards */}
          {forecast.insights.length > 0 ? (
            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {forecast.insights.map((insight) => {
                const cfg = CARD_CFG[insight.type as keyof typeof CARD_CFG];
                return (
                  <div
                    key={insight.id}
                    className="rounded-2xl px-5 py-5"
                    style={{
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}20`,
                      borderLeft: `3px solid ${cfg.border}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base font-bold" style={{ color: cfg.color }}>
                        {cfg.icon}
                      </span>
                      <span
                        className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: cfg.labelBg, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-[14px] leading-relaxed" style={{ color: "#ddd" }}>
                      {insight.message}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="rounded-2xl py-12 text-center"
              style={{ background: "#111", border: "1px solid #222" }}
            >
              <p className="text-[13px]" style={{ color: "#555" }}>No alerts — your finances look fine.</p>
            </div>
          )}

          {/* Breakdown bar */}
          <div className="rounded-2xl px-6 py-5" style={{ background: "#111", border: "1px solid #222" }}>
            <p className="text-[11px] uppercase tracking-[0.16em] font-medium mb-5" style={{ color: "#666" }}>
              Where your money is going
            </p>

            {/* Bar */}
            <div className="rounded-full overflow-hidden mb-4" style={{ height: 10, background: "#1a1a1a" }}>
              <div className="flex h-full">
                <div
                  className="transition-all duration-700"
                  style={{
                    width: `${committedPct}%`,
                    background: committedPct > 80 ? "#ef4444" : committedPct > 60 ? "#eab308" : "#3b82f6",
                  }}
                />
                <div
                  className="transition-all duration-700"
                  style={{ width: `${safePct}%`, background: "#22c55e" }}
                />
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: committedPct > 80 ? "#ef4444" : committedPct > 60 ? "#eab308" : "#3b82f6" }} />
                <div>
                  <p className="text-[13px] font-semibold text-white tabular-nums">${totalBills.toFixed(2)}</p>
                  <p className="text-[11px]" style={{ color: "#555" }}>
                    Committed to bills ({Math.round(committedPct)}%)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: "#22c55e" }} />
                <div>
                  <p className="text-[13px] font-semibold text-white tabular-nums">${safeToSpend.toFixed(2)}</p>
                  <p className="text-[11px]" style={{ color: "#555" }}>
                    Safe to spend ({Math.round(safePct)}%)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Largest bill callout */}
          {largestBill && (
            <div className="rounded-2xl px-6 py-5" style={{ background: "#111", border: "1px solid #222" }}>
              <p className="text-[11px] uppercase tracking-[0.16em] font-medium mb-4" style={{ color: "#666" }}>
                Biggest expense
              </p>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[15px] font-semibold text-white">{largestBill.name}</p>
                  <p className="text-[12px] mt-0.5" style={{ color: "#555" }}>
                    Your {largestBill.name.toLowerCase()} takes up {largestBillPct}% of what you have
                  </p>
                </div>
                <p className="text-2xl font-bold tabular-nums text-white">${largestBill.amount}</p>
              </div>
              {/* mini bar */}
              <div className="rounded-full overflow-hidden" style={{ height: 4, background: "#1a1a1a" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, largestBillPct)}%`,
                    background: largestBillPct > 50 ? "#ef4444" : "#eab308",
                  }}
                />
              </div>
            </div>
          )}

          {/* Bills breakdown */}
          {unpaidBills.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid #222" }}>
              <div className="px-6 py-4" style={{ borderBottom: "1px solid #1a1a1a" }}>
                <p className="text-[11px] uppercase tracking-[0.16em] font-medium" style={{ color: "#666" }}>
                  Bill breakdown
                </p>
              </div>
              <div className="p-4 space-y-3">
                {unpaidBills
                  .sort((a, b) => b.amount - a.amount)
                  .map((bill) => {
                    const pct = profile.currentBalance > 0
                      ? Math.min(100, (bill.amount / profile.currentBalance) * 100)
                      : 0;
                    return (
                      <div key={bill.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[13px] font-medium" style={{ color: "#ccc" }}>{bill.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[12px]" style={{ color: "#555" }}>{Math.round(pct)}%</span>
                            <span className="text-[13px] font-semibold tabular-nums text-white">${bill.amount}</span>
                          </div>
                        </div>
                        <div className="rounded-full overflow-hidden" style={{ height: 3, background: "#1a1a1a" }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: pct > 50 ? "#ef4444" : pct > 30 ? "#eab308" : "#3b82f6",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          <div className="pb-2" />
        </div>
      </div>
    </div>
  );
}
