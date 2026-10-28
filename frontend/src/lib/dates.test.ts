// Run from the repo root: TZ=America/Toronto npx tsx --test frontend/src/lib/dates.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDay, daysUntil } from "./dates";

test("a stored calendar day keeps its date west of UTC", () => {
  assert.equal(formatDay("2026-11-05", { month: "short", day: "numeric" }), "Nov 5");
  assert.equal(formatDay("2026-11-05T00:00:00.000Z", { month: "short", day: "numeric" }), "Nov 5");
});

test("daysUntil counts calendar days from the local date", () => {
  const evening = new Date(2026, 9, 28, 21, 30); // Oct 28, 9:30 pm local (already Oct 29 in UTC when TZ=America/Toronto)
  assert.equal(daysUntil("2026-11-05", evening), 8);
  assert.equal(daysUntil("2026-10-28", evening), 0);
  assert.equal(daysUntil("2026-10-29T00:00:00.000Z", evening), 1);
  assert.equal(daysUntil("2026-10-27", evening), -1);
});
