"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BanknotesIcon, ChartPieIcon, ChatBubbleLeftRightIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { Logo } from "@/components/Sidebar";
import { getUserId } from "@/lib/api";

const FEATURES = [
  {
    Icon: BanknotesIcon,
    title: "Bill tracker",
    description:
      "Add all your recurring bills and see exactly what's due before your next payday. Nothing sneaks up on you.",
  },
  {
    Icon: ChartPieIcon,
    title: "Spending insights",
    description:
      "See which bills are eating your balance and get plain-English alerts when things look tight.",
  },
  {
    Icon: ChatBubbleLeftRightIcon,
    title: "AI money coach",
    description:
      "Ask anything, like \"why am I broke?\" or \"what can I cut?\", and get honest, no-jargon answers based on your actual numbers.",
  },
  {
    Icon: TrophyIcon,
    title: "Weekly challenges",
    description:
      "Build better habits one week at a time. No takeout, spend under $30 on food, no non-essentials until payday.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Tell us your situation",
    body: "Pick your living situation, enter your current balance, income, and when you get paid. Takes about 2 minutes.",
  },
  {
    n: "02",
    title: "Add your bills",
    body: "Add rent, hydro, subscriptions: whatever you owe. We rank them by priority so you know what to pay first.",
  },
  {
    n: "03",
    title: "Get your forecast",
    body: "Instantly see how much you'll have before payday, what to pay, and where to cut. No surprises.",
  },
];

const STATS = [
  { value: "4 steps", label: "to your first forecast" },
  { value: "Bills ranked", label: "by due date, then priority" },
  { value: "AI coach", label: "that answers with your numbers" },
];

