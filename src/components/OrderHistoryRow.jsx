import { CalendarDays } from "lucide-react";

const OrderHistoryRow = ({ order, onClick }) => {
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
  } else if (
    delivery.toDateString() === tomorrow.toDateString()
  ) {
    day = "Tomorrow";
  }

  const time = delivery.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl border border-gray-100 p-4 text-left active:bg-gray-50 transition"
    >
      <div className="flex justify-between items-start">

        <div>

          <h3 className="font-semibold">
            {order.customer_name}
          </h3>

          <p className="text-sm text-gray-500">
            #{order.order_number}
          </p>

        </div>

        <div className="text-right">

          <p className="font-bold text-orange-500">
            ₹{order.total_amount}
          </p>

          <span
            className={`text-xs font-medium ${
              order.is_paid
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {order.is_paid ? "Paid" : "Unpaid"}
          </span>

        </div>

      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">

        <CalendarDays size={15} />

        {day} • {time}

      </div>
    </button>
  );
};

export default OrderHistoryRow;