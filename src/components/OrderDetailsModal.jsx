import { Bell, Check, Pencil, Trash2, X } from "lucide-react";
import { formatDisplayDate } from "../utils/formatDate";

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

  const delivery = new Date(order.delivery_datetime);
  const date = formatDisplayDate(order.delivery_datetime);

  const time = delivery.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px] flex items-end"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md mx-auto bg-white rounded-t-3xl max-h-[90dvh] overflow-hidden animate-slide-up shadow-[0_-8px_40px_rgba(0,0,0,0.15)] flex flex-col"
      >
        {/* Compact header */}
        <div className="shrink-0 px-4 pt-2.5 pb-3 border-b border-gray-100">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />

          <div className="flex justify-between items-center gap-3">
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold text-gray-900 truncate">
                #{order.order_number}
              </h2>
              <p
                className={`text-[12px] font-semibold mt-0.5 ${
                  order.is_paid ? "text-green-600" : "text-red-600"
                }`}
              >
                {order.is_paid ? "Paid" : "Unpaid"}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="press-scale w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 active:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Bill-style body */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none bg-gray-100 p-3">
          <div className="bg-white mx-auto w-full max-w-[340px] shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 pt-5 pb-4">
              <div className="text-center">
                <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">
                  Arefa's Kitchen
                </h1>
                <p className="text-gray-500 text-[11px] mt-0.5">Homemade Food</p>
                <p className="text-orange-500 text-[10px] font-semibold mt-1.5 tracking-wide uppercase">
                  Tax Invoice / Bill
                </p>
              </div>

              <div className="border-t border-dashed border-gray-300 my-3.5" />

              <div className="space-y-1 text-[12.5px] text-gray-700">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Bill No</span>
                  <span className="font-semibold">#{order.order_number}</span>
                </div>

                {order.customer_name?.trim() && (
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Customer</span>
                    <span className="font-semibold text-right">
                      {order.customer_name.trim()}
                    </span>
                  </div>
                )}

                {order.customer_mobile?.trim() && (
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Mobile</span>
                    <span className="text-right">
                      {order.customer_mobile.trim()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Delivery</span>
                  <span className="text-right">
                    {date}, {time}
                  </span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 my-3.5" />

              <div className="flex justify-between text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-2">
                <span>Item</span>
                <span>Amount</span>
              </div>

              <div className="space-y-2.5">
                {(order.items || []).map((item, idx) => (
                  <div
                    key={item.order_item_id || `${item.dish_name}-${idx}`}
                    className="flex justify-between gap-3 items-start"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[12.5px] text-gray-900 leading-snug">
                        {item.dish_name}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {[item.variant_name, `× ${item.quantity}`]
                          .filter(Boolean)
                          .join(" · ")}
                        {Number(item.unit_price) > 0
                          ? ` · ${formatMoney(item.unit_price)} each`
                          : ""}
                      </p>
                    </div>
                    <p className="text-[12.5px] font-semibold text-gray-900 shrink-0">
                      {formatMoney(item.total_price)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-300 my-3.5" />

              <div className="space-y-1 text-[12.5px]">
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>{formatMoney(order.delivery_charge)}</span>
                </div>

                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Discount</span>
                    <span>-{formatMoney(order.discount)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-2.5 mt-1.5 flex justify-between items-baseline">
                  <span className="text-[14px] font-bold text-gray-900">
                    Total
                  </span>
                  <span className="text-lg font-extrabold text-orange-500">
                    {formatMoney(order.total_amount)}
                  </span>
                </div>
              </div>

              {order.bill_notes && (
                <>
                  <div className="border-t border-dashed border-gray-300 my-3.5" />
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    <span className="font-semibold text-gray-600">Notes: </span>
                    {order.bill_notes}
                  </p>
                </>
              )}

              <div className="border-t border-dashed border-gray-300 my-3.5" />

              <p className="text-center text-[10px] text-gray-400 leading-relaxed">
                Thank you for your order!
                <br />
                Homemade with care · Arefa's Kitchen
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onReminder(order.order_id)}
            className="press-scale w-full max-w-[340px] mx-auto mt-2.5 flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/80 px-3 py-2.5 text-left active:bg-orange-100/70 transition-colors"
          >
            <span className="flex items-center gap-2 text-[12.5px] font-semibold text-gray-700">
              <span className="w-7 h-7 rounded-lg bg-white border border-orange-100 flex items-center justify-center text-orange-500">
                <Bell size={13} />
              </span>
              Send Reminder
            </span>
            <span className="text-[11px] font-bold text-orange-600 bg-white border border-orange-100 px-2 py-0.5 rounded-full">
              {order.reminder_count || 0}
            </span>
          </button>
        </div>

        {/* Compact actions */}
        <div className="shrink-0 border-t border-gray-100 bg-white p-2.5">
          <div
            className={`grid gap-2 ${
              showDelete ? "grid-cols-3" : "grid-cols-2"
            }`}
          >
            {!order.is_paid ? (
              <button
                type="button"
                onClick={() => onMarkPaid(order.order_id)}
                className="press-scale h-10 rounded-xl text-[12.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-1 active:bg-emerald-100 transition-colors"
              >
                <Check size={14} strokeWidth={2.5} />
                Mark Paid
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="h-10 rounded-xl text-[12.5px] font-semibold text-emerald-700/70 bg-emerald-50/60 border border-emerald-100 flex items-center justify-center gap-1 cursor-not-allowed"
              >
                <Check size={14} strokeWidth={2.5} />
                Paid
              </button>
            )}

            <button
              type="button"
              onClick={() => onEdit(order)}
              className="press-scale h-10 rounded-xl text-[12.5px] font-semibold text-white bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/25 flex items-center justify-center gap-1"
            >
              <Pencil size={13} strokeWidth={2.35} />
              Edit
            </button>

            {showDelete && (
              <button
                type="button"
                onClick={() => onDelete(order.order_id)}
                className="press-scale h-10 rounded-xl text-[12.5px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 flex items-center justify-center gap-1 active:bg-rose-100 transition-colors"
              >
                <Trash2 size={13} />
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
