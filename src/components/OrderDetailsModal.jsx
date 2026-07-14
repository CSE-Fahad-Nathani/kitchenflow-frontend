import {
  Bell,
  CalendarDays,
  Check,
  Pencil,
  Phone,
  Trash2,
  X,
} from "lucide-react";

const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const OrderDetailsModal = ({
  open,
  order,
  onClose,
  onMarkPaid,
  onEdit,
  onDelete,
  onReminder,
  showDelete = true,
}) => {
  if (!open || !order) return null;

  const deliveryDate = new Date(order.delivery_datetime);

  const date = deliveryDate.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const time = deliveryDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.total_price),
    0
  );

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px] flex items-end"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md mx-auto bg-white rounded-t-3xl max-h-[90vh] overflow-hidden animate-slide-up shadow-[0_-8px_40px_rgba(0,0,0,0.15)] flex flex-col"
      >
        {/* Header */}
        <div className="shrink-0 px-5 pt-3 pb-4 border-b border-gray-100 bg-gradient-to-b from-orange-50/80 to-white">
          <div className="w-11 h-1.5 bg-gray-300/90 rounded-full mx-auto mb-4" />

          <div className="flex justify-between items-start gap-3">
            <div>
              <p className="text-[11px] font-semibold text-orange-500 uppercase tracking-[0.12em]">
                Order details
              </p>
              <h2 className="text-xl font-bold text-gray-900 mt-0.5">
                #{order.order_number}
              </h2>
              <span
                className={`inline-block mt-2 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  order.is_paid
                    ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
                    : "text-amber-700 bg-amber-50 border border-amber-100"
                }`}
              >
                {order.is_paid ? "Paid" : "Unpaid"}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="press-scale w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 active:bg-gray-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none p-4 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-4">
            <p className="font-semibold text-[17px] text-gray-900">
              {order.customer_name?.trim() || `Order #${order.order_number}`}
            </p>

            {order.customer_mobile?.trim() && (
              <div className="mt-2.5 flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Phone size={15} className="text-orange-400" />
                {order.customer_mobile}
              </div>
            )}

            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 font-medium">
              <CalendarDays size={15} className="text-orange-400" />
              {date} • {time}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-4">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Items
            </h3>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.order_item_id}
                  className="flex justify-between gap-3 items-start"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-[14px]">
                      {item.dish_name}
                    </p>
                    <p className="text-[13px] text-gray-500 mt-0.5">
                      {[item.variant_name, `× ${item.quantity}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900 text-[14px] shrink-0">
                    {formatMoney(item.total_price)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500 font-medium">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>

            <div className="flex justify-between text-gray-500 font-medium">
              <span>Delivery</span>
              <span>{formatMoney(order.delivery_charge)}</span>
            </div>

            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount</span>
                <span>-{formatMoney(order.discount)}</span>
              </div>
            )}

            <div className="border-t border-dashed border-gray-200 pt-3 mt-1 flex justify-between items-baseline">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-xl font-extrabold text-orange-500">
                {formatMoney(order.total_amount)}
              </span>
            </div>
          </div>

          {order.bill_notes && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Notes
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {order.bill_notes}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => onReminder(order.order_id)}
            className="press-scale w-full flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50/70 px-4 py-3.5 text-left active:bg-orange-100/70 transition-colors"
          >
            <span className="flex items-center gap-2.5 text-sm font-semibold text-gray-700">
              <span className="w-8 h-8 rounded-xl bg-white border border-orange-100 flex items-center justify-center text-orange-500">
                <Bell size={15} />
              </span>
              Send Reminder
            </span>
            <span className="text-[12px] font-bold text-orange-600 bg-white border border-orange-100 px-2.5 py-1 rounded-full">
              {order.reminder_count || 0}
            </span>
          </button>
        </div>

        {/* Actions */}
        <div className="shrink-0 border-t border-gray-100 bg-white p-3 pb-safe space-y-2.5">
          <div
            className={`grid gap-2.5 ${
              showDelete ? "grid-cols-3" : "grid-cols-2"
            }`}
          >
            {!order.is_paid ? (
              <button
                type="button"
                onClick={() => onMarkPaid(order.order_id)}
                className="press-scale h-12 rounded-xl font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-1.5 active:bg-emerald-100 transition-colors"
              >
                <Check size={16} strokeWidth={2.5} />
                Paid
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="h-12 rounded-xl font-semibold text-emerald-700/70 bg-emerald-50/60 border border-emerald-100 flex items-center justify-center gap-1.5 cursor-not-allowed"
              >
                <Check size={16} strokeWidth={2.5} />
                Paid
              </button>
            )}

            <button
              type="button"
              onClick={() => onEdit(order)}
              className="press-scale h-12 rounded-xl font-semibold text-white bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5"
            >
              <Pencil size={15} strokeWidth={2.35} />
              Edit
            </button>

            {showDelete && (
              <button
                type="button"
                onClick={() => onDelete(order.order_id)}
                className="press-scale h-12 rounded-xl font-semibold text-rose-600 bg-rose-50 border border-rose-200 flex items-center justify-center gap-1.5 active:bg-rose-100 transition-colors"
              >
                <Trash2 size={15} />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
