/** Loading skeleton: shimmering stat cards + map cards. */
function Shimmer({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-surface-3 ${className}`} />;
}

export function MapsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando mapas">
      {/* stat cards */}
      <div className="mt-5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3.5 rounded-card border border-border bg-surface p-4 shadow-card">
            <Shimmer className="h-[42px] w-[42px] flex-none rounded-[11px]" />
            <div className="flex-1">
              <Shimmer className="h-3 w-20" />
              <Shimmer className="mt-2 h-5 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* card grid */}
      <div className="mt-[18px] grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
            <Shimmer className="h-[124px] rounded-none" />
            <div className="px-[15px] pb-[15px] pt-[13px]">
              <Shimmer className="h-4 w-2/3" />
              <Shimmer className="mt-2.5 h-3 w-1/2" />
              <div className="mt-4 flex items-center justify-between">
                <Shimmer className="h-[23px] w-16 rounded-chip" />
                <Shimmer className="h-[30px] w-16 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
