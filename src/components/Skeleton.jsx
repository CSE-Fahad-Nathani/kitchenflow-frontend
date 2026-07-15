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

export default Skeleton;
