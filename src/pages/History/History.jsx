import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, RefreshCw, Search, Wallet } from "lucide-react";
import {
  fetchOrders,
  markOrderPaid,
  deleteOrder,
  increaseReminder,
} from "../../api/orderApi";
import {
  deleteMonthlyTiffinBill,
  fetchMonthlyTiffinBillById,
  fetchMonthlyTiffinBills,
  increaseMonthlyTiffinReminder,
  markMonthlyTiffinPaid,
} from "../../api/monthlyTiffinApi";
import {
  deleteDatewiseBill,
  fetchDatewiseBillById,
  fetchDatewiseBills,
  increaseDatewiseBillReminder,
  markDatewiseBillPaid,
} from "../../api/datewiseBillApi";
import { useToastStore } from "../../store/toastStore";
import OrderHistoryRow from "../../components/OrderHistoryRow";
import OrderDetailsModal from "../../components/OrderDetailsModal";
import useOrderStore from "../../store/orderStore";
import { OrderRowSkeleton, Skeleton } from "../../components/Skeleton";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { formatDisplayDate, parseLocalDateTime } from "../../utils/formatDate";
import BillPreviewModal from "../../components/BillPreviewModal";
import TiffinBillPreviewModal from "../../components/monthlyTiffin/TiffinBillPreviewModal";
import DatewiseBillPreviewModal from "../../components/datewise/DatewiseBillPreviewModal";
import MonthlyTiffinHistoryRow from "../../components/monthlyTiffin/MonthlyTiffinHistoryRow";
import MonthlyTiffinDetailView from "../../components/monthlyTiffin/MonthlyTiffinDetailView";
import DatewiseBillHistoryRow from "../../components/datewise/DatewiseBillHistoryRow";
import DatewiseBillDetailView from "../../components/datewise/DatewiseBillDetailView";

