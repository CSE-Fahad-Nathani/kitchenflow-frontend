import { Loader2, Search } from "lucide-react";
import { formatDisplayDate } from "../../utils/formatDate";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export const MonthlyTiffinCard = ({ bill, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="press-scale w-full text-left bg-white rounded-xl border border-gray-100 p-3 shadow-[0_1px_6px_rgba(0,0,0,0.03)] active:border-orange-200"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[14px] font-bold text-gray-900 truncate">
          {bill.customer_name || "Customer"}
        </p>
        <p className="text-[12px] text-gray-500 mt-0.5">
          {formatDisplayDate(bill.from_date)} → {formatDisplayDate(bill.to_date)}
        </p>
        {bill.dish_name && (
          <p className="text-[11px] text-gray-400 mt-1 truncate">
            {bill.dish_name}
            {bill.variant_name ? ` · ${bill.variant_name}` : ""}
          </p>
        )}
      </div>
      <p className="text-[15px] font-bold text-orange-500 shrink-0">
        {money(bill.total_amount)}
      </p>
    </div>
  </button>
);

const MonthlyTiffinHistoryView = ({
  search,
  onSearchChange,
  bills,
  loading,
  onSelect,
}) => {
  return (
    <div className="px-3.5 py-3 space-y-2.5 pb-6">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name or mobile"
          className="w-full h-9 bg-white border border-gray-200 rounded-xl pl-9 pr-3 text-[13px] font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      {loading ? (
        <div className="py-16 flex justify-center text-gray-400">
          <Loader2 size={28} className="animate-spin" />
        </div>
      ) : bills.length === 0 ? (
        <div className="py-12 text-center text-[13px] text-gray-500">
          No monthly tiffin bills yet
        </div>
      ) : (
        <div className="space-y-2">
          {bills.map((bill) => (
            <MonthlyTiffinCard
              key={bill.bill_id}
              bill={bill}
              onClick={() => onSelect(bill.bill_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MonthlyTiffinHistoryView;
