import { Loader2 } from "lucide-react";
import { formatDisplayDate } from "../../utils/formatDate";
import { calcTiffinBill } from "../../utils/tiffinCalc";

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

const MonthlyTiffinDetailView = ({
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

  const calc = calcTiffinBill({
    fromDate: bill.from_date,
    toDate: bill.to_date,
    ratePerDay: bill.rate_per_day,
    deliveryCharge: bill.delivery_charge,
    discount: bill.discount,
    excludedDates: bill.excluded_dates || [],
  });

  const excluded = bill.excluded_dates || [];

  return (
    <div className="px-3.5 py-3 space-y-2.5 pb-28">
      <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-2">
        <p className="text-[11px] font-semibold text-orange-600 uppercase tracking-wide">
          Monthly Tiffin
        </p>
        <p className="text-[16px] font-bold text-gray-900">
          {bill.customer_name || "—"}
        </p>
        {bill.customer_mobile && (
          <p className="text-[13px] text-gray-500">{bill.customer_mobile}</p>
        )}
        <p className="text-[13px] text-gray-600 pt-1">
          {formatDisplayDate(bill.from_date)} → {formatDisplayDate(bill.to_date)}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-1.5">
        <Row label="Dish" value={bill.dish_name || "—"} strong />
        {bill.variant_name && <Row label="Variant" value={bill.variant_name} />}
        <Row label="Rate / Day" value={money(bill.rate_per_day)} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-2">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
          Excluded Dates
        </p>
        {excluded.length === 0 ? (
          <p className="text-[12px] text-gray-400">None</p>
        ) : (
          <ul className="space-y-2">
            {excluded.map((row) => (
              <li
                key={row.excluded_id || row.excluded_date}
                className="flex justify-between gap-3 text-[13px] border-b border-gray-50 last:border-0 pb-2 last:pb-0"
              >
                <span className="font-semibold text-gray-900">
                  {formatDisplayDate(row.excluded_date)}
                </span>
                <span className="text-gray-500 text-right">
                  {row.reason || "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-1.5">
        <Row label="Total Days" value={calc.totalDays} />
        <Row label="Excluded Days" value={calc.excludedDays} />
        <Row label="Billable Days" value={calc.billableDays} strong />
        <Row label="Delivery Charge" value={money(bill.delivery_charge)} />
        {Number(bill.discount) > 0 && (
          <Row label="Discount" value={`-${money(bill.discount)}`} />
        )}
        <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-gray-200">
          <span className="text-[15px] font-bold text-gray-900">Grand Total</span>
          <span className="text-[18px] font-bold text-orange-500">
            {money(bill.total_amount)}
          </span>
        </div>
      </div>

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

export default MonthlyTiffinDetailView;
