import { Check, Loader2, Wallet } from "lucide-react";
import { formatDisplayDate } from "../../utils/formatDate";

const MonthlyTiffinHistoryRow = ({
  bill,
  onClick,
  onMarkPaid,
  onPaidExtra,
  markingPaid = false,
  payingExtra = false,
}) => {
  const from = formatDisplayDate(bill.from_date);
  const to = formatDisplayDate(bill.to_date);
  const dishCount = Number(bill.dish_count) || 0;
  const dishLine =
    dishCount > 1
      ? `${dishCount} dishes`
      : [bill.dish_name, bill.variant_name].filter(Boolean).join(" · ");
  const busy = markingPaid || payingExtra;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.03)] px-3 py-2.5 flex items-center gap-1.5">
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
        <div className="flex flex-col gap-1 shrink-0">
          <button
            type="button"
            disabled={busy}
            onClick={(e) => {
              e.stopPropagation();
              onMarkPaid?.(bill.bill_id);
            }}
            className="press-scale h-8 px-2 rounded-lg font-semibold text-[10.5px] text-green-700 bg-green-50 border border-green-200 flex items-center justify-center gap-0.5 active:bg-green-100 disabled:opacity-60 whitespace-nowrap"
          >
            {markingPaid ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <>
                <Check size={12} strokeWidth={2.5} />
                Paid
              </>
            )}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={(e) => {
              e.stopPropagation();
              onPaidExtra?.(bill);
            }}
            className="press-scale h-8 px-2 rounded-lg font-semibold text-[10.5px] text-amber-800 bg-amber-50 border border-amber-200 flex items-center justify-center gap-0.5 active:bg-amber-100 disabled:opacity-60 whitespace-nowrap"
          >
            {payingExtra ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <>
                <Wallet size={11} strokeWidth={2.5} />
                Credit
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default MonthlyTiffinHistoryRow;
