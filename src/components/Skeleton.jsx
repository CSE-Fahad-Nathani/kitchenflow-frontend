export const Skeleton = ({ className = "" }) => (
  <div
    className={`rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease_infinite] ${className}`}
    aria-hidden
  />
);

export const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 px-3 py-2.5 space-y-1.5">
    <Skeleton className="h-2.5 w-16 rounded-md" />
    <Skeleton className="h-5 w-12 rounded-md" />
  </div>
);

export const MenuRowSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 px-3 py-2.5 flex items-center gap-2.5">
    <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
    <div className="flex-1 space-y-1.5">
      <Skeleton className="h-3 w-24 rounded-md" />
      <Skeleton className="h-2.5 w-32 rounded-md" />
    </div>
    <Skeleton className="w-3.5 h-3.5 rounded-md shrink-0" />
  </div>
);

export const OrderRowSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 px-3 py-2.5 flex items-center justify-between gap-3">
    <div className="space-y-1.5 flex-1">
      <Skeleton className="h-3.5 w-28 rounded-md" />
      <Skeleton className="h-2.5 w-20 rounded-md" />
    </div>
    <div className="space-y-1.5 flex flex-col items-end">
      <Skeleton className="h-3.5 w-12 rounded-md" />
      <Skeleton className="h-2.5 w-10 rounded-md" />
    </div>
  </div>
);

export const CustomerRowSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 px-3 py-2.5 flex items-center justify-between gap-3">
    <div className="space-y-1.5 flex-1 min-w-0">
      <Skeleton className="h-3.5 w-28 rounded-md" />
      <Skeleton className="h-2.5 w-20 rounded-md" />
    </div>
    <div className="flex gap-1.5 shrink-0">
      <Skeleton className="w-8 h-8 rounded-lg" />
      <Skeleton className="w-8 h-8 rounded-lg" />
    </div>
  </div>
);

export const DishRowSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 px-3 py-2 flex items-center justify-between gap-3">
    <div className="space-y-1.5 flex-1 min-w-0">
      <Skeleton className="h-3.5 w-32 rounded-md" />
      <Skeleton className="h-2.5 w-40 rounded-md" />
    </div>
    <div className="flex gap-1.5 shrink-0">
      <Skeleton className="w-8 h-8 rounded-lg" />
      <Skeleton className="w-8 h-8 rounded-lg" />
    </div>
  </div>
);

/** Analysis page section placeholder */
export const AnalysisSectionSkeleton = ({ tiles = 4, rows = 0 }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-2.5">
    <Skeleton className="h-3.5 w-36 rounded-md" />
    {tiles > 0 && (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: tiles }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-gray-50 border border-gray-100 px-2.5 py-2 space-y-1.5"
          >
            <Skeleton className="h-2.5 w-14 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
        ))}
      </div>
    )}
    {rows > 0 && (
      <div className="space-y-2 pt-0.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-3 py-1">
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-3 w-28 rounded-md" />
              <Skeleton className="h-2.5 w-20 rounded-md" />
            </div>
            <Skeleton className="h-3.5 w-12 rounded-md shrink-0" />
          </div>
        ))}
      </div>
    )}
  </div>
);

export default Skeleton;
