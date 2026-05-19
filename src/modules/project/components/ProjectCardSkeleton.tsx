export const ProjectCardSkeleton = () => (
  <div
    className="relative min-h-[180px] overflow-hidden rounded-lg border border-[var(--border-dim)] bg-[var(--bg-elevated)] p-4 shadow-sm"
    aria-hidden="true"
  >
    <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent animate-shimmer" />

    <div className="flex items-start justify-between gap-4">
      <div className="w-full max-w-[68%]">
        <div className="h-3 w-24 rounded-md bg-white/[0.06]" />
        <div className="mt-3 h-5 w-full rounded-md bg-white/[0.08]" />
        <div className="mt-2 h-5 w-3/4 rounded-md bg-white/[0.06]" />
      </div>
      <div className="h-6 w-28 rounded-full border border-white/[0.06] bg-white/[0.05]" />
    </div>

    <div className="mt-4 space-y-3">
      <div className="h-3.5 w-full rounded-md bg-white/[0.06]" />
      <div className="h-3.5 w-11/12 rounded-md bg-white/[0.05]" />
    </div>

    <div className="mt-4 flex gap-2 border-t border-[var(--border-dim)] pt-4">
      <div className="h-6 w-16 rounded bg-white/[0.06]" />
      <div className="h-6 w-20 rounded bg-white/[0.05]" />
      <div className="h-6 w-14 rounded bg-white/[0.05]" />
    </div>

    <div className="mt-3 h-4 w-56 rounded-md bg-white/[0.05]" />

    <div className="mt-6 flex items-center justify-between border-t border-[var(--border-dim)] pt-3">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 rounded-full bg-white/[0.06]" />
        <div>
          <div className="h-3.5 w-28 rounded-md bg-white/[0.06]" />
        </div>
      </div>
      <div className="h-4 w-24 rounded-md bg-white/[0.05]" />
    </div>
  </div>
);
