import { Plus } from "lucide-react";
import OrderItemCard from "../../components/OrderItemCard";
import CustomerSearch from "../../components/CustomerSearch";
import useOrderStore from "../../store/orderStore";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "../../store/toastStore";
import {
  addOrder,
  updateOrder,
} from "../../api/orderApi";

const Orders = () => {
  const navigate = useNavigate();

  const toast = useToastStore();

  const {
    customer,
    customer_id,
    mobile,

    deliveryDate,
    deliveryTime,

    deliveryCharge,
    discount,
    otherCharges,
    grandTotal,
    items,
  
    isEditing,
    editingOrderId,
  
    setCustomer,
    setCustomerId,
    setMobile,

    setDeliveryDate,
    setDeliveryTime,

    setCharges,
    addItem,
    setItems,
    resetOrder,
  } = useOrderStore();

  const handleItemChange = (index, updatedItem) => {
    const updatedItems = [...items];
    updatedItems[index] = updatedItem;
    setItems(updatedItems);
  };

  const handleDeleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  const handlePreview = async () => {
    try {
      if (!items.length) {
        return toast.warning(
          "No Items",
          "Please add at least one item."
        );
      }
  
      if (!customer.trim()) {
        return toast.warning(
          "Customer Required",
          "Please enter customer name."
        );
      }
  
      const payload = {
        customer_id,
        customer_name: customer,
        customer_mobile: mobile,

        delivery_datetime: `${deliveryDate}T${deliveryTime}:00`,

        delivery_charge: Number(deliveryCharge),
        discount: Number(discount),
        other_charges: Number(otherCharges),
  
        total_amount: Number(grandTotal),
        bill_notes: "",
  
        items: items.map((item) => ({
          dish_id: item.dish_id,
          variant_id: item.variant_id,
          dish_name: item.dish_name,
          variant_name: item.variant_name,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          total_price: Number(item.total),
        })),
      };
  
      if (isEditing) {
        await updateOrder({
          order_id: editingOrderId,
          ...payload,
        });
      
        toast.success(
          "Order Updated",
          "Order updated successfully."
        );
      } else {
        await addOrder(payload);
      
        toast.success(
          "Order Created",
          "Your order has been saved."
        );
      }
  
      resetOrder();
  
      navigate("/history");
    } catch (error) {
      console.error(error);
  
      // toast.error("Failed to create order.");
      toast.error(
        "Failed",
        "Unable to create order."
      );
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">
      <div className="bg-orange-500 px-5 py-5 rounded-b-3xl">
      <h1 className="text-2xl font-bold text-white">
        {isEditing ? "Edit Order" : "New Order"}
      </h1>
      </div>

      <div className="p-4 space-y-4">

      <CustomerSearch
        value={customer}
        onChange={(value) => {
            setCustomer(value);
            setCustomerId(null);
        }}
        onSelect={(customer) => {
            setCustomer(customer.name);
            setCustomerId(customer.customer_id);
            setMobile(customer.mobile || "");
        }}
        />

        <input
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="Mobile Number"
          className="w-full border rounded-xl p-3"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Delivery Date
            </label>

            <input
              type="date"
              value={deliveryDate}
              onChange={(e) =>
                setDeliveryDate(e.target.value)
              }
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Delivery Time
            </label>

            <input
              type="time"
              value={deliveryTime}
              onChange={(e) =>
                setDeliveryTime(e.target.value)
              }
              className="w-full border rounded-xl p-3"
            />
          </div>
        </div>

        {items.map((item, index) => (
          <OrderItemCard
            key={index}
            item={item}
            index={index}
            onChange={handleItemChange}
            onDelete={handleDeleteItem}
          />
        ))}

        <button
          onClick={addItem}
          className="w-full border-2 border-dashed border-orange-500 rounded-xl p-3 text-orange-500 flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add Item
        </button>

        <input
          type="number"
          placeholder="Delivery Charge"
          value={deliveryCharge}
          onChange={(e) =>
            setCharges("deliveryCharge", e.target.value)
          }
          className="w-full border rounded-xl p-3"
        />

        <input
          type="number"
          placeholder="Discount"
          value={discount}
          onChange={(e) =>
            setCharges("discount", e.target.value)
          }
          className="w-full border rounded-xl p-3"
        />

        <input
          type="number"
          placeholder="Other Charges"
          value={otherCharges}
          onChange={(e) =>
            setCharges("otherCharges", e.target.value)
          }
          className="w-full border rounded-xl p-3"
        />

        <div className="bg-white border rounded-xl p-4 flex justify-between">
          <span className="font-semibold">Grand Total</span>

          <span className="text-xl font-bold text-orange-500">
            ₹ {grandTotal.toFixed(2)}
          </span>
        </div>

        <button
        onClick={handlePreview}
        className="w-full bg-orange-500 text-white rounded-xl p-4 font-semibold"
        >
      {isEditing ? "Update Order" : "Preview Bill"}
        </button>

      </div>
    </div>
  );
};

export default Orders;