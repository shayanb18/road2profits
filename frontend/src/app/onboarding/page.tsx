"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StudentType, PayFrequency, Bill, BillPriority } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingData {
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
  icon: string;
  title: string;
  description: string;
}[] = [
  {
    value: "living_at_home",
    icon: "⌂",
    title: "Living at Home",
    description: "Staying with family, lower overhead costs",
  },
  {
    value: "dorm",
    icon: "◫",
    title: "Student Dorm",
    description: "On-campus housing, meals included",
  },
  {
    value: "off_campus",
    icon: "◻",
    title: "Off Campus",
    description: "Renting your own place, full expenses",
  },
];

const priorityOptions: { value: BillPriority; label: string; color: string }[] = [
  { value: "high", label: "High", color: "#ef4444" },
  { value: "medium", label: "Medium", color: "#eab308" },
  { value: "low", label: "Low", color: "#6b7280" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block text-[11px] uppercase tracking-[0.16em] font-medium mb-2"
      style={{ color: "#555" }}
    >
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
        <span
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium select-none"
          style={{ color: "#555" }}
        >
          {prefix}
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg text-sm outline-none transition-colors"
        style={{
          background: "#111",
          border: "1px solid #242424",
          color: "#f0f0f0",
          padding: prefix ? "10px 14px 10px 28px" : "10px 14px",
          colorScheme: "dark",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#333")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#242424")}
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
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg text-sm outline-none transition-colors appearance-none cursor-pointer"
      style={{
        background: "#111",
        border: "1px solid #242424",
        color: "#f0f0f0",
        padding: "10px 14px",
        colorScheme: "dark",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function Step1({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (v: StudentType) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-2">How are you living?</h2>
      <p className="text-sm text-neutral-500 mb-8">
        This helps us calibrate your financial baseline.
      </p>
      <div className="grid grid-cols-3 gap-4">
        {studentOptions.map((opt) => {
          const active = data.studentType === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="text-left rounded-xl p-5 transition-all duration-150"
              style={{
                background: active ? "rgba(255,255,255,0.06)" : "#0e0e0e",
                border: active ? "1px solid #333" : "1px solid #1c1c1c",
                boxShadow: active ? "0 0 0 1px #333" : "none",
              }}
            >
              <div
                className="text-2xl mb-4 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: active ? "#1a1a1a" : "#141414" }}
              >
                {opt.icon}
              </div>
              <p
                className="text-[14px] font-semibold mb-1.5"
                style={{ color: active ? "#fff" : "#aaa" }}
              >
                {opt.title}
              </p>
              <p className="text-[12px] leading-snug" style={{ color: "#444" }}>
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step2({
  data,
  onField,
}: {
  data: OnboardingData;
  onField: (k: keyof OnboardingData, v: string) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-2">Your money situation</h2>
      <p className="text-sm text-neutral-500 mb-8">
        We'll use this to project your balance before your next payday.
      </p>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <FieldLabel>Current Balance</FieldLabel>
          <StyledInput
            prefix="$"
            type="number"
            placeholder="0.00"
            value={data.currentBalance}
            onChange={(v) => onField("currentBalance", v)}
          />
        </div>
        <div>
          <FieldLabel>Monthly Income</FieldLabel>
          <StyledInput
            prefix="$"
            type="number"
            placeholder="0.00"
            value={data.monthlyIncome}
            onChange={(v) => onField("monthlyIncome", v)}
          />
        </div>
        <div>
          <FieldLabel>Pay Frequency</FieldLabel>
          <StyledSelect
            value={data.payFrequency}
            onChange={(v) => onField("payFrequency", v)}
            options={[
              { value: "weekly", label: "Weekly" },
              { value: "biweekly", label: "Biweekly" },
              { value: "monthly", label: "Monthly" },
            ]}
          />
        </div>
        <div>
          <FieldLabel>Next Pay Date</FieldLabel>
          <StyledInput
            type="date"
            placeholder=""
            value={data.nextPayDate}
            onChange={(v) => onField("nextPayDate", v)}
          />
        </div>
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

  const priorityColor: Record<BillPriority, string> = {
    high: "#ef4444",
    medium: "#eab308",
    low: "#6b7280",
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-2">What do you owe?</h2>
      <p className="text-sm text-neutral-500 mb-8">
        Add recurring bills — rent, utilities, subscriptions. You can skip this for now.
      </p>

      {/* Add bill form */}
      <div
        className="rounded-xl p-5 mb-5"
        style={{ background: "#0e0e0e", border: "1px solid #1c1c1c" }}
      >
        <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-600 mb-4">
          New Bill
        </p>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="col-span-2">
            <FieldLabel>Bill Name</FieldLabel>
            <StyledInput
              placeholder="e.g. Rent"
              value={name}
              onChange={setName}
            />
          </div>
          <div>
            <FieldLabel>Amount</FieldLabel>
            <StyledInput
              prefix="$"
              type="number"
              placeholder="0"
              value={amount}
              onChange={setAmount}
            />
          </div>
          <div>
            <FieldLabel>Due Date</FieldLabel>
            <StyledInput
              type="date"
              placeholder=""
              value={dueDate}
              onChange={setDueDate}
            />
          </div>
        </div>

        {/* Priority selector */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[11px] uppercase tracking-[0.16em] text-neutral-600">
            Priority
          </span>
          <div className="flex gap-2">
            {priorityOptions.map((p) => (
              <button
                key={p.value}
                onClick={() => setPriority(p.value)}
                className="px-3 py-1 rounded-md text-[12px] font-medium transition-all"
                style={{
                  background: priority === p.value ? `${p.color}18` : "#141414",
                  color: priority === p.value ? p.color : "#444",
                  border: priority === p.value ? `1px solid ${p.color}35` : "1px solid #222",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-[12px] mb-3" style={{ color: "#ef4444" }}>
            {error}
          </p>
        )}

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "#ccc",
            border: "1px solid #272727",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "#ccc";
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Bill
        </button>
      </div>

      {/* Bills list */}
      {data.bills.length > 0 ? (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid #1a1a1a" }}
        >
          {data.bills.map((bill, i) => (
            <div
              key={bill.id}
              className="flex items-center justify-between px-5 py-3.5"
              style={{
                background: i % 2 === 0 ? "#0a0a0a" : "#0c0c0c",
                borderBottom:
                  i < data.bills.length - 1 ? "1px solid #141414" : "none",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: priorityColor[bill.priority] }}
                />
                <span className="text-[13px] font-medium text-neutral-200">
                  {bill.name}
                </span>
                <span
                  className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{
                    background: `${priorityColor[bill.priority]}14`,
                    color: priorityColor[bill.priority],
                    border: `1px solid ${priorityColor[bill.priority]}25`,
                  }}
                >
                  {bill.priority}
                </span>
              </div>
              <div className="flex items-center gap-5">
                <span className="text-[12px] text-neutral-500">
                  Due{" "}
                  {new Date(bill.dueDate).toLocaleDateString("en-CA", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="text-[13px] font-semibold text-neutral-300 tabular-nums">
                  ${bill.amount}
                </span>
                <button
                  onClick={() => onRemoveBill(bill.id)}
                  className="text-[12px] transition-colors"
                  style={{ color: "#333" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="rounded-xl py-10 text-center"
          style={{ border: "1px dashed #1e1e1e" }}
        >
          <p className="text-[13px] text-neutral-700">No bills added yet — that's fine.</p>
        </div>
      )}
    </div>
  );
}

function Step4({ data }: { data: OnboardingData }) {
  const studentLabel = studentOptions.find((o) => o.value === data.studentType);
  const totalBills = data.bills.reduce((s, b) => s + b.amount, 0);

  const rows: { label: string; value: string }[] = [
    { label: "Living situation", value: studentLabel?.title ?? "—" },
    { label: "Current balance", value: data.currentBalance ? `$${Number(data.currentBalance).toLocaleString()}` : "—" },
    { label: "Monthly income", value: data.monthlyIncome ? `$${Number(data.monthlyIncome).toLocaleString()}` : "—" },
    {
      label: "Pay frequency",
      value:
        data.payFrequency === "biweekly"
          ? "Biweekly"
          : data.payFrequency === "weekly"
          ? "Weekly"
          : "Monthly",
    },
    {
      label: "Next pay date",
      value: data.nextPayDate
        ? new Date(data.nextPayDate).toLocaleDateString("en-CA", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "—",
    },
    {
      label: "Bills added",
      value: `${data.bills.length} bill${data.bills.length !== 1 ? "s" : ""}${
        totalBills > 0 ? ` · $${totalBills} total` : ""
      }`,
    },
  ];

  return (
    <div>
      <div className="mb-2">
        <span className="text-[11px] uppercase tracking-[0.2em] font-medium" style={{ color: "#22c55e" }}>
          All set
        </span>
      </div>
      <h2 className="text-2xl font-semibold text-white mb-2">Here's what we've got</h2>
      <p className="text-sm text-neutral-500 mb-8">
        Review your details. You can update everything later in settings.
      </p>

      <div
        className="rounded-xl overflow-hidden mb-8"
        style={{ border: "1px solid #1a1a1a" }}
      >
        {rows.map((row, i) => (
          <div
            key={row.label}
            className="flex items-center justify-between px-5 py-4"
            style={{
              background: i % 2 === 0 ? "#0a0a0a" : "#0c0c0c",
              borderBottom: i < rows.length - 1 ? "1px solid #141414" : "none",
            }}
          >
            <span className="text-[12px] uppercase tracking-[0.14em] font-medium" style={{ color: "#444" }}>
              {row.label}
            </span>
            <span className="text-[13px] font-medium text-neutral-300">{row.value}</span>
          </div>
        ))}
      </div>

      {data.bills.length > 0 && (
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{
            background: "rgba(34,197,94,0.05)",
            border: "1px solid #1a3326",
          }}
        >
          <span style={{ color: "#22c55e", fontSize: 14 }}>✓</span>
          <p className="text-[13px]" style={{ color: "#2d7a4f" }}>
            Your bills are prioritized. We'll tell you which ones to pay first based on your balance.
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
        data.currentBalance !== "" &&
        data.monthlyIncome !== "" &&
        data.nextPayDate !== ""
      );
    return true;
  }

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      // Save to localStorage and redirect
      localStorage.setItem(
        "uniwallet-profile",
        JSON.stringify({
          studentType: data.studentType,
          currentBalance: Number(data.currentBalance),
          monthlyIncome: Number(data.monthlyIncome),
          payFrequency: data.payFrequency,
          nextPayDate: data.nextPayDate,
          bills: data.bills,
        })
      );
      router.push("/dashboard");
    }
  }

  const progress = (step / TOTAL_STEPS) * 100;

  const stepLabels = ["Student Type", "Finances", "Bills", "Review"];

  return (
    <div
      className="flex h-screen overflow-hidden font-sans"
      style={{ background: "#080808", color: "#f5f5f5" }}
    >
      {/* ── Left panel ── */}
      <div
        className="flex flex-col w-72 shrink-0 px-8 py-10"
        style={{ background: "#0c0c0c", borderRight: "1px solid #141414" }}
      >
        {/* Brand */}
        <div className="mb-12">
          <p className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-0.5"
            style={{ color: "#22c55e" }}>
            UniWallet
          </p>
          <p className="text-[13px] text-neutral-600">Setup</p>
        </div>

        {/* Step list */}
        <div className="flex-1 space-y-1">
          {stepLabels.map((label, i) => {
            const n = i + 1;
            const done = n < step;
            const active = n === step;
            return (
              <div
                key={label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                style={{
                  background: active ? "rgba(255,255,255,0.05)" : "transparent",
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-semibold"
                  style={{
                    background: done ? "#15803d" : active ? "#1e1e1e" : "#111",
                    color: done ? "#fff" : active ? "#fff" : "#333",
                    border: done
                      ? "none"
                      : active
                      ? "1px solid #333"
                      : "1px solid #1c1c1c",
                  }}
                >
                  {done ? "✓" : n}
                </div>
                <span
                  className="text-[13px] font-medium"
                  style={{ color: done ? "#4ade80" : active ? "#fff" : "#333" }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <p className="text-[11px] leading-relaxed" style={{ color: "#2a2a2a" }}>
          Your data stays on your device. Nothing is shared without your permission.
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Progress bar */}
        <div
          className="relative h-0.5 w-full shrink-0"
          style={{ background: "#141414" }}
        >
          <div
            className="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #15803d, #4ade80)",
            }}
          />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-12 py-5 shrink-0"
          style={{ borderBottom: "1px solid #111" }}
        >
          <div className="flex items-center gap-2">
            {stepLabels.map((label, i) => {
              const n = i + 1;
              const done = n < step;
              const active = n === step;
              return (
                <div key={label} className="flex items-center gap-2">
                  {i > 0 && (
                    <div
                      className="w-6 h-px"
                      style={{ background: done ? "#1a3326" : "#161616" }}
                    />
                  )}
                  <span
                    className="text-[12px] font-medium"
                    style={{
                      color: active ? "#f0f0f0" : done ? "#2d5e42" : "#2a2a2a",
                    }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          <span className="text-[11px] tabular-nums" style={{ color: "#333" }}>
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-12 py-12">
            {step === 1 && (
              <Step1
                data={data}
                onChange={(v) => setData((d) => ({ ...d, studentType: v }))}
              />
            )}
            {step === 2 && <Step2 data={data} onField={setField} />}
            {step === 3 && (
              <Step3 data={data} onAddBill={addBill} onRemoveBill={removeBill} />
            )}
            {step === 4 && <Step4 data={data} />}
          </div>
        </div>

        {/* Footer nav */}
        <div
          className="flex items-center justify-between px-12 py-5 shrink-0"
          style={{ borderTop: "1px solid #111" }}
        >
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all disabled:opacity-0 disabled:pointer-events-none"
            style={{
              background: "transparent",
              color: "#555",
              border: "1px solid #1e1e1e",
            }}
            onMouseEnter={(e) => {
              if (step > 1) {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "#333";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#555";
              e.currentTarget.style.borderColor = "#1e1e1e";
            }}
          >
            ← Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: canProceed()
                ? step === TOTAL_STEPS
                  ? "linear-gradient(135deg, #15803d, #22c55e)"
                  : "#fff"
                : "#1e1e1e",
              color: canProceed()
                ? step === TOTAL_STEPS
                  ? "#fff"
                  : "#080808"
                : "#444",
            }}
          >
            {step === TOTAL_STEPS ? "See My Dashboard →" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
