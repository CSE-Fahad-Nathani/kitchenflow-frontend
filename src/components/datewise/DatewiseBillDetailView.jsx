import { Loader2 } from "lucide-react";
import { formatDisplayDate } from "../../utils/formatDate";
import { calcDayTotals, itemLineTotal } from "../../utils/datewiseCalc";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const DatewiseBillDetailView = ({
  loading,
  bill,
  onPreview,
  onDelete,
  deleting,
}) => {
  if (loading) {
    return (
      <div className="px-3.5 py-16 flex justify-center text-gray-400">
        <Loader2 size={28} className="animate-spin" />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="px-3.5 py-8 text-center text-[13px] text-gray-500">
        Bill not found
      </div>
    );
  }

  const days = bill.days || [];

  return (
    <div className="px-3.5 py-3 space-y-2.5 pb-28">
      <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-1">
        <p className="text-[11px] font-semibold text-orange-600 uppercase tracking-wide">
          Date-wise Bill
        </p>
        <p className="text-[16px] font-bold text-gray-900">
          {bill.customer_name || "—"}
        </p>
        {bill.customer_mobile && (
          <p className="text-[13px] text-gray-500">{bill.customer_mobile}</p>
        )}
        <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-gray-200 mt-2">
          <div className="text-[12px] text-gray-500">
            {Number(bill.discount) > 0
              ? `Discount -${money(bill.discount)}`
              : "No discount"}
          </div>
          <span className="text-[18px] font-bold text-orange-500">
            {money(bill.total_amount)}
          </span>
        </div>
      </div>

      {days.map((day) => {
        const dayCalc = calcDayTotals(day);
        return (
          <div
            key={day.day_id || day.bill_date}
            className="bg-white rounded-xl border border-gray-100 p-3 space-y-2"
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="text-[14px] font-bold text-gray-900">
                  {formatDisplayDate(day.bill_date)}
                </p>
                {day.note?.trim() && (
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    {day.note.trim()}
                  </p>
                )}
              </div>
              <p className="text-[13px] font-bold text-orange-500 shrink-0">
                {money(dayCalc.dayTotal)}
              </p>
            </div>

            <ul className="space-y-1.5">
              {(day.items || []).map((item) => (
                <li
                  key={item.item_id || `${item.dish_name}-${item.price}`}
                  className="flex justify-between gap-3 text-[13px]"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {item.dish_name}
                      {item.variant_name?.trim()
                        ? ` (${item.variant_name})`
                        : ""}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {[
                        `× ${Number(item.quantity) || 0}`,
                        Number(item.price) > 0
                          ? `${money(item.price)} each`
                          : null,
                        item.note?.trim() || null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-800 shrink-0">
                    {money(itemLineTotal(item))}
                  </span>
                </li>
              ))}
            </ul>

            {Number(day.delivery_charge) > 0 && (
              <div className="flex justify-between text-[12.5px] pt-1 border-t border-dashed border-gray-100">
                <span className="text-gray-500">Delivery</span>
                <span className="font-semibold text-gray-800">
                  {money(day.delivery_charge)}
                </span>
              </div>
            )}
          </div>
        );
      })}

      <div className="fixed bottom-16 left-0 right-0 z-40 px-3.5 pb-3 pt-2 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent">
        <div className="max-w-md mx-auto flex gap-2">
          <button
            type="button"
            disabled={deleting}
            onClick={onDelete}
            className="press-scale flex-1 h-11 rounded-xl text-[13px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 active:bg-rose-100 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
          <button
            type="button"
            onClick={onPreview}
            className="press-scale flex-[1.4] h-11 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/25"
          >
            Preview Bill
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatewiseBillDetailView;
