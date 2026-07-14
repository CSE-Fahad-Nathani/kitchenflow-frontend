import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, RefreshCw, Search, Sparkles, Wallet } from "lucide-react";
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
import { OrderRowSkeleton, Skeleton } from "../../components/Skeleton";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

const History = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingPaidId, setMarkingPaidId] = useState(null);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  const toast = useToastStore();
  const navigate = useNavigate();
  const { loadOrder } = useOrderStore();

  const totalOrders = orders.length;
  const paidOrders = orders.filter((order) => order.is_paid).length;
  const unpaidOrders = totalOrders - paidOrders;

  const pendingAmount = useMemo(
    () =>
      orders
        .filter((order) => !order.is_paid)
        .reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
    [orders]
  );

  const loadOrders = async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed", "Unable to load orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markPaid = async (order_id) => {
    try {
      setMarkingPaidId(order_id);
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

      setSelectedOrder((prev) =>
        prev?.order_id === order_id
          ? {
              ...prev,
              is_paid: true,
            }
          : prev
      );

      toast.success(
        "Order Marked as Paid",
        "Payment updated successfully."
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed", "Unable to update payment.");
    } finally {
      setMarkingPaidId(null);
    }
  };

  const handleMarkPaid = (order_id) => {
    toast.confirm({
      title: "Mark as Paid?",
      message: "This will mark the order as paid.",
      confirmLabel: "Mark Paid",
      cancelLabel: "Cancel",
      onConfirm: () => markPaid(order_id),
    });
  };

  const handleDelete = (order_id) => {
    toast.confirm({
      title: "Delete Order?",
      message: "This cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          await deleteOrder(order_id);
          setOrders((prev) =>
            prev.filter((order) => order.order_id !== order_id)
          );
          setSelectedOrder(null);
          toast.success("Order Deleted", "Order deleted successfully.");
        } catch (error) {
          console.error(error);
          toast.error("Failed", "Unable to delete order.");
        }
      },
    });
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

      setSelectedOrder((prev) =>
        prev?.order_id === order_id
          ? {
              ...prev,
              reminder_count: response.data.reminder_count,
            }
          : prev
      );

      toast.success(
        "Reminder Updated",
        `Reminder Count: ${response.data.reminder_count}`
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed", "Unable to update reminder.");
    }
  };

  const handleEdit = (order) => {
    loadOrder(order);
    navigate("/orders");
  };

  const filteredOrders = useMemo(() => {
    const keyword = debouncedSearch.toLowerCase().trim();

    return orders.filter((order) => {
      const matchesSearch =
        keyword === "" ||
        order.order_number.toString().includes(keyword) ||
        (order.customer_name || "").toLowerCase().includes(keyword) ||
        (order.customer_mobile || "").includes(keyword);

      if (!matchesSearch) return false;
      if (filter === "paid") return order.is_paid;
      if (filter === "unpaid") return !order.is_paid;
      return true;
    });
  }, [orders, debouncedSearch, filter]);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterBtn = (id, label) => (
    <button
      key={id}
      type="button"
      onClick={() => setFilter(id)}
      className={`press-scale px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition ${
        filter === id
          ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/25"
          : "bg-white border border-gray-200 text-gray-600"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">
      <header className="relative bg-gradient-to-br from-orange-500 to-orange-600 px-5 pt-safe pb-7 rounded-b-[1.75rem] shadow-[0_8px_24px_-8px_rgba(249,115,22,0.5)] overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-6 right-8 w-16 h-16 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative flex justify-between items-start gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles
                size={11}
                className="text-orange-200"
                strokeWidth={2.5}
              />
              <p className="text-orange-100 text-[11px] font-semibold tracking-[0.12em] uppercase">
                Arefa's Kitchen
              </p>
            </div>
            <h1 className="text-[1.7rem] font-bold text-white leading-tight mt-1 tracking-tight">
              Order History
            </h1>
            <p className="text-orange-100/90 text-[13px] mt-1 font-medium">
              {loading
                ? "Loading orders…"
                : `${totalOrders} order${totalOrders === 1 ? "" : "s"} total`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadOrders({ silent: true })}
            disabled={loading || refreshing}
            className="press-scale w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white disabled:opacity-60"
            aria-label="Refresh orders"
          >
            {refreshing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <RefreshCw size={18} />
            )}
          </button>
        </div>
      </header>

      <div className="px-4 py-5 space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <Skeleton className="h-3 w-28 rounded-md" />
            <Skeleton className="h-8 w-36 rounded-md" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-amber-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <Wallet size={20} className="text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Pending Amount
              </p>
              <p className="text-2xl font-extrabold text-amber-600 leading-tight mt-0.5">
                ₹{pendingAmount.toLocaleString("en-IN")}
              </p>
              <p className="text-[12px] text-gray-500 mt-0.5 font-medium">
                {unpaidOrders} unpaid order{unpaidOrders === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        )}

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search order, customer or mobile…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 bg-white border border-gray-200 rounded-xl pl-10 pr-3.5 text-[15px] font-medium outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {filterBtn("all", `All (${totalOrders})`)}
          {filterBtn("unpaid", `Unpaid (${unpaidOrders})`)}
          {filterBtn("paid", `Paid (${paidOrders})`)}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <OrderRowSkeleton key={i} />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 px-4 py-10 text-center">
            <p className="font-semibold text-gray-800">No orders found</p>
            <p className="text-sm text-gray-500 mt-1">
              {search.trim()
                ? "Try a different search or filter"
                : "Orders will appear here after billing"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderHistoryRow
                key={order.order_id}
                order={order}
                onClick={() => setSelectedOrder(order)}
                onMarkPaid={handleMarkPaid}
                markingPaid={markingPaidId === order.order_id}
              />
            ))}
          </div>
        )}
      </div>

      <OrderDetailsModal
        open={selectedOrder !== null}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onMarkPaid={handleMarkPaid}
        onReminder={handleReminder}
        onEdit={(order) => {
          setSelectedOrder(null);
          handleEdit(order);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default History;
