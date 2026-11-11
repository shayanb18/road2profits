export function Loading({ error }: { error?: string | null }) {
  return (
    <div className="flex h-dvh items-center justify-center px-6" style={{ background: "var(--uw-bg)" }}>
      {error ? (
        <p role="alert" className="max-w-sm text-center text-[14px]" style={{ color: "var(--uw-muted)" }}>
          {error}
        </p>
      ) : (
        <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: "var(--uw-faint)" }} />
      )}
    </div>
  );
}
