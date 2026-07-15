import { CalendarDays, ChevronRight, UtensilsCrossed } from "lucide-react";
import { formatDisplayDate } from "../../utils/formatDate";

const SundaySpecialCard = ({ special, onClick }) => {
  const itemCount = Number(special.total_items || 0);

  return (
    <button
      type="button"
      onClick={() => onClick(special)}
      className="press-scale w-full text-left bg-white rounded-xl border border-gray-100 px-3 py-2.5 flex items-center gap-3 active:border-orange-200 active:bg-orange-50/40 transition-colors"
    >
      <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-orange-500 flex items-center justify-center shrink-0">
        <CalendarDays size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold text-gray-900 truncate">
          {special.title || "Sunday Special"}
        </p>
        <p className="text-[12px] text-gray-500 mt-0.5">
          {formatDisplayDate(special.special_date) || "—"}
        </p>
        <p className="text-[11px] text-orange-600 font-semibold mt-0.5 flex items-center gap-1">
          <UtensilsCrossed size={11} />
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      </div>

      <ChevronRight size={16} className="text-gray-300 shrink-0" />
    </button>
  );
};

export default SundaySpecialCard;
