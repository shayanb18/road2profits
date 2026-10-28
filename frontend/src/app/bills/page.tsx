"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Loading } from "@/components/Loading";
import { useProfile } from "@/hooks/useProfile";

const PRIORITY_CFG = {
  high: { border: "#ef4444", bg: "rgba(239,68,68,0.06)", dot: "#ef4444", label: "High" },
  medium: { border: "#eab308", bg: "rgba(234,179,8,0.06)", dot: "#eab308", label: "Medium" },
  low: { border: "#374151", bg: "rgba(55,65,81,0.04)", dot: "#6b7280", label: "Low" },
};


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
    <div className="flex flex-col md:flex-row h-dvh overflow-hidden font-sans" style={{ background: "#0a0a0a", color: "#f0f0f0" }}>
      <Sidebar balance={profile?.currentBalance} />

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div
          className="flex items-center justify-between gap-4 px-4 md:px-8 py-4 shrink-0"
          style={{ borderBottom: "1px solid #1a1a1a" }}
        >
          <div>
            <h1 className="text-[15px] font-semibold text-white leading-none mb-0.5">Your Bills</h1>
            <p className="text-[12px]" style={{ color: "#555" }}>
              {unpaid.length} unpaid · {paid.length} paid
            </p>
          </div>
          {/* Total owed */}
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#555" }}>
              Total owed
            </p>
            <p className="text-xl font-bold tabular-nums" style={{ color: totalOwed > 0 ? "#ef4444" : "#22c55e" }}>
              ${totalOwed.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {bills.length === 0 ? (
            <div
              className="rounded-2xl py-16 text-center"
              style={{ border: "1px dashed #222" }}
            >
              <p className="text-[14px]" style={{ color: "#555" }}>No bills yet.</p>
              <p className="text-[12px] mt-1" style={{ color: "#333" }}>
                Bills you add during setup show up here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {saveError && (
                <p role="alert" className="text-[13px]" style={{ color: "#ef4444" }}>{saveError}</p>
              )}
              {/* Unpaid bills */}
              {unpaid.length > 0 && (
                <div className="space-y-3">
                  {unpaid.map((bill) => {
                    const pc = PRIORITY_CFG[bill.priority];
                    const daysUntil = Math.ceil(
                      (new Date(bill.dueDate).getTime() - now) / (1000 * 60 * 60 * 24)
                    );
                    const urgent = daysUntil >= 0 && daysUntil <= 3;
                    return (
                      <div
                        key={bill.id}
                        className="rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                        style={{
                          background: pc.bg,
                          border: `1px solid ${pc.border}30`,
                          borderLeft: `3px solid ${pc.border}`,
                        }}
                      >
                        {/* Left info */}
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2.5 mb-1">
                              <p className="text-[15px] font-semibold text-white">{bill.name}</p>
                              <span
                                className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium"
                                style={{
                                  background: `${pc.dot}18`,
                                  color: pc.dot,
                                  border: `1px solid ${pc.dot}30`,
                                }}
                              >
                                {pc.label}
                              </span>
                              {urgent && (
                                <span
                                  className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium"
                                  style={{
                                    background: "rgba(239,68,68,0.12)",
                                    color: "#ef4444",
                                    border: "1px solid rgba(239,68,68,0.2)",
                                  }}
                                >
                                  {daysUntil === 0 ? "Due today" : daysUntil === 1 ? "Due tomorrow" : `${daysUntil}d left`}
                                </span>
                              )}
                            </div>
                            <p className="text-[12px]" style={{ color: "#555" }}>
                              Due{" "}
                              {new Date(bill.dueDate).toLocaleDateString("en-CA", {
                                month: "long",
                                day: "numeric",
                              })}
                              {!urgent && ` · ${daysUntil > 0 ? `${daysUntil} days away` : "overdue"}`}
                            </p>
                          </div>
                        </div>

                        {/* Right: amount + toggle */}
                        <div className="flex items-center justify-between sm:justify-end gap-5">
                          <p className="text-2xl font-bold tabular-nums text-white">${bill.amount}</p>
                          <button
                            onClick={() => togglePaid(bill.id, true)}
                            className="px-4 py-2 rounded-xl text-[12px] font-medium transition-all duration-100"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              color: "#666",
                              border: "1px solid #2a2a2a",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(34,197,94,0.1)";
                              e.currentTarget.style.color = "#22c55e";
                              e.currentTarget.style.borderColor = "rgba(34,197,94,0.3)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                              e.currentTarget.style.color = "#666";
                              e.currentTarget.style.borderColor = "#2a2a2a";
                            }}
                          >
                            Mark paid
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Paid bills */}
              {paid.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-px" style={{ background: "#1a1a1a" }} />
                    <span className="text-[11px] uppercase tracking-widest" style={{ color: "#333" }}>Paid</span>
                    <div className="flex-1 h-px" style={{ background: "#1a1a1a" }} />
                  </div>
                  <div className="space-y-2">
                    {paid.map((bill) => (
                      <div
                        key={bill.id}
                        className="rounded-2xl px-5 py-3.5 flex items-center justify-between"
                        style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", opacity: 0.5 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[14px] line-through" style={{ color: "#555" }}>
                            {bill.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[14px] line-through tabular-nums" style={{ color: "#444" }}>
                            ${bill.amount}
                          </span>
                          <button
                            onClick={() => togglePaid(bill.id, false)}
                            className="text-[11px] px-3 py-1.5 rounded-lg transition-colors"
                            style={{ color: "#333", border: "1px solid #1e1e1e" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
                          >
                            Undo
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
