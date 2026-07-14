export const Skeleton = ({ className = "" }) => (
  <div
    className={`rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease_infinite] ${className}`}
    aria-hidden
  />
);

export const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-4 space-y-3">
    <Skeleton className="h-3 w-20 rounded-md" />
    <Skeleton className="h-7 w-16 rounded-md" />
  </div>
);

export const MenuRowSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-4 flex items-center gap-4">
    <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-28 rounded-md" />
      <Skeleton className="h-3 w-40 rounded-md" />
    </div>
    <Skeleton className="w-4 h-4 rounded-md shrink-0" />
  </div>
);

export const OrderRowSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-4 space-y-3">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-3 w-16 rounded-md" />
      </div>
      <div className="space-y-2 flex flex-col items-end">
        <Skeleton className="h-4 w-14 rounded-md" />
        <Skeleton className="h-3 w-10 rounded-md" />
      </div>
    </div>
    <Skeleton className="h-3 w-28 rounded-md" />
  </div>
);

export default Skeleton;
