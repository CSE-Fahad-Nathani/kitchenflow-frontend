import { CalendarDays, Check, Loader2 } from "lucide-react";

const OrderHistoryRow = ({
  order,
  onClick,
  onMarkPaid,
  markingPaid = false,
}) => {
  const delivery = new Date(order.delivery_datetime);

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  let day = delivery.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });

  if (delivery.toDateString() === today.toDateString()) {
    day = "Today";
  } else if (delivery.toDateString() === tomorrow.toDateString()) {
    day = "Tomorrow";
  }

  const time = delivery.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] overflow-hidden">
      <button
        type="button"
        onClick={onClick}
        className="press-scale w-full p-4 text-left active:bg-orange-50/40 transition-colors"
      >
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {order.customer_name?.trim() || `Order #${order.order_number}`}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">#{order.order_number}</p>
          </div>

          <div className="text-right shrink-0">
            <p className="font-bold text-orange-500">
              ₹{Number(order.total_amount).toLocaleString("en-IN")}
            </p>
            <span
              className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                order.is_paid
                  ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
                  : "text-amber-700 bg-amber-50 border border-amber-100"
              }`}
            >
              {order.is_paid ? "Paid" : "Unpaid"}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 font-medium">
          <CalendarDays size={15} className="text-orange-400" />
          {day} • {time}
        </div>
      </button>

      {!order.is_paid && (
        <div className="px-3 pb-3">
          <button
            type="button"
            disabled={markingPaid}
            onClick={(e) => {
              e.stopPropagation();
              onMarkPaid?.(order.order_id);
            }}
            className="press-scale w-full h-10 rounded-xl font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-1.5 active:bg-emerald-100 transition-colors disabled:opacity-60"
          >
            {markingPaid ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Updating…
              </>
            ) : (
              <>
                <Check size={15} strokeWidth={2.5} />
                Mark Paid
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryRow;
