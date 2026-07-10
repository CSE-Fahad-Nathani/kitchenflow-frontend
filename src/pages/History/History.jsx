import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import {
  fetchOrders,
  markOrderPaid,
  deleteOrder,
  increaseReminder,
} from "../../api/orderApi";
  
import { useToastStore } from "../../store/toastStore";
import OrderHistoryRow from "../../components/OrderHistoryRow";
import OrderDetailsModal from "../../components/OrderDetailsModal";
import useOrderStore from "../../store/orderStore";

const History = () => {

  //  States
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);

    const toast = useToastStore();

    const navigate = useNavigate();

    const { loadOrder } = useOrderStore();

    const totalOrders = orders.length;
    const paidOrders = orders.filter((order) => order.is_paid).length;
    const unpaidOrders = totalOrders - paidOrders;

 
//  Functions
 
    const loadOrders = async () => {
    try {
      setLoading(true);

      const data = await fetchOrders();

      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (order_id) => {
    const confirm = window.confirm(
      "Mark this order as paid?"
    );
  
    if (!confirm) return;
  
    try {
      await markOrderPaid(order_id);
  
      setOrders((prev) =>
        prev.map((order) =>
          order.order_id === order_id
            ? {
                ...order,
                is_paid: true,
              }
            : order
        )
      );
  
      toast.success(
        "Order Marked as Paid",
        "Your order has been marked as paid."
      );
    } catch (error) {
      console.error(error);
  
      toast.error(
        "Failed",
        "Unable to update payment."
      );
    }
  };


  const handleDelete = async (order_id) => {
    if (!window.confirm("Delete this order?")) return;
  
    try {
      await deleteOrder(order_id);
  
      setOrders((prev) =>
        prev.filter((order) => order.order_id !== order_id)
      );
  
      toast.success(
        "Order Deleted",
        "Order deleted successfully."
      );
    } catch (error) {
      console.error(error);
  
      toast.error(
        "Failed",
        "Unable to delete order."
      );
    }
  };
  
  const handleReminder = async (order_id) => {
    try {
      const response = await increaseReminder(order_id);
  
      setOrders((prev) =>
        prev.map((order) =>
          order.order_id === order_id
            ? {
                ...order,
                reminder_count: response.data.reminder_count,
              }
            : order
        )
      );
  
      toast.success(
        "Reminder Updated",
        `Reminder Count: ${response.data.reminder_count}`
      );
    } catch (error) {
      console.error(error);
  
      toast.error(
        "Failed",
        "Unable to update reminder."
      );
    }
  };
  
  const handleEdit = (order) => {
    loadOrder(order);
  
    navigate("/orders");
  };











//  Effects

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">

<div className="sticky top-0 z-10 bg-white border-b">

<div className="px-5 pt-5 pb-4">

  <div className="flex justify-between items-center">

    <div>

      <p className="text-sm text-gray-500">
        KitchenFlow
      </p>

      <h1 className="text-3xl font-bold">
        Orders
      </h1>

    </div>

    <button
      onClick={loadOrders}
      className="w-10 h-10 rounded-xl border flex items-center justify-center"
    >
      <RefreshCw size={18} />
    </button>

  </div>

</div>

</div>

<div className="px-4 py-5 space-y-4">
    <div className="relative mb-4">

    <input
    type="text"
    placeholder="Search by Order No, Customer or Mobile..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
    />

    </div>

<div className="flex gap-2 overflow-x-auto pb-2">

  <button
    onClick={() => setFilter("all")}
    className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
      filter === "all"
        ? "bg-orange-500 text-white"
        : "bg-white border"
    }`}
  >
    All ({totalOrders})
  </button>

  <button
    onClick={() => setFilter("unpaid")}
    className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
      filter === "unpaid"
        ? "bg-orange-500 text-white"
        : "bg-white border"
    }`}
  >
    Unpaid ({unpaidOrders})
  </button>

  <button
    onClick={() => setFilter("paid")}
    className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
      filter === "paid"
        ? "bg-orange-500 text-white"
        : "bg-white border"
    }`}
  >
    Paid ({paidOrders})
  </button>

</div>

{loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No Orders Found
          </div>
        ) : (
          <div className="space-y-4">

        {orders
        .filter((order) => {
            const keyword = search.toLowerCase().trim();

            const matchesSearch =
            keyword === "" ||
            order.order_number.toString().includes(keyword) ||
            order.customer_name.toLowerCase().includes(keyword) ||
            order.customer_mobile.includes(keyword);

            if (!matchesSearch) return false;

            if (filter === "paid") return order.is_paid;

            if (filter === "unpaid") return !order.is_paid;

            return true;
        })
        .map((order) => (
          <OrderHistoryRow
            key={order.order_id}
            order={order}
            onClick={() => setSelectedOrder(order)}
          />
        ))}

          </div>
        )}

      </div>


      <OrderDetailsModal
        open={selectedOrder !== null}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onMarkPaid={async (order_id) => {
          await handleMarkPaid(order_id);

          setSelectedOrder((prev) =>
            prev
              ? {
                  ...prev,
                  is_paid: true,
                }
              : null
          );
        }}
        onReminder={async (order_id) => {
          await handleReminder(order_id);

          const updated = orders.find(
            (o) => o.order_id === order_id
          );

          if (updated) {
            setSelectedOrder({
              ...updated,
              reminder_count:
                updated.reminder_count + 1,
            });
          }
        }}
        onEdit={(order) => {
          setSelectedOrder(null);
          handleEdit(order);
        }}
        onDelete={async (order_id) => {
          await handleDelete(order_id);
          setSelectedOrder(null);
        }}
      />




    </div>
  );
};

export default History;