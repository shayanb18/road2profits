# UniWallet

AI-powered financial survival assistant for university students. Built at a hackathon in March 2026 by Shayan Baig and Mannix Graham.

A student enters their balance, income, pay schedule and bills. UniWallet forecasts whether they make it to the next paycheck, says which bills to pay first, and adds an AI money coach, weekly saving challenges, savings goals, side-hustle ideas and short finance lessons.

## What's in this repo

| Folder | What it is | Stack |
|:--|:--|:--|
| `/` (root) | Backend REST API | Express, TypeScript, Prisma, Supabase Postgres, OpenAI `gpt-4o-mini`, zod |
| `frontend/` | Web app: onboarding, dashboard, bills, coach, challenge, insights | Next.js 16, React 19, Tailwind |
| `frontend-client/` | Typed API client (`api.ts`) and React hooks (`hooks.ts`) for calling the backend; see `frontend-client/USAGE.md` | TypeScript |
| `tests.http` | Example requests for every endpoint (VS Code REST Client) | |

**Current state:** the frontend runs on its own. It stores the profile, bills and challenge in `localStorage` and computes the forecast and coach replies in the browser (`frontend/src/lib/forecast.ts`). It doesn't call the backend yet. `frontend-client/` is the planned bridge between the two.

---

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

No environment variables or backend needed.

### Backend

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Fill in DATABASE_URL, OPENAI_API_KEY, etc.

# 3. Push schema to Supabase
npm run db:generate
npm run db:push

# 4. Seed with test data
npm run db:seed

# 5. Start dev server
npm run dev
# → http://localhost:3001
```

> **Test user ID after seeding:** `seed-user-001`
> **Quick check:** `GET http://localhost:3001/api/dashboard/seed-user-001`

---

## Architecture

```
Express (Node.js + TypeScript)
  ├── REST API with consistent JSON responses
  ├── Supabase Postgres via Prisma ORM
  ├── OpenAI GPT-4o-mini for AI coach
  └── Rule-based budget engine (deterministic math, AI explains)
```

### Key design decisions
- All responses use `{ success, data, error }` shape — never raw objects
- All dates are ISO 8601 strings
- All enums are documented and consistent
- Dashboard endpoint aggregates everything for a single page load
- Budget math is computed server-side; AI only provides explanation

---

## Enum Reference (copy these into your frontend)

```typescript
type StudentType   = "living_at_home" | "dorm" | "off_campus"
type PayFrequency  = "weekly" | "biweekly" | "monthly"
type BillCategory  = "rent" | "tuition" | "utilities" | "phone" | "transit" | "groceries" | "subscriptions" | "insurance" | "other"
type Priority      = "high" | "medium" | "low"
type BudgetStatus  = "safe" | "warning" | "over_budget"
type ChallengeStatus = "active" | "completed" | "failed" | "skipped"
type SideHustleType = "gig" | "freelance" | "part_time" | "online" | "campus" | "tutoring"
type LocationType  = "remote" | "local" | "hybrid"
type SavingMethod  = "round_up" | "percentage" | "fixed_weekly" | "spare_change" | "manual"
type GoalCategory  = "emergency" | "education" | "travel" | "tech" | "general" | "housing"
type EducationCategory = "budgeting" | "credit" | "investing" | "taxes" | "side_hustles" | "savings"
```

---

## Standard Response Shape

Every endpoint returns this wrapper:

```json
{ "success": true, "data": { ... }, "error": null }
```

On error:
```json
{ "success": false, "data": null, "error": { "message": "Something went wrong" } }
```

---

## Frontend Contract

### PROFILE

---

#### `POST /api/profile` — Create profile (onboarding)

**Request body:**
```json
{
  "name": "Alex Chen",
  "school": "Wilfrid Laurier University",
  "studentType": "off_campus",
  "currentBalance": 847.50,
  "monthlyIncome": 1400,
  "payFrequency": "biweekly",
  "nextPayDate": "2025-04-05T00:00:00.000Z",
  "city": "Waterloo"
}
```

**Response `data`:**
```json
{
  "id": "clxyz123",
  "name": "Alex Chen",
  "school": "Wilfrid Laurier University",
  "studentType": "off_campus",
  "currentBalance": 847.50,
  "monthlyIncome": 1400,
  "payFrequency": "biweekly",
  "nextPayDate": "2025-04-05T00:00:00.000Z",
  "city": "Waterloo",
  "createdAt": "2025-03-28T00:00:00.000Z",
  "updatedAt": "2025-03-28T00:00:00.000Z"
}
```

