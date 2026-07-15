import { Search } from "lucide-react";
import SundaySpecialCard from "./SundaySpecialCard";
import { CustomerRowSkeleton } from "../Skeleton";

const PreviousSundaySpecialsView = ({
  search,
  onSearchChange,
  loading,
  specials,
  onOpen,
}) => {
  return (
    <div className="px-3.5 py-3 space-y-2.5">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          placeholder="Search by date…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-9 bg-white border border-gray-200 rounded-xl pl-9 pr-3 text-[13px] font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
        />
      </div>

      {loading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <CustomerRowSkeleton key={i} />
          ))}
        </div>
      ) : specials.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center">
          <p className="font-semibold text-[13.5px] text-gray-800">
            No Sunday specials found
          </p>
          <p className="text-[12px] text-gray-500 mt-1">
            {search.trim()
              ? "Try a different search"
              : "Create your first Sunday Special"}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {specials.map((special) => (
            <SundaySpecialCard
              key={special.special_id}
              special={special}
              onClick={onOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PreviousSundaySpecialsView;
