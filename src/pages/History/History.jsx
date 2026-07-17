import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, RefreshCw, Search, Wallet } from "lucide-react";
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
import { formatDisplayDate, parseLocalDateTime } from "../../utils/formatDate";
import BillPreviewModal from "../../components/BillPreviewModal";

const History = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingPaidId, setMarkingPaidId] = useState(null);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reminderBill, setReminderBill] = useState(null);

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
      const reminder_count = response.data.reminder_count;

      const baseOrder =
        (selectedOrder?.order_id === order_id ? selectedOrder : null) ||
        orders.find((order) => order.order_id === order_id);

      setOrders((prev) =>
        prev.map((order) =>
          order.order_id === order_id
            ? {
                ...order,
                reminder_count,
              }
            : order
        )
      );

      setSelectedOrder((prev) =>
        prev?.order_id === order_id
          ? {
              ...prev,
              reminder_count,
            }
          : prev
      );

      if (baseOrder) {
        setReminderBill({
          ...baseOrder,
          reminder_count,
        });
      }

      toast.success(
        "Reminder ready",
        `Reminder #${reminder_count} — download or copy to send.`
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed", "Unable to update reminder.");
    }
  };

  const handleEdit = (order) => {
    loadOrder(order);
    navigate("/orders/standard");
  };

  const filteredOrders = useMemo(() => {
    const keyword = debouncedSearch.toLowerCase().trim();

    return orders
      .filter((order) => {
        const matchesSearch =
          keyword === "" ||
          order.order_number.toString().includes(keyword) ||
          (order.customer_name || "").toLowerCase().includes(keyword) ||
          (order.customer_mobile || "").includes(keyword);

        if (!matchesSearch) return false;
        if (filter === "paid") return order.is_paid;
        if (filter === "unpaid") return !order.is_paid;
        return true;
      })
      .sort((a, b) => {
        const ta = parseLocalDateTime(a.delivery_datetime)?.getTime() || 0;
        const tb = parseLocalDateTime(b.delivery_datetime)?.getTime() || 0;
        return tb - ta;
      });
  }, [orders, debouncedSearch, filter]);

  const formatDayLabel = (datetime) => {
    const delivery = parseLocalDateTime(datetime);
    if (!delivery) return formatDisplayDate(datetime);

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (delivery.toDateString() === today.toDateString()) return "Today";
    if (delivery.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    if (delivery.toDateString() === yesterday.toDateString()) return "Yesterday";

    return formatDisplayDate(datetime);
  };

  const ordersByDate = useMemo(() => {
    const groups = [];

    filteredOrders.forEach((order) => {
      const delivery = parseLocalDateTime(order.delivery_datetime);
      const key = delivery?.toDateString() || String(order.delivery_datetime);
      const last = groups[groups.length - 1];

      if (last && last.key === key) {
        last.orders.push(order);
      } else {
        groups.push({
          key,
          label: formatDayLabel(order.delivery_datetime),
          orders: [order],
        });
      }
    });

    return groups;
  }, [filteredOrders]);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterBtn = (id, label) => (
    <button
      key={id}
      type="button"
      onClick={() => setFilter(id)}
      className={`press-scale px-3 py-1.5 rounded-full whitespace-nowrap text-[12px] font-semibold transition ${
        filter === id
          ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm shadow-orange-500/25"
          : "bg-white border border-gray-200 text-gray-600"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">
      <header className="relative bg-gradient-to-br from-orange-500 to-orange-600 px-4 pt-safe pb-5 rounded-b-[1.5rem] shadow-[0_8px_24px_-8px_rgba(249,115,22,0.5)] overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex justify-between items-center gap-3">
          <div>
            <p className="text-orange-100 text-[10px] font-semibold tracking-[0.12em] uppercase">
              Arefa's Kitchen
            </p>
            <h1 className="text-[1.35rem] font-bold text-white leading-tight mt-0.5 tracking-tight">
              Order History
            </h1>
          </div>

          <button
            type="button"
            onClick={() => loadOrders({ silent: true })}
            disabled={loading || refreshing}
            className="press-scale w-9 h-9 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center text-white disabled:opacity-60"
            aria-label="Refresh orders"
          >
            {refreshing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
          </button>
        </div>
      </header>

      <div className="px-3.5 py-3 space-y-2.5">
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 px-3 py-2.5 flex items-center gap-2.5">
            <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-2.5 w-20 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-amber-100 px-3 py-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <Wallet size={15} className="text-amber-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Pending Amount
              </p>
              <p className="text-[15px] font-extrabold text-amber-600 leading-tight">
                ₹{pendingAmount.toLocaleString("en-IN")}
                <span className="text-[11px] font-semibold text-gray-400 ml-1.5 normal-case tracking-normal">
                  · {unpaidOrders} unpaid
                </span>
              </p>
            </div>
          </div>
        )}

        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search order, customer or mobile…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 bg-white border border-gray-200 rounded-xl pl-9 pr-3 text-[13px] font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {filterBtn("all", `All (${totalOrders})`)}
          {filterBtn("unpaid", `Unpaid (${unpaidOrders})`)}
          {filterBtn("paid", `Paid (${paidOrders})`)}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
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
          <div className="space-y-4">
            {ordersByDate.map((group) => (
              <div key={group.key} className="space-y-1.5">
                <div className="flex items-center gap-2 px-0.5 pt-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider shrink-0">
                    {group.label}
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                    {group.orders.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {group.orders.map((order) => (
                    <OrderHistoryRow
                      key={order.order_id}
                      order={order}
                      onClick={() => setSelectedOrder(order)}
                      onMarkPaid={handleMarkPaid}
                      markingPaid={markingPaidId === order.order_id}
                    />
                  ))}
                </div>
              </div>
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

      <BillPreviewModal
        open={!!reminderBill}
        order={reminderBill}
        variant="reminder"
        onClose={() => setReminderBill(null)}
      />
    </div>
  );
};

export default History;