const History = () => {
  const [activeTab, setActiveTab] = useState("standard");
  const [orders, setOrders] = useState([]);
  const [tiffinBills, setTiffinBills] = useState([]);
  const [datewiseBills, setDatewiseBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingPaidId, setMarkingPaidId] = useState(null);
  const [markingTiffinPaidId, setMarkingTiffinPaidId] = useState(null);
  const [markingDatewisePaidId, setMarkingDatewisePaidId] = useState(null);
  const [deletingTiffin, setDeletingTiffin] = useState(false);
  const [deletingDatewise, setDeletingDatewise] = useState(false);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedTiffin, setSelectedTiffin] = useState(null);
  const [selectedDatewise, setSelectedDatewise] = useState(null);
  const [reminderBill, setReminderBill] = useState(null);
  const [tiffinPreviewBill, setTiffinPreviewBill] = useState(null);
  const [tiffinPreviewVariant, setTiffinPreviewVariant] = useState("bill");
  const [datewisePreviewBill, setDatewisePreviewBill] = useState(null);
  const [datewisePreviewVariant, setDatewisePreviewVariant] = useState("bill");

  const debouncedSearch = useDebouncedValue(search, 300);

  const toast = useToastStore();
  const navigate = useNavigate();
  const { loadOrder } = useOrderStore();

  const loadHistoryData = async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      const [orderData, tiffinData, datewiseData] = await Promise.all([
        fetchOrders(),
        fetchMonthlyTiffinBills(),
        fetchDatewiseBills(),
      ]);

      setOrders(orderData || []);
      setTiffinBills(tiffinData || []);
      setDatewiseBills(datewiseData || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed", "Unable to load history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const filteredTiffinBills = useMemo(() => {
    const keyword = debouncedSearch.toLowerCase().trim();

    return tiffinBills
      .filter((bill) => {
        const matchesSearch =
          keyword === "" ||
          (bill.customer_name || "").toLowerCase().includes(keyword) ||
          (bill.customer_mobile || "").includes(keyword) ||
          (bill.dish_name || "").toLowerCase().includes(keyword);

        if (!matchesSearch) return false;
        if (filter === "paid") return bill.is_paid;
        if (filter === "unpaid") return !bill.is_paid;
        return true;
      })
      .sort((a, b) => {
        const ta = parseLocalDateTime(a.from_date)?.getTime() || 0;
        const tb = parseLocalDateTime(b.from_date)?.getTime() || 0;
        return tb - ta;
      });
  }, [tiffinBills, debouncedSearch, filter]);

  const filteredDatewiseBills = useMemo(() => {
    const keyword = debouncedSearch.toLowerCase().trim();

    return datewiseBills
      .filter((bill) => {
        const matchesSearch =
          keyword === "" ||
          (bill.customer_name || "").toLowerCase().includes(keyword) ||
          (bill.customer_mobile || "").includes(keyword);

        if (!matchesSearch) return false;
        if (filter === "paid") return bill.is_paid;
        if (filter === "unpaid") return !bill.is_paid;
        return true;
      })
      .sort((a, b) => {
        const ta = parseLocalDateTime(a.created_at)?.getTime() || 0;
        const tb = parseLocalDateTime(b.created_at)?.getTime() || 0;
        return tb - ta;
      });
  }, [datewiseBills, debouncedSearch, filter]);

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
        last.items.push(order);
      } else {
        groups.push({
          key,
          label: formatDayLabel(order.delivery_datetime),
          items: [order],
        });
      }
    });

    return groups;
  }, [filteredOrders]);

  const groupBillsByDate = (bills, getDateValue) => {
    const groups = [];

    bills.forEach((bill) => {
      const dateValue = getDateValue(bill);
      const delivery = parseLocalDateTime(dateValue);
      const key = delivery?.toDateString() || String(dateValue);
      const last = groups[groups.length - 1];

      if (last && last.key === key) {
        last.items.push(bill);
      } else {
        groups.push({
          key,
          label: formatDayLabel(dateValue),
          items: [bill],
        });
      }
    });

    return groups;
  };

  const tiffinByDate = useMemo(
    () => groupBillsByDate(filteredTiffinBills, (bill) => bill.from_date),
    [filteredTiffinBills]
  );

  const datewiseByDate = useMemo(
    () => groupBillsByDate(filteredDatewiseBills, (bill) => bill.created_at),
    [filteredDatewiseBills]
  );

  const standardStats = useMemo(() => {
    const total = orders.length;
    const paid = orders.filter((order) => order.is_paid).length;
    const unpaid = total - paid;
    const pendingAmount = orders
      .filter((order) => !order.is_paid)
      .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    return { total, paid, unpaid, pendingAmount };
  }, [orders]);

  const monthlyStats = useMemo(() => {
    const total = tiffinBills.length;
    const paid = tiffinBills.filter((bill) => bill.is_paid).length;
    const unpaid = total - paid;
    const pendingAmount = tiffinBills
      .filter((bill) => !bill.is_paid)
      .reduce((sum, bill) => sum + Number(bill.total_amount || 0), 0);
    return { total, paid, unpaid, pendingAmount };
  }, [tiffinBills]);

  const datewiseStats = useMemo(() => {
    const total = datewiseBills.length;
    const paid = datewiseBills.filter((bill) => bill.is_paid).length;
    const unpaid = total - paid;
    const pendingAmount = datewiseBills
      .filter((bill) => !bill.is_paid)
      .reduce((sum, bill) => sum + Number(bill.total_amount || 0), 0);
    return { total, paid, unpaid, pendingAmount };
  }, [datewiseBills]);

  const activeStats =
    activeTab === "standard"
      ? standardStats
      : activeTab === "monthly"
        ? monthlyStats
        : datewiseStats;

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

  const handleEdit = (order) => {
    loadOrder(order);
    navigate("/orders/standard");
  };

  const handleMarkPaid = (order_id) => {
    toast.confirm({
      title: "Mark as Paid?",
      message: "This will mark the order as paid.",
      confirmLabel: "Mark Paid",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          setMarkingPaidId(order_id);
          await markOrderPaid(order_id);

          setOrders((prev) =>
            prev.map((order) =>
              order.order_id === order_id ? { ...order, is_paid: true } : order
            )
          );

          setSelectedOrder((prev) =>
            prev?.order_id === order_id ? { ...prev, is_paid: true } : prev
          );

          toast.success("Order Marked as Paid", "Payment updated successfully.");
        } catch (error) {
          console.error(error);
          toast.error("Failed", "Unable to update payment.");
        } finally {
          setMarkingPaidId(null);
        }
      },
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
          order.order_id === order_id ? { ...order, reminder_count } : order
        )
      );

      setSelectedOrder((prev) =>
        prev?.order_id === order_id ? { ...prev, reminder_count } : prev
      );

      if (baseOrder) {
        setReminderBill({ ...baseOrder, reminder_count });
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

  const syncTiffinBill = (bill_id, patch) => {
    setTiffinBills((prev) =>
      prev.map((bill) =>
        bill.bill_id === bill_id ? { ...bill, ...patch } : bill
      )
    );
    setSelectedTiffin((prev) =>
      prev?.bill_id === bill_id ? { ...prev, ...patch } : prev
    );
    setTiffinPreviewBill((prev) =>
      prev?.bill_id === bill_id ? { ...prev, ...patch } : prev
    );
  };

  const syncDatewiseBill = (bill_id, patch) => {
    setDatewiseBills((prev) =>
      prev.map((bill) =>
        bill.bill_id === bill_id ? { ...bill, ...patch } : bill
      )
    );
    setSelectedDatewise((prev) =>
      prev?.bill_id === bill_id ? { ...prev, ...patch } : prev
    );
    setDatewisePreviewBill((prev) =>
      prev?.bill_id === bill_id ? { ...prev, ...patch } : prev
    );
  };

  const openTiffinDetail = async (bill_id) => {
    try {
      const bill = await fetchMonthlyTiffinBillById(bill_id);
      setSelectedTiffin(bill);
    } catch (error) {
      console.error(error);
      toast.error("Failed", "Unable to load tiffin bill.");
    }
  };

  const openDatewiseDetail = async (bill_id) => {
    try {
      const bill = await fetchDatewiseBillById(bill_id);
      setSelectedDatewise(bill);
    } catch (error) {
      console.error(error);
      toast.error("Failed", "Unable to load date-wise bill.");
    }
  };

  const handleMarkTiffinPaid = (bill_id) => {
    toast.confirm({
      title: "Mark as Paid?",
      message: "This will mark the monthly tiffin bill as paid.",
      confirmLabel: "Mark Paid",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          setMarkingTiffinPaidId(bill_id);
          await markMonthlyTiffinPaid(bill_id);
          syncTiffinBill(bill_id, { is_paid: true });
          toast.success("Marked Paid", "Payment updated successfully.");
        } catch (error) {
          console.error(error);
          toast.error("Failed", "Unable to update payment.");
        } finally {
          setMarkingTiffinPaidId(null);
        }
      },
    });
  };

  const handleMarkDatewisePaid = (bill_id) => {
    toast.confirm({
      title: "Mark as Paid?",
      message: "This will mark the date-wise bill as paid.",
      confirmLabel: "Mark Paid",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          setMarkingDatewisePaidId(bill_id);
          await markDatewiseBillPaid(bill_id);
          syncDatewiseBill(bill_id, { is_paid: true });
          toast.success("Marked Paid", "Payment updated successfully.");
        } catch (error) {
          console.error(error);
          toast.error("Failed", "Unable to update payment.");
        } finally {
          setMarkingDatewisePaidId(null);
        }
      },
    });
  };

  const handleTiffinReminder = async (bill_id) => {
    try {
      const response = await increaseMonthlyTiffinReminder(bill_id);
      const reminder_count = response.data.reminder_count;
      const baseBill =
        (selectedTiffin?.bill_id === bill_id ? selectedTiffin : null) ||
        tiffinBills.find((bill) => bill.bill_id === bill_id);

      syncTiffinBill(bill_id, { reminder_count });

      if (baseBill) {
        setTiffinPreviewBill({ ...baseBill, reminder_count });
        setTiffinPreviewVariant("reminder");
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

  const handleDatewiseReminder = async (bill_id) => {
    try {
      const response = await increaseDatewiseBillReminder(bill_id);
      const reminder_count = response.data.reminder_count;
      const baseBill =
        (selectedDatewise?.bill_id === bill_id ? selectedDatewise : null) ||
        datewiseBills.find((bill) => bill.bill_id === bill_id);

      syncDatewiseBill(bill_id, { reminder_count });

      if (baseBill) {
        setDatewisePreviewBill({ ...baseBill, reminder_count });
        setDatewisePreviewVariant("reminder");
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

  const handleDeleteTiffin = (bill_id) => {
    toast.confirm({
      title: "Delete bill?",
      message: "This monthly tiffin bill will be removed permanently.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          setDeletingTiffin(true);
          await deleteMonthlyTiffinBill(bill_id);
          setTiffinBills((prev) => prev.filter((bill) => bill.bill_id !== bill_id));
          setSelectedTiffin(null);
          toast.success("Deleted", "Monthly tiffin bill removed.");
        } catch (error) {
          console.error(error);
          toast.error("Failed", "Unable to delete bill.");
        } finally {
          setDeletingTiffin(false);
        }
      },
    });
  };

  const handleDeleteDatewise = (bill_id) => {
    toast.confirm({
      title: "Delete bill?",
      message: "This date-wise bill will be removed permanently.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          setDeletingDatewise(true);
          await deleteDatewiseBill(bill_id);
          setDatewiseBills((prev) =>
            prev.filter((bill) => bill.bill_id !== bill_id)
          );
          setSelectedDatewise(null);
          toast.success("Deleted", "Date-wise bill removed.");
        } catch (error) {
          console.error(error);
          toast.error("Failed", "Unable to delete bill.");
        } finally {
          setDeletingDatewise(false);
        }
      },
    });
  };

  const renderEmpty = (title, subtitle) => (
    <div className="bg-white rounded-2xl border border-dashed border-gray-300 px-4 py-10 text-center">
      <p className="font-semibold text-gray-800">{title}</p>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">
      <header className="relative bg-gradient-to-br from-orange-500 to-orange-600 px-4 pt-safe pb-5 rounded-b-[1.5rem] shadow-[0_8px_24px_-8px_rgba(249,115,22,0.5)] overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex justify-between items-center gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="press-scale w-9 h-9 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="min-w-0">
              <p className="text-orange-100 text-[10px] font-semibold tracking-[0.12em] uppercase">
                Arefa's Kitchen
              </p>
              <h1 className="text-[1.35rem] font-bold text-white leading-tight mt-0.5 tracking-tight">
                Order History
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadHistoryData({ silent: true })}
            disabled={loading || refreshing}
            className="press-scale w-9 h-9 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center text-white disabled:opacity-60 shrink-0"
            aria-label="Refresh history"
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
                ₹{activeStats.pendingAmount.toLocaleString("en-IN")}
                <span className="text-[11px] font-semibold text-gray-400 ml-1.5 normal-case tracking-normal">
                  · {activeStats.unpaid} unpaid
                </span>
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: "standard", label: `Standard (${standardStats.total})` },
            { id: "monthly", label: `Monthly (${monthlyStats.total})` },
            { id: "datewise", label: `Date-wise (${datewiseStats.total})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`press-scale px-3 py-1.5 rounded-full whitespace-nowrap text-[12px] font-semibold transition ${
                activeTab === tab.id
                  ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm shadow-orange-500/25"
                  : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search customer, mobile or order…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 bg-white border border-gray-200 rounded-xl pl-9 pr-3 text-[13px] font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {filterBtn("all", `All (${activeStats.total})`)}
          {filterBtn("unpaid", `Unpaid (${activeStats.unpaid})`)}
          {filterBtn("paid", `Paid (${activeStats.paid})`)}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <OrderRowSkeleton key={i} />
            ))}
          </div>
        ) : activeTab === "standard" ? (
          filteredOrders.length === 0 ? (
            renderEmpty(
              "No orders found",
              search.trim()
                ? "Try a different search or filter"
                : "Standard orders will appear here after billing"
            )
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
                      {group.items.length}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {group.items.map((order) => (
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
          )
        ) : activeTab === "monthly" ? (
          filteredTiffinBills.length === 0 ? (
            renderEmpty(
              "No monthly bills found",
              search.trim()
                ? "Try a different search or filter"
                : "Monthly tiffin bills will appear here after billing"
            )
          ) : (
            <div className="space-y-4">
              {tiffinByDate.map((group) => (
                <div key={group.key} className="space-y-1.5">
                  <div className="flex items-center gap-2 px-0.5 pt-1">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider shrink-0">
                      {group.label}
                    </span>
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                      {group.items.length}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {group.items.map((bill) => (
                      <MonthlyTiffinHistoryRow
                        key={bill.bill_id}
                        bill={bill}
                        onClick={() => openTiffinDetail(bill.bill_id)}
                        onMarkPaid={handleMarkTiffinPaid}
                        markingPaid={markingTiffinPaidId === bill.bill_id}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filteredDatewiseBills.length === 0 ? (
          renderEmpty(
            "No date-wise bills found",
            search.trim()
              ? "Try a different search or filter"
              : "Date-wise bills will appear here after billing"
          )
        ) : (
          <div className="space-y-4">
            {datewiseByDate.map((group) => (
              <div key={group.key} className="space-y-1.5">
                <div className="flex items-center gap-2 px-0.5 pt-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider shrink-0">
                    {group.label}
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                    {group.items.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {group.items.map((bill) => (
                    <DatewiseBillHistoryRow
                      key={bill.bill_id}
                      bill={bill}
                      onClick={() => openDatewiseDetail(bill.bill_id)}
                      onMarkPaid={handleMarkDatewisePaid}
                      markingPaid={markingDatewisePaidId === bill.bill_id}
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

      {selectedTiffin ? (
        <div className="fixed inset-0 z-[9999] bg-gray-50 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-3.5 py-3 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-bold text-gray-900">Tiffin Bill</p>
              <p className="text-[12px] text-gray-500">
                {selectedTiffin.customer_name || "Details"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedTiffin(null)}
              className="press-scale px-3 py-1.5 rounded-lg bg-gray-100 text-[12px] font-semibold text-gray-700"
            >
              Close
            </button>
          </div>

          <MonthlyTiffinDetailView
            loading={false}
            bill={selectedTiffin}
            deleting={deletingTiffin}
            markingPaid={markingTiffinPaidId === selectedTiffin.bill_id}
            onPreview={() => {
              setTiffinPreviewBill(selectedTiffin);
              setTiffinPreviewVariant("bill");
            }}
            onDelete={() => handleDeleteTiffin(selectedTiffin.bill_id)}
            onMarkPaid={() => handleMarkTiffinPaid(selectedTiffin.bill_id)}
            onReminder={() => handleTiffinReminder(selectedTiffin.bill_id)}
          />
        </div>
      ) : null}

      <TiffinBillPreviewModal
        open={!!tiffinPreviewBill}
        bill={tiffinPreviewBill}
        variant={tiffinPreviewVariant}
        onClose={() => {
          setTiffinPreviewBill(null);
          setTiffinPreviewVariant("bill");
        }}
      />

      {selectedDatewise ? (
        <div className="fixed inset-0 z-[9999] bg-gray-50 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-3.5 py-3 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-bold text-gray-900">Date-wise Bill</p>
              <p className="text-[12px] text-gray-500">
                {selectedDatewise.customer_name || "Details"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDatewise(null)}
              className="press-scale px-3 py-1.5 rounded-lg bg-gray-100 text-[12px] font-semibold text-gray-700"
            >
              Close
            </button>
          </div>

          <DatewiseBillDetailView
            loading={false}
            bill={selectedDatewise}
            deleting={deletingDatewise}
            markingPaid={markingDatewisePaidId === selectedDatewise.bill_id}
            onPreview={() => {
              setDatewisePreviewBill(selectedDatewise);
              setDatewisePreviewVariant("bill");
            }}
            onDelete={() => handleDeleteDatewise(selectedDatewise.bill_id)}
            onMarkPaid={() => handleMarkDatewisePaid(selectedDatewise.bill_id)}
            onReminder={() => handleDatewiseReminder(selectedDatewise.bill_id)}
          />
        </div>
      ) : null}

      <DatewiseBillPreviewModal
        open={!!datewisePreviewBill}
        bill={datewisePreviewBill}
        variant={datewisePreviewVariant}
        onClose={() => {
          setDatewisePreviewBill(null);
          setDatewisePreviewVariant("bill");
        }}
      />
    </div>
  );
};

export default History;
