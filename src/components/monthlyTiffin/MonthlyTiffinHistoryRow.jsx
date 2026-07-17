import { Check, Loader2 } from "lucide-react";
import { formatDisplayDate } from "../../utils/formatDate";

const MonthlyTiffinHistoryRow = ({
  bill,
  onClick,
  onMarkPaid,
  markingPaid = false,
}) => {
  const from = formatDisplayDate(bill.from_date);
  const to = formatDisplayDate(bill.to_date);
  const dishLine = [bill.dish_name, bill.variant_name]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.03)] px-3 py-2.5 flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        className="press-scale flex-1 min-w-0 text-left active:opacity-70"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-[13.5px] text-gray-900 truncate leading-tight">
              {bill.customer_name?.trim() || "Customer"}
            </h3>
            <p className="text-[11.5px] text-gray-500 mt-0.5 truncate">
              {from} → {to}
              {dishLine ? (
                <>
                  <span className="text-gray-300 mx-1">·</span>
                  {dishLine}
                </>
              ) : null}
            </p>
          </div>

          <div className="text-right shrink-0 pl-1">
            <p className="font-bold text-[13.5px] text-orange-500 leading-tight whitespace-nowrap">
              ₹{Number(bill.total_amount).toLocaleString("en-IN")}
            </p>
            <p
              className={`text-[11px] font-semibold mt-0.5 leading-tight ${
                bill.is_paid ? "text-green-600" : "text-red-600"
              }`}
            >
              {bill.is_paid ? "Paid" : "Unpaid"}
            </p>
          </div>
        </div>
      </button>

      {!bill.is_paid && (
        <button
          type="button"
          disabled={markingPaid}
          onClick={(e) => {
            e.stopPropagation();
            onMarkPaid?.(bill.bill_id);
          }}
          aria-label="Mark paid"
          title="Mark Paid"
          className="press-scale shrink-0 h-9 px-2.5 rounded-lg font-semibold text-[11px] text-green-700 bg-green-50 border border-green-200 flex items-center justify-center gap-1 active:bg-green-100 disabled:opacity-60 whitespace-nowrap"
        >
          {markingPaid ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <>
              <Check size={13} strokeWidth={2.5} />
              Mark Paid
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default MonthlyTiffinHistoryRow;
