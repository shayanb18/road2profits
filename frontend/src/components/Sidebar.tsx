"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Squares2X2Icon,
  BanknotesIcon,
  ChartPieIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { clearUserId } from "@/lib/api";

export const NAV = [
  { label: "Dashboard", href: "/dashboard", Icon: Squares2X2Icon },
  { label: "Bills", href: "/bills", Icon: BanknotesIcon },
  { label: "Insights", href: "/insights", Icon: ChartPieIcon },
  { label: "Coach", href: "/coach", Icon: ChatBubbleLeftRightIcon },
  { label: "Challenge", href: "/challenge", Icon: TrophyIcon },
];

export function Logo({ size = 18 }: { size?: number }) {
  return <WalletIcon aria-hidden style={{ width: size, height: size, color: "#3b82f6" }} />;
}

// Forgets this browser's user and goes back to onboarding. Lives in the sidebar on desktop and on the dashboard on phones.
export function StartOver() {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        clearUserId();
        router.push("/onboarding");
      }}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-medium transition-all duration-100"
      style={{ background: "transparent", color: "#555", border: "1px solid #1e1e1e" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#ef4444";
        e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
        e.currentTarget.style.background = "rgba(239,68,68,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "#555";
        e.currentTarget.style.borderColor = "#1e1e1e";
        e.currentTarget.style.background = "transparent";
      }}
    >
      Start over
    </button>
  );
}

// Desktop: left sidebar. Phones: bottom tab bar (order-last puts it under the page in a flex-col layout).
export function Sidebar({ balance }: { balance?: number }) {
  const pathname = usePathname();

  return (
    <>
      <aside
        className="hidden md:flex flex-col shrink-0 py-8"
        style={{ width: 240, background: "#0d0d0d", borderRight: "1px solid #1e1e1e" }}
      >
        {/* Brand */}
        <div className="px-6 mb-8">
          <div className="flex items-center gap-2 mb-1.5">
            <Logo />
            <p className="text-[15px] font-bold text-white tracking-tight">UniWallet</p>
          </div>
          {balance !== undefined && (
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
          {NAV.map(({ label, href, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-100"
                style={{
                  background: active ? "rgba(59,130,246,0.1)" : "transparent",
                  color: active ? "#3b82f6" : "#4a4a4a",
                  borderLeft: active ? "2px solid #3b82f6" : "2px solid transparent",
                  textDecoration: "none",
                }}
              >
                <Icon aria-hidden className="w-4 h-4 shrink-0" />
                <span className="text-[13px] font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Reset */}
        <div className="px-4 pt-6" style={{ borderTop: "1px solid #181818" }}>
          <StartOver />
        </div>
      </aside>

      <nav
        className="md:hidden order-last shrink-0 flex justify-around pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
        style={{ background: "#0d0d0d", borderTop: "1px solid #1e1e1e" }}
      >
        {NAV.map(({ label, href, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="flex flex-col items-center gap-1 px-2 py-1 min-w-14"
              style={{ color: active ? "#3b82f6" : "#555", textDecoration: "none" }}
            >
              <Icon aria-hidden className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