---

#### `GET /api/profile/:userId`

Returns same shape as above.

---

#### `PUT /api/profile/:userId` — Update profile

Accepts partial body (any fields from POST). Returns updated profile.

---

### BILLS

---

#### `GET /api/bills/:userId` — List all bills

**Query params (optional):**
- `?paid=true` → only paid bills
- `?paid=false` → only unpaid bills

**Response `data`:** Array of bill objects:
```json
[
  {
    "id": "clbill001",
    "userId": "clxyz123",
    "name": "Rent",
    "amount": 650,
    "dueDate": "2025-04-01T00:00:00.000Z",
    "category": "rent",
    "priority": "high",
    "recurring": true,
    "isPaid": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

#### `POST /api/bills` — Create bill

**Request body:**
```json
{
  "userId": "clxyz123",
  "name": "Rent",
  "amount": 650,
  "dueDate": "2025-04-01T00:00:00.000Z",
  "category": "rent",
  "priority": "high",
  "recurring": true
}
```

Returns created bill object.

---

#### `PUT /api/bills/:billId` — Update bill

Accepts partial body. Returns updated bill.

---

#### `DELETE /api/bills/:billId`

**Response `data`:** `{ "deleted": true }`

---

#### `POST /api/bills/:billId/pay` — Mark as paid

Returns updated bill with `isPaid: true`.

---

### BUDGET FORECAST

---

#### `POST /api/forecast/:userId`

No request body needed. Reads current profile + bills from DB.

**Response `data`:**
```json
{
  "status": "warning",
  "projectedBalance": 73.50,
  "overUnderAmount": 73.50,
  "daysUntilNextPay": 8,
  "nextBillDue": {
    "name": "Rent",
    "amount": 650,
    "dueDate": "2025-04-01T00:00:00.000Z",
    "priority": "high"
  },
  "priorityPayments": [ /* array of bill objects, sorted high→low priority */ ],
  "totalUnpaidBills": 774,
  "recommendations": [
    "You're cutting it close — only $73.50 left after upcoming bills.",
    "Avoid non-essential spending until your next paycheck.",
    "Pay these first: Rent, Hydro Bill."
  ]
}
```

---

### AI COACH

---

#### `POST /api/ai/chat`

**Request body:**
```json
{
  "userId": "clxyz123",
  "message": "Can I afford going out this weekend?"
}
```

**Response `data`:**
```json
{
  "message": {
    "id": "clmsg001",
    "userId": "clxyz123",
    "role": "assistant",
    "content": "Honestly, it's tight right now. You've got $847 in the bank but rent ($650) is due in 3 days — after that you'll have about $73 left. I'd hold off on a big night out until after payday on April 5.",
    "timestamp": "2025-03-28T14:30:00.000Z"
  }
}
```

---

#### `GET /api/ai/history/:userId?limit=20`

Returns array of chat messages (user + assistant), oldest first.

---

### CHALLENGE

---

#### `GET /api/challenge/:userId`

Auto-creates a weekly challenge if none exists. Returns:

```json
{
  "id": "clchallenge001",
  "userId": "clxyz123",
  "title": "Takeout Budget",
  "description": "Keep takeout and dining spending under $30 this week...",
  "progress": 12,
  "target": 30,
  "streak": 2,
  "rewardLabel": "🍳 Home Chef Badge",
  "status": "active",
  "weekStart": "2025-03-24T00:00:00.000Z",
  "progressPercent": 40
}
```

---

#### `PUT /api/challenge/:challengeId/progress`

**Request body:** `{ "progress": 18 }`

Returns updated challenge. Automatically sets status to `"completed"` if progress ≥ target.

---

### SIDE HUSTLES

---

#### `GET /api/side-hustles?city=Waterloo&mode=remote&limit=6`

**Query params (all optional):**
- `city` — filter by city (currently cosmetic, data is national)
- `mode` — `"remote"` | `"local"` | omit for all
- `tags` — comma-separated: `"creative,remote,flexible"`
- `limit` — number of results (default: 6)

**Response `data`:** Array:
```json
[
  {
    "id": "sh-001",
    "title": "Peer Tutoring",
    "type": "tutoring",
    "estimatedEarnings": "$20–50/hr",
    "flexibility": "high",
    "locationType": "hybrid",
    "description": "Tutor fellow students in your strongest subjects...",
    "city": null,
    "tags": ["academic", "flexible", "no-startup-cost", "campus"]
  }
]
```

---

### SAVINGS GOALS

---

#### `GET /api/savings/:userId` — List all goals

**Response `data`:** Array of savings goal objects:
```json
[
  {
    "id": "clgoal001",
    "userId": "clxyz123",
    "title": "Emergency Fund",
    "description": "3 months of living expenses buffer",
    "targetAmount": 2000,
    "currentAmount": 320,
    "targetDate": "2025-09-24T00:00:00.000Z",
    "category": "emergency",
    "savingMethod": "fixed_weekly",
    "autoSaveAmount": 25,
    "autoSaveFreq": "weekly",
    "isActive": true,
    "progressPercent": 16,
    "amountRemaining": 1680,
    "projectedCompletionDate": "2026-05-10T00:00:00.000Z",
    "weeklyRequiredSave": 32.31,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

#### `GET /api/savings/:userId/:goalId` — Single goal with recent contributions

Adds `recentContributions` array to above shape:
```json
"recentContributions": [
  { "id": "clc001", "amount": 120, "note": "Side hustle earnings", "contributedAt": "..." }
]
```

---

#### `POST /api/savings` — Create goal

**Request body:**
```json
{
  "userId": "clxyz123",
  "title": "Emergency Fund",
  "description": "3 months of expenses",
  "targetAmount": 2000,
  "targetDate": "2025-09-01T00:00:00.000Z",
  "category": "emergency",
  "savingMethod": "fixed_weekly",
  "autoSaveAmount": 25,
  "autoSaveFreq": "weekly"
}
```

Required: `userId`, `title`, `targetAmount`. All others optional.

---

#### `PUT /api/savings/:goalId` — Update goal

Partial body accepted.

---

#### `DELETE /api/savings/:goalId`

**Response `data`:** `{ "deleted": true }`

---

#### `POST /api/savings/:goalId/contribute` — Add money to goal

**Request body:**
```json
{ "amount": 50, "note": "Tutoring session payout" }
```

**Response `data`:**
```json
{
  "contribution": {
    "id": "clc002",
    "amount": 50,
    "note": "Tutoring session payout",
    "contributedAt": "2025-03-28T15:00:00.000Z"
  },
  "goal": { /* updated goal object with new currentAmount */ }
}
```

---

#### `GET /api/savings/meta/methods` — All saving method descriptions

Useful for dropdowns in onboarding:
```json
[
  { "id": "round_up", "description": "Round up every purchase..." },
  { "id": "percentage", "description": "Save a fixed percentage of every paycheck..." },
  ...
]
```

---

### EDUCATION

---

#### `GET /api/education/modules?category=budgeting`

Returns all modules (or filtered by category).

**Response `data`:** Array:
```json
[
  {
    "id": "budgeting-101",
    "title": "Budgeting 101: The 50/30/20 Rule",
    "category": "budgeting",
    "description": "...",
    "estimatedMinutes": 5,
    "xpReward": 50,
    "tips": ["Track all spending for one week...", "..."],
    "keyTakeaways": ["50% of take-home pay goes to essentials...", "..."]
  }
]
```

---

#### `GET /api/education/modules/:moduleId`

Returns single module.

---

#### `GET /api/education/:userId` — User's education summary

```json
{
  "totalXp": 100,
  "completedModules": 2,
  "totalModules": 8,
  "modules": [ /* all modules with user progress attached */ ],
  "categoryProgress": {
    "budgeting": { "completed": 1, "total": 2 },
    "credit": { "completed": 0, "total": 1 },
    "savings": { "completed": 1, "total": 1 },
    ...
  },
  "nextSuggestedModule": { /* highest-XP incomplete module */ }
}
```

---

#### `POST /api/education/:userId/complete/:moduleId` — Mark module complete

```json
{
  "alreadyCompleted": false,
  "xpEarned": 75,
  "message": "🎉 Nice work! You earned 75 XP for completing \"Credit Scores: What Students Need to Know\"",
  "progress": {
    "moduleId": "credit-basics",
    "title": "Credit Scores: What Students Need to Know",
    "category": "credit",
    "completed": true,
    "completedAt": "2025-03-28T16:00:00.000Z",
    "xpEarned": 75
  }
}
```

---

### DASHBOARD (primary endpoint)

---

#### `GET /api/dashboard/:userId`

**Everything in one call.** Call this on initial page load.

**Response `data`:**
```json
{
  "profile": { /* ProfileResponse */ },
  "budgetInsight": {
    "status": "warning",
    "projectedBalance": 73.50,
    "overUnderAmount": 73.50,
    "daysUntilNextPay": 8,
    "nextBillDue": { "name": "Rent", "amount": 650, "dueDate": "...", "priority": "high" },
    "priorityPayments": [ /* bills sorted high→low */ ],
    "totalUnpaidBills": 774,
    "recommendations": ["You're cutting it close...", "Pay these first: Rent..."]
  },
  "upcomingBills": [ /* unpaid bills due in next 14 days */ ],
  "activeChallenge": { /* ChallengeResponse or null */ },
  "savingsGoals": [ /* SavingsGoalResponse[] */ ],
  "sideHustles": [ /* shown when status = warning or over_budget */ ],
  "educationSummary": {
    "totalXp": 100,
    "completedModules": 2,
    "totalModules": 8,
    "nextSuggestedModule": { /* EducationModule */ }
  },
  "recentChatMessage": { /* last AI message or null */ }
}
```

---

## File Structure

```
road2profits/
├── frontend/                  # Next.js web app (runs on its own, see "Current state")
│   └── src/
│       ├── app/               # Pages: onboarding, dashboard, bills, coach, challenge, insights
│       ├── components/        # Sidebar
│       ├── hooks/useProfile.ts
│       ├── lib/forecast.ts    # Client-side budget forecast
│       └── types/index.ts
├── frontend-client/           # api.ts + hooks.ts for calling the backend, USAGE.md
├── prisma/
│   └── schema.prisma          # DB schema (Profile, Bill, Challenge, SavingsGoal, EducationProgress, ChatMessage)
├── src/
│   ├── index.ts               # Server entry point
│   ├── app.ts                 # Express app + middleware + routes
│   ├── types/
│   │   └── index.ts           # All TypeScript types & interfaces
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── openai.ts          # OpenAI client
│   │   └── response.ts        # ok() / fail() / serverError() helpers
│   ├── middleware/
│   │   ├── rateLimit.ts       # In-memory rate limiter (hackathon-grade)
│   │   ├── schemas.ts         # zod request schemas
│   │   └── validate.ts        # Request validation middleware
│   ├── routes/
│   │   ├── profile.routes.ts
│   │   ├── bills.routes.ts
│   │   ├── forecast.routes.ts
│   │   ├── ai.routes.ts
│   │   ├── challenge.routes.ts
│   │   ├── sideHustles.routes.ts
│   │   ├── savings.routes.ts
│   │   ├── education.routes.ts
│   │   └── dashboard.routes.ts
│   ├── services/
│   │   ├── forecast.service.ts   # Budget math engine
│   │   ├── challenge.service.ts  # Weekly challenge generator
│   │   ├── savings.service.ts    # Savings goal formatter + method logic
│   │   └── education.service.ts  # Education modules + progress
│   └── data/
│       ├── sideHustles.ts        # Curated side hustle data + filter
│       └── seed.ts               # Dev seed script
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## Known issues

- The frontend doesn't call the backend yet (see "Current state" above).
- The rate limiter keeps its counts in memory, so they reset on restart and aren't shared between instances.

---

## Notes for Frontend

- **User ID:** Store the `id` from `POST /api/profile` in localStorage after onboarding. Use it in every subsequent call.
- **Dashboard first:** Always call `GET /api/dashboard/:userId` on app load. It returns everything.
- **Savings methods dropdown:** Call `GET /api/savings/meta/methods` to populate UI options.
- **Challenge progress:** The `progress` field is the raw number (e.g., dollars spent or days completed). You update it with `PUT /api/challenge/:id/progress`.
- **Education XP:** Show `totalXp` from dashboard summary. Award animation when `POST /education/:userId/complete/:moduleId` returns `alreadyCompleted: false`.
- **Side hustles on dashboard:** Only populated when `budgetInsight.status` is `"warning"` or `"over_budget"`.
- **Dates:** All dates are ISO 8601 strings. Use `new Date(isoString)` to parse.
- **AI chat fallback:** If `OPENAI_API_KEY` is missing, the `/api/ai/chat` endpoint will return a 500. Handle this gracefully in the UI.

---

## Available Education Categories (for filter UI)

| ID | Label |
|----|-------|
| `budgeting` | Budgeting |
| `credit` | Credit |
| `investing` | Investing |
| `taxes` | Taxes |
| `side_hustles` | Side Hustles |
| `savings` | Savings |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run compiled output |
| `npm run db:push` | Apply schema changes to Supabase |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:seed` | Seed dev data |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
