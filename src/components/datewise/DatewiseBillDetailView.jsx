import { Bell, Check, Loader2 } from "lucide-react";
import { formatDisplayDate } from "../../utils/formatDate";
import { calcDayTotals, itemLineTotal } from "../../utils/datewiseCalc";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const DatewiseBillDetailView = ({
  loading,
  bill,
  onPreview,
  onDelete,
  onMarkPaid,
  onReminder,
  deleting,
  markingPaid,
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
    <div className="px-3.5 py-3 space-y-2.5 pb-52">
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
        <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-100 mt-2">
          <span
            className={`text-[12px] font-semibold ${
              bill.is_paid ? "text-green-600" : "text-red-600"
            }`}
          >
            {bill.is_paid ? "Paid" : "Unpaid"}
          </span>
          <span className="text-[12px] text-gray-500">
            Reminders: {bill.reminder_count || 0}
          </span>
        </div>
        <div className="flex justify-between items-baseline pt-2">
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
        <div className="max-w-md mx-auto space-y-2">
          <button
            type="button"
            onClick={onReminder}
            className="press-scale w-full flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/80 px-3 py-2.5 text-left active:bg-orange-100/70"
          >
            <span className="flex items-center gap-2 text-[12.5px] font-semibold text-gray-700">
              <span className="w-7 h-7 rounded-lg bg-white border border-orange-100 flex items-center justify-center text-orange-500">
                <Bell size={13} />
              </span>
              Send Reminder
            </span>
            <span className="text-[11px] font-bold text-orange-600 bg-white border border-orange-100 px-2 py-0.5 rounded-full">
              {bill.reminder_count || 0}
            </span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            {!bill.is_paid ? (
              <button
                type="button"
                disabled={markingPaid}
                onClick={onMarkPaid}
                className="press-scale h-11 rounded-xl text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-1 disabled:opacity-60"
              >
                {markingPaid ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <Check size={14} strokeWidth={2.5} />
                    Mark Paid
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="h-11 rounded-xl text-[12px] font-semibold text-emerald-700/70 bg-emerald-50/60 border border-emerald-100 flex items-center justify-center gap-1 cursor-not-allowed"
              >
                <Check size={14} strokeWidth={2.5} />
                Paid
              </button>
            )}

            <button
              type="button"
              onClick={onPreview}
              className="press-scale h-11 rounded-xl text-[12px] font-semibold text-white bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/25"
            >
              Preview
            </button>

            <button
              type="button"
              disabled={deleting}
              onClick={onDelete}
              className="press-scale h-11 rounded-xl text-[12px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 active:bg-rose-100 disabled:opacity-60"
            >
              {deleting ? "…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatewiseBillDetailView;
