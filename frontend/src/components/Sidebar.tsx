"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "▦" },
  { label: "Bills", href: "/bills", icon: "◷" },
  { label: "Insights", href: "/insights", icon: "◑" },
  { label: "Coach", href: "/coach", icon: "✦" },
  { label: "Challenge", href: "/challenge", icon: "◆" },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("uniwallet-profile");
      if (raw) {
        const p = JSON.parse(raw);
        setBalance(typeof p.currentBalance === "number" ? p.currentBalance : null);
      }
    } catch {}
  }, []);

  function handleReset() {
    localStorage.removeItem("uniwallet-profile");
    localStorage.removeItem("uniwallet-challenge");
    router.push("/onboarding");
  }

  return (
    <aside
      className="flex flex-col shrink-0 py-8"
      style={{ width: 240, background: "#0d0d0d", borderRight: "1px solid #1e1e1e" }}
    >
      {/* Brand */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2 mb-1.5">
          <span style={{ fontSize: 18 }}>💳</span>
          <p className="text-[15px] font-bold text-white tracking-tight">UniWallet</p>
        </div>
        {balance !== null && (
          <p className="text-[12px]" style={{ color: "#555" }}>
            Balance:{" "}
            <span className="font-medium" style={{ color: "#888" }}>
              ${balance.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-100"
              style={{
                background: active ? "rgba(59,130,246,0.1)" : "transparent",
                color: active ? "#3b82f6" : "#4a4a4a",
                borderLeft: active ? "2px solid #3b82f6" : "2px solid transparent",
                textDecoration: "none",
              }}
            >
              <span className="text-sm w-4 text-center leading-none shrink-0">{item.icon}</span>
              <span className="text-[13px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Reset */}
      <div className="px-4 pt-6" style={{ borderTop: "1px solid #181818" }}>
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-medium transition-all duration-100"
          style={{ background: "transparent", color: "#333", border: "1px solid #1e1e1e" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ef4444";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
            e.currentTarget.style.background = "rgba(239,68,68,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#333";
            e.currentTarget.style.borderColor = "#1e1e1e";
            e.currentTarget.style.background = "transparent";
          }}
        >
          ↩ Start Over
        </button>
      </div>
    </aside>
  );
}
