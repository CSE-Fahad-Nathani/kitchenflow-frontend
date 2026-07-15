import { Check, Loader2 } from "lucide-react";

const OrderHistoryRow = ({
  order,
  onClick,
  onMarkPaid,
  markingPaid = false,
}) => {
  const delivery = new Date(order.delivery_datetime);

  const time = delivery.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.03)] px-3 py-2.5 flex items-center gap-2.5">
      <button
        type="button"
        onClick={onClick}
        className="press-scale flex-1 min-w-0 text-left active:opacity-70"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-[13.5px] text-gray-900 truncate leading-tight">
              {order.customer_name?.trim() || `Order #${order.order_number}`}
            </h3>
            <p className="text-[11.5px] text-gray-500 mt-0.5 truncate">
              #{order.order_number}
              <span className="text-gray-300 mx-1">·</span>
              {time}
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="font-bold text-[13.5px] text-orange-500 leading-tight">
              ₹{Number(order.total_amount).toLocaleString("en-IN")}
            </p>
            <span
              className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                order.is_paid
                  ? "text-emerald-700 bg-emerald-50"
                  : "text-amber-700 bg-amber-50"
              }`}
            >
              {order.is_paid ? "Paid" : "Unpaid"}
            </span>
          </div>
        </div>
      </button>

      {!order.is_paid && (
        <button
          type="button"
          disabled={markingPaid}
          onClick={(e) => {
            e.stopPropagation();
            onMarkPaid?.(order.order_id);
          }}
          aria-label="Mark paid"
          className="press-scale shrink-0 h-8 px-2.5 rounded-lg font-semibold text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-1 active:bg-emerald-100 disabled:opacity-60"
        >
          {markingPaid ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <>
              <Check size={13} strokeWidth={2.5} />
              Paid
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default OrderHistoryRow;