// Sample card date: always nine days out, so it never goes stale.
function sampleDate() {
  return new Date(Date.now() + 9 * 864e5).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

export default function HomePage() {
  const router = useRouter();
  // undefined on the server, then the stored user id (or null) in the browser
  const userId = useSyncExternalStore(() => () => {}, getUserId, () => undefined);

  useEffect(() => {
    if (userId) router.replace("/dashboard");
  }, [userId, router]);

  if (userId !== null) {
    return <div className="h-screen" style={{ background: "#0a0a0a" }} />;
  }

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: "#0a0a0a", color: "#f0f0f0" }}
    >
      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 py-4"
        style={{
          background: "rgba(10,10,10,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #161616",
        }}
      >
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-[15px] font-bold text-white tracking-tight">UniWallet</span>
        </div>
        <Link
          href="/onboarding"
          className="px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-100"
          style={{
            background: "#3b82f6",
            color: "#fff",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#2563eb")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#3b82f6")}
        >
          Get started →
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 70%)",
          }}
        />

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-medium mb-6"
          style={{
            background: "rgba(59,130,246,0.1)",
            border: "1px solid rgba(59,130,246,0.2)",
            color: "#3b82f6",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#3b82f6", display: "inline-block" }} />
          Built for students, by students
        </div>

        {/* Headline */}
        <h1
          className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-5 max-w-2xl [text-wrap:balance]"
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Know exactly where you stand before payday.
        </h1>

        {/* Subheadline */}
        <p className="text-[17px] leading-relaxed max-w-lg mb-10" style={{ color: "#777" }}>
          UniWallet shows you which bills to pay first, how much you&apos;ll have left, and what to cut, without the spreadsheets.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/onboarding"
            className="px-6 py-3.5 rounded-xl text-[14px] font-bold transition-all duration-150"
            style={{ background: "#3b82f6", color: "#fff" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#2563eb";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#3b82f6";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            Set up my wallet. It&apos;s free →
          </Link>
        </div>

        {/* Trust note */}
        <p className="text-[12px] mt-4" style={{ color: "#444" }}>
          No account or password needed.
        </p>
      </section>

      {/* ── Stats strip ── */}
      <section
        className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#1a1a1a] mx-4 md:mx-8 rounded-2xl overflow-hidden"
        style={{ border: "1px solid #1e1e1e", background: "#0e0e0e" }}
      >
        {STATS.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-center text-center px-4 py-6"
          >
            <p className="text-2xl font-bold text-white mb-1">{s.value}</p>
            <p className="text-[12px]" style={{ color: "#555" }}>{s.label}</p>
          </div>
        ))}
      </section>

      {/* ── How it works ── */}
      <section className="px-4 md:px-8 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.2em] font-medium text-center mb-3" style={{ color: "#3b82f6" }}>
            How it works
          </p>
          <h2 className="text-3xl font-bold text-white text-center mb-12 tracking-tight">
            Up and running in minutes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="rounded-2xl px-6 py-6"
                style={{ background: "#111", border: "1px solid #1e1e1e" }}
              >
                <p
                  className="text-[11px] font-mono font-bold mb-4"
                  style={{ color: "#3b82f6" }}
                >
                  {step.n}
                </p>
                <h3 className="text-[16px] font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: "#666" }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-4 md:px-8 pb-16 md:pb-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.2em] font-medium text-center mb-3" style={{ color: "#3b82f6" }}>
            What you get
          </p>
          <h2 className="text-3xl font-bold text-white text-center mb-12 tracking-tight">
            Everything a student needs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl px-6 py-6 flex gap-4"
                style={{ background: "#111", border: "1px solid #1e1e1e" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base"
                  style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.15)" }}
                >
                  <f.Icon aria-hidden className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-white mb-1.5">{f.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#666" }}>
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Status preview ── */}
      <section className="px-4 md:px-8 pb-16 md:pb-20">
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-2xl px-5 md:px-8 py-8"
            style={{
              background: "rgba(234,179,8,0.05)",
              border: "1px solid rgba(234,179,8,0.15)",
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div>
                <span
                  className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3"
                  style={{
                    background: "rgba(234,179,8,0.12)",
                    color: "#eab308",
                    border: "1px solid rgba(234,179,8,0.2)",
                  }}
                >
                  Warning
                </span>
                <p className="text-2xl font-bold mb-1" style={{ color: "#eab308" }}>
                  Heads up, it&apos;s tight
                </p>
                <p className="text-[13px]" style={{ color: "#888" }}>
                  You&apos;ll have this much before payday
                </p>
                <p className="text-4xl font-bold tabular-nums text-white mt-2">$84.50</p>
              </div>
              <div className="space-y-3 sm:text-right shrink-0">
                <div>
                  <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#555" }}>Next payday</p>
                  <p className="text-[14px] font-semibold text-white">{sampleDate()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#555" }}>Next bill due</p>
                  <p className="text-[14px] font-semibold text-white">Rent <span style={{ color: "#555", fontWeight: 400 }}>$750</span></p>
                </div>
              </div>
            </div>
            <p className="text-[12px] mt-6" style={{ color: "#444" }}>
              This is what your dashboard looks like. No guessing, just the facts.
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-4 md:px-8 pb-24">
        <div
          className="max-w-4xl mx-auto rounded-2xl px-5 md:px-8 py-12 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.03) 100%)",
            border: "1px solid rgba(59,130,246,0.15)",
          }}
        >
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Stop guessing. Start knowing.
          </h2>
          <p className="text-[15px] mb-8" style={{ color: "#666" }}>
            Set up takes 2 minutes. No account, no app, no nonsense.
          </p>
          <Link
            href="/onboarding"
            className="inline-block px-8 py-4 rounded-xl text-[15px] font-bold transition-all duration-150"
            style={{ background: "#3b82f6", color: "#fff" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#2563eb";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#3b82f6";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            Set up my wallet →
          </Link>
          <p className="text-[12px] mt-4" style={{ color: "#333" }}>
            Free. No account or password.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="flex flex-wrap items-center justify-center gap-y-2 px-4 md:px-8 py-6"
        style={{ borderTop: "1px solid #141414" }}
      >
        <div className="flex items-center gap-2">
          <Logo size={14} />
          <span className="text-[13px] font-semibold text-white">UniWallet</span>
        </div>
        <span className="mx-4" style={{ color: "#2a2a2a" }}>·</span>
        <p className="text-[12px]" style={{ color: "#333" }}>
          Student finance, simplified.
        </p>
      </footer>
    </div>
  );
}
