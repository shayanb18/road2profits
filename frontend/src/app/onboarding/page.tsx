"use client";

import { formatDay } from "@/lib/dates";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { StudentType, PayFrequency, Bill, BillPriority } from "@/types";
import { api, setUserId } from "@/lib/api";
import { Logo } from "@/components/Sidebar";
import { FIELD, BTN_PRIMARY, BTN_SECONDARY, CARD } from "@/components/ui";
import {
  HomeIcon,
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  XMarkIcon,
  CheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingData {
  name: string;
  school: string;
  city: string;
  studentType: StudentType | null;
  currentBalance: string;
  monthlyIncome: string;
  payFrequency: PayFrequency;
  nextPayDate: string;
  bills: Bill[];
}

const TOTAL_STEPS = 4;

// ─── Config ───────────────────────────────────────────────────────────────────

const studentOptions: {
  value: StudentType;
  Icon: typeof HomeIcon;
  title: string;
  description: string;
}[] = [
  { value: "living_at_home", Icon: HomeIcon, title: "Living at home", description: "With family, so fewer costs of your own." },
  { value: "dorm", Icon: BuildingLibraryIcon, title: "Student residence", description: "On campus, often with a meal plan." },
  { value: "off_campus", Icon: BuildingOffice2Icon, title: "Off campus", description: "Your own place: rent, utilities and food." },
];

// The landing page's status chips: red, amber, neutral.
const priorityStyle: Record<BillPriority, { label: string; bg: string; fg: string }> = {
  high: { label: "High", bg: "#fbe6e3", fg: "#a3271b" },
  medium: { label: "Medium", bg: "#fdf0dc", fg: "#8a5300" },
  low: { label: "Low", bg: "#ebe8e3", fg: "#55514c" },
};

const stepLabels = ["Living situation", "Your money", "Bills", "Review"];

// -1234.5 -> "-$1,234.50"; whole numbers keep no cents.
function money(n: number) {
  const s = Math.abs(n).toLocaleString("en-CA", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  return `${n < 0 ? "-" : ""}$${s}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium mb-2 text-[var(--uw-muted)]">{label}</span>
      {children}
    </label>
  );
}

function StyledInput({
  type = "text",
  placeholder,
  value,
  onChange,
  prefix,
}: {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] select-none text-[var(--uw-faint)]">
          {prefix}
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${FIELD} ${prefix ? "pl-8 pr-4" : "px-4"}`}
      />
    </div>
  );
}

function StyledSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${FIELD} px-4 appearance-none cursor-pointer`}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg aria-hidden viewBox="0 0 12 12" className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-[var(--uw-muted)]">
        <path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function StepHead({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="mb-10">
      <h1 className="text-[32px] md:text-[44px] leading-[1.08] font-normal tracking-[-0.035em] text-[var(--uw-ink)] mb-3">
        {title}
      </h1>
      <p className="text-[16px] md:text-[18px] leading-relaxed text-[var(--uw-muted)] max-w-xl">{lead}</p>
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function Step1({ data, onChange }: { data: OnboardingData; onChange: (v: StudentType) => void }) {
  return (
    <div>
      <StepHead title="Where do you live this term?" lead="It sets which costs UniWallet expects, like rent or a meal plan." />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="radiogroup" aria-label="Living situation">
        {studentOptions.map((opt) => {
          const active = data.studentType === opt.value;
          return (
            <button
              key={opt.value}
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              className={`${CARD} relative text-left p-3 flex items-center gap-4 sm:block transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uw-accent)] ${
                active ? "border-[var(--uw-accent)] shadow-[0_0_0_1px_var(--uw-accent)]" : "hover:border-[var(--uw-muted)]"
              }`}
            >
              <div className="w-20 h-20 shrink-0 sm:w-auto sm:h-28 rounded-xl flex items-center justify-center sm:mb-4" style={{ background: "var(--uw-lit)" }}>
                <span className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-[0_8px_20px_-12px_rgb(0_0_0/0.4)]">
                  <opt.Icon aria-hidden className="w-6 h-6" style={{ color: active ? "var(--uw-accent)" : "var(--uw-lit-ink)" }} />
                </span>
              </div>
              <div className="pr-8 sm:px-2 sm:pb-2">
                <p className="text-[18px] font-medium text-[var(--uw-ink)] mb-1">{opt.title}</p>
                <p className="text-[14px] leading-snug text-[var(--uw-muted)]">{opt.description}</p>
              </div>
              {active && (
                <span className="absolute top-5 right-5 w-6 h-6 rounded-full bg-[var(--uw-accent)] text-white flex items-center justify-center">
                  <CheckIcon aria-hidden className="w-3.5 h-3.5" strokeWidth={2.5} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step2({ data, onField }: { data: OnboardingData; onField: (k: keyof OnboardingData, v: string) => void }) {
  return (
    <div>
      <StepHead title="Your money right now" lead="Your balance and pay schedule set the forecast to your next payday." />
      <div className={`${CARD} p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6`}>
        <div className="sm:col-span-2">
          <Field label="Your name">
            <StyledInput placeholder="Priya" value={data.name} onChange={(v) => onField("name", v)} />
          </Field>
        </div>
        <Field label="School">
          <StyledInput placeholder="Wilfrid Laurier University" value={data.school} onChange={(v) => onField("school", v)} />
        </Field>
        <Field label="City">
          <StyledInput placeholder="Waterloo" value={data.city} onChange={(v) => onField("city", v)} />
        </Field>
        <Field label="Current balance">
          <StyledInput prefix="$" type="number" placeholder="0.00" value={data.currentBalance} onChange={(v) => onField("currentBalance", v)} />
        </Field>
        <Field label="Monthly income">
          <StyledInput prefix="$" type="number" placeholder="0.00" value={data.monthlyIncome} onChange={(v) => onField("monthlyIncome", v)} />
        </Field>
        <Field label="Pay frequency">
          <StyledSelect
            value={data.payFrequency}
            onChange={(v) => onField("payFrequency", v)}
            options={[
              { value: "weekly", label: "Weekly" },
              { value: "biweekly", label: "Every two weeks" },
              { value: "monthly", label: "Monthly" },
            ]}
          />
        </Field>
        <Field label="Next pay date">
          <StyledInput type="date" value={data.nextPayDate} onChange={(v) => onField("nextPayDate", v)} />
        </Field>
      </div>
    </div>
  );
}

function Step3({
  data,
  onAddBill,
  onRemoveBill,
}: {
  data: OnboardingData;
  onAddBill: (b: Bill) => void;
  onRemoveBill: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<BillPriority>("medium");
  const [error, setError] = useState("");

  function handleAdd() {
    if (!name.trim()) { setError("Bill name is required."); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (!dueDate) { setError("Due date is required."); return; }
    setError("");
    onAddBill({
      id: String(Date.now()),
      name: name.trim(),
      amount: Number(amount),
      dueDate,
      priority,
      paid: false,
    });
    setName("");
    setAmount("");
    setDueDate("");
    setPriority("medium");
  }

  const total = data.bills.reduce((s, b) => s + b.amount, 0);

  return (
    <div>
      <StepHead title="Bills you pay" lead="Rent, phone, subscriptions: anything that repeats. You can skip this and add bills later." />

      <div className={`${CARD} p-6 md:p-8 mb-4`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-6 mb-6">
          <div className="col-span-2">
            <Field label="Bill name">
              <StyledInput placeholder="Rent" value={name} onChange={setName} />
            </Field>
          </div>
          <Field label="Amount">
            <StyledInput prefix="$" type="number" placeholder="0" value={amount} onChange={setAmount} />
          </Field>
          <Field label="Due date">
            <StyledInput type="date" value={dueDate} onChange={setDueDate} />
          </Field>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="block text-[13px] font-medium mb-2 text-[var(--uw-muted)]">Priority</span>
            <div role="radiogroup" aria-label="Priority" className="inline-flex p-1 rounded-lg bg-[var(--uw-raised)] gap-1">
              {(Object.keys(priorityStyle) as BillPriority[]).map((p) => {
                const on = priority === p;
                return (
                  <button
                    key={p}
                    role="radio"
                    aria-checked={on}
                    onClick={() => setPriority(p)}
                    className={`h-9 px-4 rounded-md text-[14px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[var(--uw-accent)] ${
                      on ? "bg-white text-[var(--uw-ink)] shadow-[0_1px_2px_rgb(0_0_0/0.12)]" : "text-[var(--uw-muted)] hover:text-[var(--uw-ink)]"
                    }`}
                  >
                    {priorityStyle[p].label}
                  </button>
                );
              })}
            </div>
          </div>
          <button onClick={handleAdd} className={BTN_SECONDARY}>
            <PlusIcon aria-hidden className="w-4 h-4" strokeWidth={2} />
            Add bill
          </button>
        </div>

        {error && (
          <p role="alert" className="text-[14px] mt-4" style={{ color: "#a3271b" }}>
            {error}
          </p>
        )}
      </div>

      {data.bills.length > 0 ? (
        <div className={`${CARD} overflow-hidden`}>
          <ul>
            {data.bills.map((bill) => {
              const ps = priorityStyle[bill.priority];
              return (
                <li key={bill.id} className="flex items-center gap-4 px-6 py-4 border-b border-[var(--uw-line)] last:border-b-0">
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-[14px] font-medium" style={{ background: "var(--uw-lit)", color: "var(--uw-lit-ink)" }}>
                    {bill.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-medium text-[var(--uw-ink)] truncate first-letter:uppercase">{bill.name}</p>
                    <p className="text-[14px] text-[var(--uw-muted)]">
                      Due {formatDay(bill.dueDate, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[13px] font-medium" style={{ background: ps.bg, color: ps.fg }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden />
                    {ps.label}
                  </span>
                  <span className="text-[16px] font-medium tabular-nums text-[var(--uw-ink)] w-24 text-right">{money(bill.amount)}</span>
                  <button
                    onClick={() => onRemoveBill(bill.id)}
                    aria-label={`Remove ${bill.name}`}
                    className="w-9 h-9 -mr-2 rounded-lg flex items-center justify-center text-[var(--uw-muted)] transition-colors hover:bg-[#fbe6e3] hover:text-[#a3271b]"
                  >
                    <XMarkIcon aria-hidden className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex justify-between px-6 py-4 bg-[var(--uw-raised)] text-[14px]">
            <span className="text-[var(--uw-muted)]">
              {data.bills.length} bill{data.bills.length !== 1 ? "s" : ""}
            </span>
            <span className="font-medium tabular-nums text-[var(--uw-ink)]">{money(total)} total</span>
          </div>
        </div>
      ) : (
        <div className="rounded-[20px] border border-dashed border-[var(--uw-line)] py-10 text-center">
          <p className="text-[16px] text-[var(--uw-muted)]">No bills yet. Add one above, or continue without.</p>
        </div>
      )}
    </div>
  );
}

function Step4({ data }: { data: OnboardingData }) {
  const studentLabel = studentOptions.find((o) => o.value === data.studentType);
  const totalBills = data.bills.reduce((s, b) => s + b.amount, 0);

  const rows: { label: string; value: string }[] = [
    { label: "Name", value: data.name.trim() || "—" },
    { label: "School", value: data.school.trim() || "—" },
    { label: "City", value: data.city.trim() || "—" },
    { label: "Living situation", value: studentLabel?.title ?? "—" },
    { label: "Current balance", value: data.currentBalance ? money(Number(data.currentBalance)) : "—" },
    { label: "Monthly income", value: data.monthlyIncome ? money(Number(data.monthlyIncome)) : "—" },
    {
      label: "Pay frequency",
      value: data.payFrequency === "biweekly" ? "Every two weeks" : data.payFrequency === "weekly" ? "Weekly" : "Monthly",
    },
    {
      label: "Next pay date",
      value: data.nextPayDate ? formatDay(data.nextPayDate, { month: "long", day: "numeric", year: "numeric" }) : "—",
    },
    {
      label: "Bills",
      value: `${data.bills.length} bill${data.bills.length !== 1 ? "s" : ""}${totalBills > 0 ? `, ${money(totalBills)} total` : ""}`,
    },
  ];

  return (
    <div>
      <StepHead title="Check your details" lead="Go back to change anything. Your forecast is ready on the next screen." />

      <dl className={`${CARD} overflow-hidden mb-4`}>
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[var(--uw-line)] last:border-b-0">
            <dt className="text-[14px] text-[var(--uw-muted)]">{row.label}</dt>
            <dd className="text-[16px] font-medium text-[var(--uw-ink)] text-right">{row.value}</dd>
          </div>
        ))}
      </dl>

      {data.bills.length > 0 && (
        <div className="rounded-[20px] p-5 flex items-start gap-3" style={{ background: "var(--uw-lit)", color: "var(--uw-lit-ink)" }}>
          <span className="w-6 h-6 rounded-full bg-[var(--uw-accent)] text-white flex items-center justify-center shrink-0">
            <CheckIcon aria-hidden className="w-3.5 h-3.5" strokeWidth={2.5} />
          </span>
          <p className="text-[16px] leading-relaxed">
            Your bills will be sorted by due date, then priority, so the dashboard shows which to pay first.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    school: "",
    city: "",
    studentType: null,
    currentBalance: "",
    monthlyIncome: "",
    payFrequency: "biweekly",
    nextPayDate: "",
    bills: [],
  });

  function setField(k: keyof OnboardingData, v: string) {
    setData((d) => ({ ...d, [k]: v }));
  }

  function addBill(bill: Bill) {
    setData((d) => ({ ...d, bills: [...d.bills, bill] }));
  }

  function removeBill(id: string) {
    setData((d) => ({ ...d, bills: d.bills.filter((b) => b.id !== id) }));
  }

  function canProceed() {
    if (step === 1) return data.studentType !== null;
    if (step === 2)
      return (
        data.name.trim() !== "" &&
        data.school.trim() !== "" &&
        data.city.trim() !== "" &&
        data.currentBalance !== "" &&
        data.monthlyIncome !== "" &&
        data.nextPayDate !== ""
      );
    return true;
  }

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const profileId = useRef<string | null>(null);

  async function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      // On a retry, reuse the profile and skip bills that already saved, so nothing is duplicated.
      if (!profileId.current) {
        const profile = await api.profile.create({
          name: data.name.trim(),
          school: data.school.trim(),
          city: data.city.trim(),
          studentType: data.studentType!,
          currentBalance: Number(data.currentBalance),
          monthlyIncome: Number(data.monthlyIncome),
          payFrequency: data.payFrequency,
          nextPayDate: data.nextPayDate,
        });
        profileId.current = profile.id;
      }
      for (const bill of data.bills) {
        await api.bills.create({
          userId: profileId.current,
          name: bill.name,
          amount: bill.amount,
          dueDate: bill.dueDate,
          category: "other",
          priority: bill.priority,
        });
        setData((d) => ({ ...d, bills: d.bills.filter((b) => b.id !== bill.id) }));
      }
      setUserId(profileId.current);
      router.push("/dashboard");
    } catch {
      setSaveError("Couldn't save your details. Check that the UniWallet server is running, then try again.");
      setSaving(false);
    }
  }

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="flex h-dvh overflow-hidden font-sans bg-[var(--uw-bg)] text-[var(--uw-ink)]">
      {/* ── Left: the steps on the landing page's lit panel ── */}
      <aside className="hidden md:flex p-4 shrink-0">
        <div className="flex flex-col w-72 rounded-[20px] px-6 py-8" style={{ background: "var(--uw-lit)", color: "var(--uw-lit-ink)" }}>
          <a href="/" className="flex items-center gap-2.5 text-[20px] font-medium tracking-[-0.02em] mb-12">
            <Logo size={20} />
            UniWallet
          </a>

          <ol className="flex-1 space-y-1" aria-label="Setup steps">
            {stepLabels.map((label, i) => {
              const n = i + 1;
              const done = n < step;
              const active = n === step;
              return (
                <li
                  key={label}
                  aria-current={active ? "step" : undefined}
                  className={`flex items-center gap-3 h-12 px-3 rounded-xl transition-colors ${active ? "bg-white shadow-[0_8px_20px_-14px_rgb(0_0_0/0.45)]" : ""}`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[13px] font-medium ${
                      done ? "bg-[var(--uw-accent)] text-white" : active ? "bg-[var(--uw-ink)] text-white" : "border border-[var(--uw-lit-muted)] text-[var(--uw-lit-muted)]"
                    }`}
                  >
                    {done ? <CheckIcon aria-hidden className="w-3.5 h-3.5" strokeWidth={2.5} /> : n}
                  </span>
                  <span className={`text-[16px] ${active ? "font-medium text-[var(--uw-ink)]" : "text-[var(--uw-lit-ink)]"}`}>{label}</span>
                </li>
              );
            })}
          </ol>

          <p className="text-[14px] leading-relaxed text-[var(--uw-lit-muted)]">
            Saved to UniWallet so the coach can answer with your real numbers. No account or password.
          </p>
        </div>
      </aside>

      {/* ── Right: the step ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-6 px-5 md:px-12 pt-6 md:pt-8 shrink-0">
          <a href="/" className="md:hidden flex items-center gap-2 text-[18px] font-medium tracking-[-0.02em]">
            <Logo size={18} />
            UniWallet
          </a>
          <div className="flex-1 h-1 rounded-full bg-[var(--uw-raised)] overflow-hidden" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-label="Setup progress">
            <div className="h-full rounded-full bg-[var(--uw-accent)] transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[13px] font-medium tabular-nums text-[var(--uw-muted)] shrink-0">
            Step {step} of {TOTAL_STEPS}
          </span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-5 md:px-12 py-10 md:py-16">
            {step === 1 && <Step1 data={data} onChange={(v) => setData((d) => ({ ...d, studentType: v }))} />}
            {step === 2 && <Step2 data={data} onField={setField} />}
            {step === 3 && <Step3 data={data} onAddBill={addBill} onRemoveBill={removeBill} />}
            {step === 4 && <Step4 data={data} />}
          </div>
        </main>

        <footer className="shrink-0 border-t border-[var(--uw-line)] px-5 md:px-12 py-5">
          <div className="max-w-3xl mx-auto">
            {saveError && (
              <p role="alert" className="mb-4 rounded-lg px-4 py-3 text-[14px]" style={{ background: "#fbe6e3", color: "#a3271b" }}>
                {saveError}
              </p>
            )}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 1}
                className={`${BTN_SECONDARY} disabled:invisible`}
              >
                <ArrowLeftIcon aria-hidden className="w-4 h-4" strokeWidth={2} />
                Back
              </button>
              <button onClick={handleNext} disabled={!canProceed() || saving} className={BTN_PRIMARY}>
                {saving ? "Saving…" : step === TOTAL_STEPS ? "See my dashboard" : "Continue"}
                {!saving && <ArrowRightIcon aria-hidden className="w-4 h-4" strokeWidth={2} />}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
