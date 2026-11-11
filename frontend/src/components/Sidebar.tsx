"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Squares2X2Icon,
  BanknotesIcon,
  ChartPieIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { clearUserId } from "@/lib/api";
import { BTN_SECONDARY } from "@/components/ui";

// -1234.5 -> "-$1,234.50"
export function money(n: number) {
  return `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const NAV = [
  { label: "Dashboard", href: "/dashboard", Icon: Squares2X2Icon },
  { label: "Bills", href: "/bills", Icon: BanknotesIcon },
  { label: "Insights", href: "/insights", Icon: ChartPieIcon },
  { label: "Coach", href: "/coach", Icon: ChatBubbleLeftRightIcon },
  { label: "Challenge", href: "/challenge", Icon: TrophyIcon },
];

// The initial tile, the same mark as the landing page's nav.
export function Logo({ size = 18 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center font-semibold leading-none"
      style={{ width: size + 4, height: size + 4, borderRadius: 6, background: "var(--uw-accent)", color: "#fff", fontSize: size * 0.7 }}
    >
      U
    </span>
  );
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
      className={`${BTN_SECONDARY} w-full hover:border-[var(--uw-red)] hover:text-[var(--uw-red)]`}
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
      <aside className="hidden md:flex p-4 shrink-0">
        <div className="flex flex-col w-60 rounded-[20px] px-5 py-7" style={{ background: "var(--uw-lit)", color: "var(--uw-lit-ink)" }}>
          <Link href="/dashboard" className="flex items-center gap-2.5 text-[20px] font-medium tracking-[-0.02em] px-2 mb-2">
            <Logo size={20} />
            UniWallet
          </Link>
          {balance !== undefined && (
            <p className="text-[14px] px-2 mb-10 text-[var(--uw-lit-muted)]">
              Balance <span className="font-medium tabular-nums text-[var(--uw-lit-ink)]">{money(balance)}</span>
            </p>
          )}

          <nav className="flex-1 space-y-1">
            {NAV.map(({ label, href, Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 h-11 px-3 rounded-xl text-[16px] transition-colors ${
                    active ? "bg-white font-medium text-[var(--uw-ink)] shadow-[0_8px_20px_-14px_rgb(0_0_0/0.45)]" : "text-[var(--uw-lit-ink)] hover:bg-white/50"
                  }`}
                >
                  <Icon aria-hidden className={`w-5 h-5 shrink-0 ${active ? "text-[var(--uw-accent)]" : ""}`} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <StartOver />
        </div>
      </aside>

      <nav
        className="md:hidden order-last shrink-0 flex justify-around pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
        style={{ background: "var(--uw-bg)", borderTop: "1px solid var(--uw-line)" }}
      >
        {NAV.map(({ label, href, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="flex flex-col items-center gap-1 px-2 py-1 min-w-14"
              style={{ color: active ? "var(--uw-accent-text)" : "var(--uw-muted)", textDecoration: "none" }}
            >
              <Icon aria-hidden className="w-5 h-5" />
              <span className="text-[12px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
