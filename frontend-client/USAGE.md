# Frontend Integration Guide

Drop `api.ts` and `hooks.ts` into your frontend project at `src/lib/` or `src/hooks/`.

## Setup

In your frontend `.env`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001   # Next.js
VITE_API_URL=http://localhost:3001          # Vite/React
```

---

## Usage Examples

### Onboarding

```tsx
import { useOnboarding } from "@/hooks/hooks"

function OnboardingPage() {
  const { createProfile, loading, error } = useOnboarding()

  const handleSubmit = async (formData) => {
    const profile = await createProfile({
      name: formData.name,
      school: formData.school,
      studentType: formData.studentType,   // "off_campus" | "dorm" | "living_at_home"
      currentBalance: Number(formData.balance),
      monthlyIncome: Number(formData.income),
      payFrequency: formData.payFrequency, // "weekly" | "biweekly" | "monthly"
      nextPayDate: formData.nextPayDate,   // ISO string e.g. "2025-04-05T00:00:00.000Z"
      city: formData.city,
    })
    // profile.id is now saved in localStorage as "uniwallet_user_id"
    router.push("/dashboard")
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

---

### Dashboard Page

```tsx
import { useDashboard } from "@/hooks/hooks"
import { getUserId } from "@/lib/api"

function DashboardPage() {
  const userId = getUserId()
  const { data, loading, error } = useDashboard(userId)

  if (loading) return <Spinner />
  if (!data) return <OnboardingPrompt />

  const { profile, budgetInsight, upcomingBills, activeChallenge, savingsGoals } = data

  return (
    <div>
      <h1>Hey {profile.name} 👋</h1>

      {/* Budget status badge */}
      <StatusBadge status={budgetInsight.status} />
      {/* "safe" | "warning" | "over_budget" */}

      <p>Balance after bills: ${budgetInsight.projectedBalance.toFixed(2)}</p>
      <p>Days until payday: {budgetInsight.daysUntilNextPay}</p>

      {/* Recommendations */}
      {budgetInsight.recommendations.map((rec, i) => (
        <p key={i}>{rec}</p>
      ))}

      {/* Upcoming bills */}
      {upcomingBills.map(bill => (
        <BillCard key={bill.id} bill={bill} />
      ))}

      {/* Challenge */}
      {activeChallenge && <ChallengeCard challenge={activeChallenge} />}

      {/* Savings goals */}
      {savingsGoals.map(goal => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  )
}
```

---

### Bills Management

```tsx
import { useBills } from "@/hooks/hooks"

function BillsPage({ userId }) {
  const { bills, loading, markPaid, deleteBill, createBill } = useBills(userId, "unpaid")

  return (
    <div>
      {bills.map(bill => (
        <div key={bill.id}>
          <span>{bill.name} — ${bill.amount}</span>
          <span className={`priority-${bill.priority}`}>{bill.priority}</span>
          <button onClick={() => markPaid(bill.id)}>Mark Paid ✓</button>
          <button onClick={() => deleteBill(bill.id)}>Delete</button>
        </div>
      ))}

      <button onClick={() => createBill({
        name: "New Bill",
        amount: 50,
        dueDate: "2025-04-15T00:00:00.000Z",
        category: "utilities",
        priority: "high",
        recurring: false,
      })}>
        + Add Bill
      </button>
    </div>
  )
}
```

---

### AI Coach Chat

```tsx
import { useAICoach } from "@/hooks/hooks"

function ChatPage({ userId }) {
  const { messages, loading, chat } = useAICoach(userId)
  const [input, setInput] = useState("")

  const handleSend = async () => {
    await chat(input)
    setInput("")
  }

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id} className={`message ${msg.role}`}>
          {msg.content}
        </div>
      ))}
      {loading && <TypingIndicator />}

      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={handleSend} disabled={loading}>Send</button>
    </div>
  )
}
```

---

### Savings Goals

```tsx
import { useSavingsGoals } from "@/hooks/hooks"

function SavingsPage({ userId }) {
  const { goals, createGoal, contribute } = useSavingsGoals(userId)

  const handleContribute = async (goalId: string) => {
    const result = await contribute(goalId, 50, "Side hustle payout")
    // result.goal has updated currentAmount + progressPercent
  }

  return (
    <div>
      {goals.map(goal => (
        <div key={goal.id}>
          <h3>{goal.title}</h3>
          <progress value={goal.progressPercent} max={100} />
          <p>${goal.currentAmount} / ${goal.targetAmount}</p>
          {goal.weeklyRequiredSave && (
            <p>Save ${goal.weeklyRequiredSave}/week to hit your goal</p>
          )}
          <button onClick={() => handleContribute(goal.id)}>+ Add $50</button>
        </div>
      ))}

      <button onClick={() => createGoal({
        title: "Emergency Fund",
        targetAmount: 2000,
        category: "emergency",
        savingMethod: "fixed_weekly",
        autoSaveAmount: 25,
        autoSaveFreq: "weekly",
      })}>
        + New Goal
      </button>
    </div>
  )
}
```

---

### Education / Modules

```tsx
import { useEducation } from "@/hooks/hooks"

function EducationPage({ userId }) {
  const { education, totalXp, completeModule } = useEducation(userId)

  const handleComplete = async (moduleId: string) => {
    const result = await completeModule(moduleId)
    if (!result.alreadyCompleted) {
      showToast(`🎉 +${result.xpEarned} XP — ${result.message}`)
    }
  }

  return (
    <div>
      <h2>💡 {totalXp} XP earned</h2>
      {education?.modules.map(module => (
        <div key={module.id}>
          <h3>{module.title}</h3>
          <p>{module.description}</p>
          <p>~{module.estimatedMinutes} min · {module.xpReward} XP</p>
          {module.progress?.completed
            ? <span>✅ Completed</span>
            : <button onClick={() => handleComplete(module.id)}>Mark Complete</button>
          }
        </div>
      ))}
    </div>
  )
}
```

---

## Budget Status Colors (suggested)

```tsx
const STATUS_COLORS = {
  safe: "#22c55e",        // green
  warning: "#f59e0b",     // amber
  over_budget: "#ef4444", // red
}

const STATUS_LABELS = {
  safe: "You're good 🟢",
  warning: "Getting tight 🟡",
  over_budget: "Over budget 🔴",
}
```

## Priority Colors

```tsx
const PRIORITY_COLORS = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#6b7280",
}
```
