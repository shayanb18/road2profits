export function Loading({ error }: { error?: string | null }) {
  return (
    <div className="flex h-dvh items-center justify-center px-6" style={{ background: "#0a0a0a" }}>
      {error ? (
        <p role="alert" className="max-w-sm text-center text-[14px]" style={{ color: "#888" }}>
          {error}
        </p>
      ) : (
        <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: "#333" }} />
      )}
    </div>
  );
}
