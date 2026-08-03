import { Bell, Check, Loader2 } from "lucide-react";
import { formatDisplayDate } from "../../utils/formatDate";
import {
  calcCalendarBill,
  calcDishTotals,
  groupDatesByMonth,
} from "../../utils/calendarBillCalc";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const Row = ({ label, value, strong }) => (
  <div className="flex justify-between gap-3 text-[13px]">
    <span className="text-gray-500">{label}</span>
    <span
      className={`text-right ${
        strong ? "font-bold text-gray-900" : "font-semibold text-gray-800"
      }`}
    >
      {value}
    </span>
  </div>
);

const CalendarBillDetailView = ({
  loading,
  bill,
  onPreview,
  onDelete,
  onMarkPaid,
  onPaidExtra,
  onReminder,
  deleting,
  markingPaid,
  payingExtra = false,
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

  const dishes = bill.dishes || [];
  const calc = calcCalendarBill(dishes);

  return (
    <div className="px-3.5 py-3 space-y-2.5 pb-52">
      <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-2">
        <p className="text-[11px] font-semibold text-orange-600 uppercase tracking-wide">
          Calendar Bill
        </p>
        <p className="text-[16px] font-bold text-gray-900">
          {bill.customer_name || "—"}
        </p>
        {bill.customer_mobile && (
          <p className="text-[13px] text-gray-500">{bill.customer_mobile}</p>
        )}
        {calc.fromDate && calc.toDate ? (
          <p className="text-[13px] text-gray-600 pt-1">
            {formatDisplayDate(calc.fromDate)} → {formatDisplayDate(calc.toDate)}
          </p>
        ) : null}
        <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-100">
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
        <p className="text-[11px] text-gray-500">
          Show dates on bill:{" "}
          <span className="font-semibold text-gray-700">
            {bill.show_dates ? "On" : "Off"}
          </span>
        </p>
      </div>

      {dishes.map((dish, index) => {
        const summary = calc.dishSummaries[index] || calcDishTotals(dish);
        return (
          <div
            key={dish.dish_entry_id || index}
            className="bg-white rounded-xl border border-gray-100 p-3 space-y-1.5"
          >
            <p className="text-[14px] font-bold text-gray-900">
              {dish.dish_name || "Dish"}
            </p>
            <Row label="Price / day" value={money(dish.rate_per_day)} />
            <Row label="Quantity / day" value={Number(dish.quantity) || 1} />
            <Row
              label="Delivery / day"
              value={money(dish.delivery_charge_per_day)}
            />
            <Row label="Per day amount" value={money(summary.dayAmount)} />
            <Row label="Total days" value={summary.dayCount} strong />
            {summary.dates.length > 0 ? (
              <div className="pt-1 space-y-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Dates
                </p>
                {groupDatesByMonth(summary.dates).map((group) => (
                  <div key={group.key}>
                    <p className="text-[11px] font-bold text-orange-700 mb-1">
                      {group.label}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {group.days.map((day) => {
                        const ymd = `${group.key}-${String(day).padStart(2, "0")}`;
                        const overlap = calc.overlappingDates.has(ymd);
                        return (
                          <span
                            key={ymd}
                            className={`min-w-[1.5rem] text-center text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
                              overlap
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-orange-50 text-orange-800 border-orange-100"
                            }`}
                          >
                            {day}
                            {overlap ? " ★" : ""}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-gray-200">
              <span className="text-[13px] font-bold text-gray-900">
                Dish total
              </span>
              <span className="text-[15px] font-bold text-orange-500">
                {money(summary.dishTotal)}
              </span>
            </div>
          </div>
        );
      })}

      {calc.overlappingDates.size > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-semibold text-amber-800">
          Overlapping dates across dishes are marked ★ — each dish is still
          billed separately for that day.
        </div>
      ) : null}

      <div className="bg-white rounded-xl border border-gray-100 p-3">
        <div className="flex justify-between items-baseline">
          <span className="text-[15px] font-bold text-gray-900">Grand Total</span>
          <span className="text-[18px] font-bold text-orange-500">
            {money(bill.total_amount)}
          </span>
        </div>
      </div>

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

          <div className={`grid gap-2 ${!bill.is_paid ? "grid-cols-2" : "grid-cols-3"}`}>
            {!bill.is_paid ? (
              <>
                <button
                  type="button"
                  disabled={markingPaid || payingExtra}
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
                <button
                  type="button"
                  disabled={markingPaid || payingExtra}
                  onClick={onPaidExtra}
                  className="press-scale h-11 rounded-xl text-[12px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 flex items-center justify-center gap-1 disabled:opacity-60"
                >
                  {payingExtra ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Paid Extra"
                  )}
                </button>
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
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled
                  className="h-11 rounded-xl text-[12px] font-semibold text-emerald-700/70 bg-emerald-50/60 border border-emerald-100 flex items-center justify-center gap-1 cursor-not-allowed"
                >
                  <Check size={14} strokeWidth={2.5} />
                  Paid
                </button>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarBillDetailView;
