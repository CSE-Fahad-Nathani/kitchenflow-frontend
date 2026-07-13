import { X } from "lucide-react";

const BillPreviewModal = ({
  open,
  order,
  onClose,
}) => {
  if (!open || !order) return null;

  const handleCopyText = async () => {
   
  
    const delivery = new Date(order.delivery_datetime);

    const formattedDate = delivery.toLocaleDateString("en-GB");
    
    const formattedTime = delivery.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    
    const billText = `*Arefa's Kitchen*

${order.customer_name} (${order.customer_mobile})
Delivery: ${formattedDate} (${formattedTime})
--------------------------------
${order.items
  .map(
    (item) =>
      `${item.dish_name} (${item.variant_name}) = *₹${Number(
        item.total_price
      ).toLocaleString("en-IN")}/-*`
  )
  .join("\n")}${
  Number(order.delivery_charge) > 0
    ? `

Delivery Charge = *₹${Number(
        order.delivery_charge
      ).toLocaleString("en-IN")}/-*`
    : ""
}${
  Number(order.discount) > 0
    ? `
Discount = *-₹${Number(
        order.discount
      ).toLocaleString("en-IN")}/-*`
    : ""
}

*Total = ₹${Number(order.total_amount).toLocaleString(
  "en-IN"
)}/-*`;
  
    try {
      await navigator.clipboard.writeText(
        billText
      );
  
      alert("Bill copied successfully.");
    } catch (error) {
      console.error(error);
  
      alert("Unable to copy bill.");
    }
  };



  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-slide-up"
      >
        <div className="flex justify-between items-center border-b px-5 py-4">

          <h2 className="font-bold text-xl">
            Bill Preview
          </h2>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

        <div className="p-6">

          <div className="text-center">

            <h1 className="text-2xl font-bold">
              Arefa's Kitchen
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Homemade Food
            </p>

          </div>

          <div className="border-t border-dashed my-5" />

          <div className="space-y-2 text-sm">

            <div className="flex justify-between">
              <span>Bill No</span>
              <span>#{order.order_number}</span>
            </div>

            <div className="flex justify-between">
              <span>Customer</span>
              <span>{order.customer_name}</span>
            </div>

            <div className="flex justify-between">
              <span>Mobile</span>
              <span>{order.customer_mobile}</span>
            </div>

          </div>

          <div className="border-t border-dashed my-5" />

          <div className="space-y-3">

            {order.items.map((item) => (
              <div
                key={item.order_item_id || item.dish_name}
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

                <p>
                  ₹{item.total_price}
                </p>

              </div>
            ))}

          </div>

          <div className="border-t border-dashed my-5" />

          <div className="space-y-2">

            <div className="flex justify-between">
              <span>Delivery</span>
              <span>₹{order.delivery_charge}</span>
            </div>

            {Number(order.discount) > 0 && (
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-₹{order.discount}</span>
              </div>
            )}

            <div className="border-t pt-3 flex justify-between text-xl font-bold">

              <span>Total</span>

              <span className="text-orange-500">
                ₹{order.total_amount}
              </span>

            </div>

          </div>

        </div>

        <div className="border-t p-4 flex gap-3">

          <button className="flex-1 border rounded-xl py-3">
            Download ▼
          </button>

          <button
        onClick={handleCopyText}
        className="flex-1 bg-orange-500 text-white rounded-xl py-3"
        >
        Copy Text
        </button>

        </div>

      </div>
    </div>
  );
};

export default BillPreviewModal;