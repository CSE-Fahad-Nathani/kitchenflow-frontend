import { CalendarDays, Phone, X } from "lucide-react";

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

  const deliveryDate = new Date(
    order.delivery_datetime
  );

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
      className="fixed inset-0 z-[9999] bg-black/40 flex items-end"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md mx-auto bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up"
      >
        <div className="sticky top-0 bg-white border-b p-5">

          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

          <div className="flex justify-between items-start">

            <div>

              <p className="text-sm text-gray-500">
                Order No.
              </p>

              <h2 className="text-xl font-bold">
                #{order.order_number}
              </h2>

            </div>

            <button onClick={onClose}>
              <X size={22} />
            </button>

          </div>

        </div>

        <div className="p-5 space-y-6">

          <div>

            <p className="font-semibold text-lg">
              {order.customer_name}
            </p>

            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <Phone size={15} />
              {order.customer_mobile}
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <CalendarDays size={15} />
              {date} • {time}
            </div>

          </div>

          <div>

            <h3 className="font-semibold mb-3">
              Items
            </h3>

            <div className="space-y-3">

              {order.items.map((item) => (
                <div
                  key={item.order_item_id}
                  className="flex justify-between"
                >
                  <div>

                    <p className="font-medium">
                      {item.dish_name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {item.variant_name} ×{" "}
                      {item.quantity}
                    </p>

                  </div>

                  <p className="font-semibold">
                    ₹{item.total_price}
                  </p>

                </div>
              ))}

            </div>

          </div>

          <div className="border-t pt-4 space-y-2 text-sm">

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery</span>
              <span>₹{order.delivery_charge}</span>
            </div>

            <div className="flex justify-between">
              <span>Discount</span>
              <span>- ₹{order.discount}</span>
            </div>

            <div className="flex justify-between">
              <span>Other Charges</span>
              <span>₹{order.other_charges}</span>
            </div>

            <div className="border-t pt-3 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-orange-500">
                ₹{order.total_amount}
              </span>
            </div>

          </div>

          {order.bill_notes && (
            <div>

              <h3 className="font-semibold mb-2">
                Notes
              </h3>

              <p className="text-gray-600">
                {order.bill_notes}
              </p>

            </div>
          )}

            <div className="border-t pt-5">

            <div className="flex justify-between items-center mb-5">

            <span className="text-sm text-gray-500">
                Reminder Count
            </span>

            <button
                onClick={() => onReminder(order.order_id)}
                className="text-orange-500 font-medium"
            >
                {order.reminder_count} • Send Reminder
            </button>

            </div>

            {/* <div className="grid grid-cols-3 gap-3"> */}
            <div
                className={`grid gap-3 ${
                    showDelete
                    ? "grid-cols-3"
                    : "grid-cols-2"
                }`}
                >

            {!order.is_paid ? (
                <button
                onClick={() => onMarkPaid(order.order_id)}
                className="bg-green-500 text-white rounded-xl py-3 font-medium"
                >
                Paid
                </button>
            ) : (
                <button
                disabled
                className="bg-gray-200 text-gray-500 rounded-xl py-3"
                >
                Paid
                </button>
            )}

            <button
                onClick={() => onEdit(order)}
                className="bg-blue-500 text-white rounded-xl py-3 font-medium"
            >
                Edit
            </button>

            {showDelete && (
                <button
                    onClick={() => onDelete(order.order_id)}
                    className="bg-red-500 text-white rounded-xl py-3 font-medium"
                >
                    Delete
                </button>
                )}

            </div>

            </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;