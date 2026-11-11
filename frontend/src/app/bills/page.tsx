"use client";

import { daysUntil, formatDay } from "@/lib/dates";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Loading } from "@/components/Loading";
import { useProfile } from "@/hooks/useProfile";
import { CheckIcon } from "@heroicons/react/24/outline";
import { CARD, CHIP, LABEL, BTN_SECONDARY, chipStyle, PRIORITY_TONE } from "@/components/ui";

const PRIORITY_LABEL = { high: "High", medium: "Medium", low: "Low" } as const;


export default function BillsPage() {
  const { profile, ready, error, setBillPaid } = useProfile();
  const [saveError, setSaveError] = useState("");
  const [now] = useState(Date.now);

  function togglePaid(id: string, paid: boolean) {
    setSaveError("");
    setBillPaid(id, paid).catch(() => setSaveError("Couldn't save that change. Try again."));
  }

  if (!ready || !profile) return <Loading error={error} />;
  const bills = profile.bills;

  const unpaid = bills.filter((b) => !b.paid).sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
  const paid = bills.filter((b) => b.paid);
  const totalOwed = unpaid.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="flex flex-col md:flex-row h-dvh overflow-hidden font-sans" style={{ background: "var(--uw-bg)", color: "var(--uw-ink)" }}>
      <Sidebar balance={profile?.currentBalance} />

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div
          className="flex items-end justify-between gap-4 px-5 md:px-10 pt-8 md:pt-10 pb-4 shrink-0"
        >
          <div>
            <h1 className="text-[32px] md:text-[40px] leading-[1.08] font-normal tracking-[-0.035em] text-[var(--uw-ink)] mb-2">Your bills</h1>
            <p className="text-[16px]" style={{ color: "var(--uw-muted)" }}>
              {unpaid.length} unpaid · {paid.length} paid
            </p>
          </div>
          {/* Total owed */}
          <div className="text-right">
            <p className="text-[13px] mb-1 font-medium" style={{ color: "var(--uw-faint)" }}>
              Total owed
            </p>
            <p className="text-xl font-medium tabular-nums" style={{ color: totalOwed > 0 ? "var(--uw-red)" : "var(--uw-green)" }}>
              ${totalOwed.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 md:px-10 py-4 md:py-6">
          {bills.length === 0 ? (
            <div className="rounded-[20px] py-16 text-center border border-dashed border-[var(--uw-line)]">
              <p className="text-[16px] text-[var(--uw-ink)]">No bills yet.</p>
              <p className="text-[14px] mt-1 text-[var(--uw-muted)]">
                Bills you add during setup show up here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {saveError && (
                <p role="alert" className="rounded-lg px-4 py-3 text-[14px] bg-[var(--uw-red-bg)] text-[var(--uw-red)]">{saveError}</p>
              )}
              {/* Unpaid bills */}
              {unpaid.length > 0 && (
                <ul className={`${CARD} overflow-hidden`}>
                  {unpaid.map((bill) => {
                    const days = daysUntil(bill.dueDate, new Date(now));
                    const urgent = days >= 0 && days <= 3;
                    return (
                      <li key={bill.id} className="grid grid-cols-[40px_minmax(0,1fr)_auto] sm:flex items-center gap-x-4 gap-y-3 px-5 md:px-6 py-4 border-b border-[var(--uw-line)] last:border-b-0">
                        <span className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-[15px] font-medium" style={{ background: "var(--uw-lit)", color: "var(--uw-lit-ink)" }}>
                          {bill.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[16px] font-medium text-[var(--uw-ink)] truncate">{bill.name}</p>
                          <p className="text-[14px] text-[var(--uw-muted)]">
                            Due {formatDay(bill.dueDate, { month: "long", day: "numeric" })}
                            {!urgent && ` · ${days > 0 ? `${days} days away` : "overdue"}`}
                          </p>
                        </div>
                        <div className="col-start-2 row-start-2 flex flex-wrap items-center gap-2">
                          {urgent && (
                            <span className={CHIP} style={chipStyle("red")}>
                              {days === 0 ? "Due today" : days === 1 ? "Due tomorrow" : `${days} days left`}
                            </span>
                          )}
                          <span className={CHIP} style={chipStyle(PRIORITY_TONE[bill.priority])}>
                            <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-current" />
                            {PRIORITY_LABEL[bill.priority]}
                          </span>
                        </div>
                        <p className="col-start-3 row-start-1 text-[20px] font-medium tabular-nums text-[var(--uw-ink)] sm:w-24 text-right">${bill.amount}</p>
                        <button onClick={() => togglePaid(bill.id, true)} className={`${BTN_SECONDARY} col-start-3 row-start-2 h-9 px-4 text-[14px] hover:border-[var(--uw-green)] hover:text-[var(--uw-green)]`}>
                          Mark paid
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Paid bills */}
              {paid.length > 0 && (
                <div>
                  <h2 className={`${LABEL} mb-3`}>Paid</h2>
                  <ul className={`${CARD} overflow-hidden`}>
                    {paid.map((bill) => (
                      <li key={bill.id} className="flex items-center gap-4 px-5 md:px-6 py-3.5 border-b border-[var(--uw-line)] last:border-b-0">
                        <span className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[var(--uw-green-bg)] text-[var(--uw-green)]">
                          <CheckIcon aria-hidden className="w-4 h-4" strokeWidth={2.5} />
                        </span>
                        <span className="flex-1 min-w-0 truncate text-[16px] text-[var(--uw-muted)] line-through">{bill.name}</span>
                        <span className="text-[16px] tabular-nums text-[var(--uw-muted)] line-through">${bill.amount}</span>
                        <button onClick={() => togglePaid(bill.id, false)} className={`${BTN_SECONDARY} h-9 px-4 text-[14px]`}>
                          Undo
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
