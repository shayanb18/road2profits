// One look for every screen (the landing page's): fields, buttons, cards and status chips.
export const FIELD =
  "w-full h-12 rounded-lg bg-[var(--uw-surface)] border border-[var(--uw-line)] text-[16px] text-[var(--uw-ink)] placeholder:text-[var(--uw-faint)] outline-none transition-[border-color,box-shadow] focus:border-[var(--uw-accent)] focus:shadow-[0_0_0_3px_rgb(37_111_130/0.18)]";
export const BTN =
  "inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg text-[16px] font-medium transition-[transform,background-color,border-color,color] duration-150 hover:-translate-y-px active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uw-accent)]";
export const BTN_PRIMARY = `${BTN} bg-[var(--uw-accent)] text-white hover:bg-[var(--uw-accent-hover)] disabled:opacity-40`;
export const BTN_SECONDARY = `${BTN} bg-[var(--uw-surface)] text-[var(--uw-ink)] border border-[var(--uw-line)] hover:border-[var(--uw-ink)]`;
export const CARD = "rounded-[20px] bg-[var(--uw-surface)] border border-[var(--uw-line)]";
export const LABEL = "text-[13px] font-medium text-[var(--uw-muted)]";

export type Tone = "red" | "amber" | "green" | "neutral";
export const CHIP = "inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[13px] font-medium whitespace-nowrap";
export function chipStyle(tone: Tone) {
  return tone === "neutral"
    ? { background: "var(--uw-raised)", color: "var(--uw-muted)" }
    : { background: `var(--uw-${tone}-bg)`, color: `var(--uw-${tone})` };
}
export const PRIORITY_TONE: Record<"high" | "medium" | "low", Tone> = { high: "red", medium: "amber", low: "neutral" };
