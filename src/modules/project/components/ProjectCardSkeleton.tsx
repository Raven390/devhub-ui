export const ProjectCardSkeleton = () => (
  <div
    className="relative min-h-[312px] overflow-hidden rounded-lg border border-white/[0.07] bg-[#111216] p-5 shadow-sm"
    aria-hidden="true"
  >
    <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent animate-shimmer" />

    <div className="flex items-start justify-between gap-4">
      <div className="w-full max-w-[68%]">
        <div className="h-3 w-24 rounded-md bg-white/[0.06]" />
        <div className="mt-3 h-5 w-full rounded-md bg-white/[0.08]" />
        <div className="mt-2 h-5 w-3/4 rounded-md bg-white/[0.06]" />
      </div>
      <div className="h-7 w-24 rounded-md border border-white/[0.06] bg-white/[0.05]" />
    </div>

    <div className="mt-5 space-y-3">
      <div className="h-3.5 w-full rounded-md bg-white/[0.06]" />
      <div className="h-3.5 w-11/12 rounded-md bg-white/[0.05]" />
      <div className="h-3.5 w-3/5 rounded-md bg-white/[0.05]" />
    </div>

    <div className="mt-6 flex gap-2">
      <div className="h-7 w-24 rounded-md bg-white/[0.06]" />
      <div className="h-7 w-20 rounded-md bg-white/[0.05]" />
      <div className="h-7 w-16 rounded-md bg-white/[0.05]" />
    </div>

    <div className="mt-3 flex gap-2">
      <div className="h-7 w-28 rounded-md bg-white/[0.05]" />
      <div className="h-7 w-24 rounded-md bg-white/[0.04]" />
    </div>

    <div className="mt-8 flex items-center justify-between border-t border-white/[0.07] pt-5">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-md bg-white/[0.06]" />
        <div>
          <div className="h-3.5 w-28 rounded-md bg-white/[0.06]" />
          <div className="mt-2 h-3 w-36 rounded-md bg-white/[0.04]" />
        </div>
      </div>
      <div className="h-4 w-24 rounded-md bg-white/[0.05]" />
    </div>
  </div>
);
