import { CalendarDays, Phone } from "lucide-react";
import {
  formatDisplayDate,
  formatDisplayTime,
  parseLocalDateTime,
} from "../utils/formatDate";

const OrderCard = ({
  order,
  onMarkPaid,
  onDelete,
  onReminder,
  onEdit,
}) => {
  const deliveryDate = parseLocalDateTime(order.delivery_datetime);

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  let deliveryDay = formatDisplayDate(order.delivery_datetime);

  if (deliveryDate && deliveryDate.toDateString() === today.toDateString()) {
    deliveryDay = "Today";
  } else if (
    deliveryDate &&
    deliveryDate.toDateString() === tomorrow.toDateString()
  ) {
    deliveryDay = "Tomorrow";
  }

  const deliveryTime = formatDisplayTime(order.delivery_datetime);




  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">

      <div className="flex justify-between items-start">

        <div>

          <p className="text-xs text-gray-400">
            Order No.
          </p>

          <h2 className="text-lg font-bold">
            #{order.order_number}
          </h2>

        </div>

        <div className="text-right">

          <p className="text-xs text-gray-400">
            Total
          </p>

          <h2 className="text-xl font-bold text-orange-500">
            ₹{order.total_amount}
          </h2>

        </div>

      </div>

      <div className="mt-5">

        <p className="font-semibold text-lg">
          {order.customer_name}
        </p>

        <div className="mt-2 flex items-center gap-2 text-gray-500 text-sm">
          <Phone size={15} />
          {order.customer_mobile}
        </div>

       <div className="mt-3 flex items-start gap-2 text-sm">
          <CalendarDays
            size={16}
            className="text-orange-500 mt-0.5"
          />

          <div>
            <p className="text-xs text-gray-400">
              Delivery
            </p>

            <p className="font-medium text-gray-800">
              {deliveryDay}
            </p>

            <p className="text-gray-500">
              {deliveryTime}
            </p>
          </div>
        </div>

      </div>

      <div className="my-5 border-t" />

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
                {item.variant_name} × {item.quantity}
              </p>

            </div>

            <p className="font-semibold">
              ₹{item.total_price}
            </p>

          </div>
        ))}

      </div>

      <div className="my-5 border-t" />

      <div className="flex justify-between items-center">
        <span
          className={`text-sm font-semibold ${
            order.is_paid ? "text-green-600" : "text-red-600"
          }`}
        >
          {order.is_paid ? "Paid" : "Unpaid"}
        </span>

        <span className="text-xs text-gray-500">
          Reminder: {order.reminder_count}
        </span>
      </div>

        <div className="mt-5 flex justify-between text-sm">

        {!order.is_paid ? (
          <button
            onClick={() => onMarkPaid(order.order_id)}
            className="font-medium text-green-600"
          >
            Mark Paid
          </button>
        ) : (
          <button
            disabled
            className="font-medium text-gray-400"
          >
            Paid
          </button>
        )}

        <button
          onClick={() => onReminder(order.order_id)}
          className="font-medium text-orange-500"
        >
          Reminder
        </button>

        <button
          onClick={() => onEdit(order)}
          className="font-medium text-blue-600"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(order.order_id)}
          className="font-medium text-red-500"
        >
          Delete
        </button>

        </div>

    </div>
  );
};

export default OrderCard;