"use client";

import { useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Loading } from "@/components/Loading";
import { CARD } from "@/components/ui";
import { useProfile } from "@/hooks/useProfile";
import { computeForecast } from "@/lib/forecast";
import { ExclamationTriangleIcon, ExclamationCircleIcon, LightBulbIcon } from "@heroicons/react/24/outline";

const CARD_CFG = {
  danger: {
    border: "var(--uw-red)",
    bg: "var(--uw-red-bg)",
    Icon: ExclamationTriangleIcon,
    color: "var(--uw-red)",
    label: "Urgent",
    labelBg: "var(--uw-red-bg)",
  },
  warning: {
    border: "var(--uw-amber)",
    bg: "var(--uw-amber-bg)",
    Icon: ExclamationCircleIcon,
    color: "var(--uw-amber)",
    label: "Heads Up",
    labelBg: "var(--uw-amber-bg)",
  },
  tip: {
    border: "var(--uw-accent)",
    bg: "rgb(37 111 130 / 0.07)",
    Icon: LightBulbIcon,
    color: "var(--uw-accent-text)",
    label: "Tip",
    labelBg: "rgb(37 111 130 / 0.1)",
  },
};


export default function InsightsPage() {
  const { profile, ready, error } = useProfile();

  const forecast = useMemo(
    () => (profile ? computeForecast(profile) : null),
    [profile]
  );

  if (!ready || !forecast || !profile) return <Loading error={error} />;

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
    <div className="flex flex-col md:flex-row h-dvh overflow-hidden font-sans" style={{ background: "var(--uw-bg)", color: "var(--uw-ink)" }}>
      <Sidebar balance={profile?.currentBalance} />

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div
          className="flex items-end justify-between gap-4 px-5 md:px-10 pt-8 md:pt-10 pb-4 shrink-0"
        >
          <div>
            <h1 className="text-[32px] md:text-[40px] leading-[1.08] font-normal tracking-[-0.035em] text-[var(--uw-ink)] mb-2">Where your money goes</h1>
            <p className="text-[16px]" style={{ color: "var(--uw-muted)" }}>
              {forecast.insights.length} insight{forecast.insights.length !== 1 ? "s" : ""} about your finances
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 md:px-10 py-4 md:py-6 space-y-6">

          {/* Insight cards */}
          {forecast.insights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {forecast.insights.map((insight) => {
                const cfg = CARD_CFG[insight.type as keyof typeof CARD_CFG];
                return (
                  <div
                    key={insight.id}
                    className={`${CARD} px-6 py-5`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <cfg.Icon aria-hidden className="w-4 h-4" style={{ color: cfg.color }} />
                      <span
                        className="text-[13px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: cfg.labelBg, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-[16px] leading-relaxed" style={{ color: "var(--uw-ink)" }}>
                      {insight.message}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="rounded-[20px] py-12 text-center"
              style={{ background: "var(--uw-surface)", border: "1px solid var(--uw-line)" }}
            >
              <p className="text-[16px] text-[var(--uw-muted)]">No alerts. Your finances look fine.</p>
            </div>
          )}

          {/* Breakdown bar */}
          <div className="rounded-[20px] px-6 py-5" style={{ background: "var(--uw-surface)", border: "1px solid var(--uw-line)" }}>
            <p className="text-[16px] font-medium mb-5 text-[var(--uw-ink)]">
              Where your money is going
            </p>

            {/* Bar */}
            <div className="rounded-full overflow-hidden mb-4" style={{ height: 10, background: "var(--uw-raised)" }}>
              <div className="flex h-full">
                <div
                  className="transition-all duration-700"
                  style={{
                    width: `${committedPct}%`,
                    background: committedPct > 80 ? "var(--uw-red)" : committedPct > 60 ? "var(--uw-amber)" : "var(--uw-accent)",
                  }}
                />
                <div
                  className="transition-all duration-700"
                  style={{ width: `${safePct}%`, background: "var(--uw-green)" }}
                />
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: committedPct > 80 ? "var(--uw-red)" : committedPct > 60 ? "var(--uw-amber)" : "var(--uw-accent)" }} />
                <div>
                  <p className="text-[13px] font-medium text-[var(--uw-ink)] tabular-nums">${totalBills.toFixed(2)}</p>
                  <p className="text-[11px]" style={{ color: "var(--uw-faint)" }}>
                    Committed to bills ({Math.round(committedPct)}%)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: "var(--uw-green)" }} />
                <div>
                  <p className="text-[13px] font-medium text-[var(--uw-ink)] tabular-nums">${safeToSpend.toFixed(2)}</p>
                  <p className="text-[11px]" style={{ color: "var(--uw-faint)" }}>
                    Safe to spend ({Math.round(safePct)}%)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Largest bill callout */}
          {largestBill && (
            <div className="rounded-[20px] px-6 py-5" style={{ background: "var(--uw-surface)", border: "1px solid var(--uw-line)" }}>
              <p className="text-[13px] font-medium mb-4" style={{ color: "var(--uw-muted)" }}>
                Biggest expense
              </p>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[15px] font-medium text-[var(--uw-ink)]">{largestBill.name}</p>
                  <p className="text-[12px] mt-0.5" style={{ color: "var(--uw-faint)" }}>
                    Your {largestBill.name.toLowerCase()} takes up {largestBillPct}% of what you have
                  </p>
                </div>
                <p className="text-2xl font-medium tabular-nums text-[var(--uw-ink)]">${largestBill.amount}</p>
              </div>
              {/* mini bar */}
              <div className="rounded-full overflow-hidden" style={{ height: 4, background: "var(--uw-raised)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, largestBillPct)}%`,
                    background: largestBillPct > 50 ? "var(--uw-red)" : "var(--uw-amber)",
                  }}
                />
              </div>
            </div>
          )}

          {/* Bills breakdown */}
          {unpaidBills.length > 0 && (
            <div className="rounded-[20px] overflow-hidden" style={{ background: "var(--uw-surface)", border: "1px solid var(--uw-line)" }}>
              <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--uw-line)" }}>
                <p className="text-[13px] font-medium" style={{ color: "var(--uw-muted)" }}>
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
                          <span className="text-[13px] font-medium" style={{ color: "var(--uw-ink)" }}>{bill.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[12px]" style={{ color: "var(--uw-faint)" }}>{Math.round(pct)}%</span>
                            <span className="text-[13px] font-medium tabular-nums text-[var(--uw-ink)]">${bill.amount}</span>
                          </div>
                        </div>
                        <div className="rounded-full overflow-hidden" style={{ height: 3, background: "var(--uw-raised)" }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: pct > 50 ? "var(--uw-red)" : pct > 30 ? "var(--uw-amber)" : "var(--uw-accent)",
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
