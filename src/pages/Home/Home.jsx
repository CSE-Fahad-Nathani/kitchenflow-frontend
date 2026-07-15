import {
  ShoppingCart,
  Users,
  UtensilsCrossed,
  History,
  Star,
  Settings,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  fetchDashboardStatistics,
  fetchTodaysOrders,
} from "../../api/dashboardApi";
import OrderDetailsModal from "../../components/OrderDetailsModal";
import BillPreviewModal from "../../components/BillPreviewModal";
import {
  markOrderPaid,
  increaseReminder,
} from "../../api/orderApi";
import useOrderStore from "../../store/orderStore";
import {
  MenuRowSkeleton,
  StatCardSkeleton,
} from "../../components/Skeleton";
import { useToastStore } from "../../store/toastStore";

const menus = [
  {
    title: "Customers",
    subtitle: "Add / Update Customers",
    icon: Users,
    path: "/customers",
  },
  {
    title: "Dishes",
    subtitle: "Manage Dishes",
    icon: UtensilsCrossed,
    path: "/dishes",
  },
  {
    title: "History",
    subtitle: "Previous Orders",
    icon: History,
    path: "/history",
  },
  {
    title: "Sunday Menu",
    subtitle: "Create Poster",
    icon: Star,
    path: "/sunday-menu",
  },
  {
    title: "Settings",
    subtitle: "Restaurant Settings",
    icon: Settings,
    path: "/settings",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { loadOrder } = useOrderStore();
  const toast = useToastStore();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    today_orders: 0,
    today_revenue: 0,
    pending_orders: 0,
    pending_amount: 0,
  });
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [todayOrders, setTodayOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reminderBill, setReminderBill] = useState(null);

  useEffect(() => {
    const loadHome = async () => {
      try {
        setLoading(true);
        const [dashboard, orders] = await Promise.all([
          fetchDashboardStatistics(),
          fetchTodaysOrders(),
        ]);

        setStats(dashboard);
        setTodayOrders(orders);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadHome();
  }, []);

  const handleRevenueClick = () => {
    setShowRevenueModal(true);
  };

  const handleMarkPaid = async (order_id) => {
    try {
      await markOrderPaid(order_id);

      const dashboard = await fetchDashboardStatistics();
      setStats(dashboard);

      setTodayOrders((prev) =>
        prev.map((order) =>
          order.order_id === order_id ? { ...order, is_paid: true } : order
        )
      );

      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              is_paid: true,
            }
          : null
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleReminder = async (order_id) => {
    try {
      const response = await increaseReminder(order_id);
      const reminder_count = response.data.reminder_count;

      const baseOrder =
        (selectedOrder?.order_id === order_id ? selectedOrder : null) ||
        todayOrders.find((order) => order.order_id === order_id);

      setTodayOrders((prev) =>
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
    setShowRevenueModal(false);
    setSelectedOrder(null);
    loadOrder(order);
    navigate("/orders");
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">
      <header className="relative bg-gradient-to-br from-orange-500 to-orange-600 px-4 pt-safe pb-5 rounded-b-[1.5rem] shadow-[0_8px_24px_-8px_rgba(249,115,22,0.5)] overflow-hidden">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <p className="relative text-orange-100 text-[10px] font-semibold tracking-[0.12em] uppercase">
          Arefa's Kitchen
        </p>
        <h1 className="relative text-[1.35rem] font-bold text-white leading-tight mt-0.5 tracking-tight">
          KitchenFlow
        </h1>
      </header>

      <div className="px-3.5 pt-3">
        {loading ? (
          <div className="grid grid-cols-2 gap-2">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-xl border border-gray-100 px-3 py-2.5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Today's Orders
              </p>
              <h2 className="text-xl font-bold mt-0.5 text-gray-900 leading-tight">
                {stats.today_orders}
              </h2>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 px-3 py-2.5">
              <div className="flex justify-between items-start gap-1.5">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Today's Revenue
                  </p>
                  <h2 className="text-xl font-bold mt-0.5 text-green-600 leading-tight">
                    ₹{Number(stats.today_revenue).toFixed(0)}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleRevenueClick}
                  className="text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full shrink-0"
                >
                  View
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 px-3 py-2.5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Pending Orders
              </p>
              <h2 className="text-xl font-bold mt-0.5 text-gray-900 leading-tight">
                {stats.pending_orders}
              </h2>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 px-3 py-2.5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Pending Amount
              </p>
              <h2 className="text-xl font-bold mt-0.5 text-orange-500 leading-tight">
                ₹{Number(stats.pending_amount).toFixed(0)}
              </h2>
            </div>
          </div>
        )}
      </div>

      <div className="px-3.5 pt-2.5 pb-2">
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 px-3 py-2.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease_infinite]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-24 rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease_infinite]" />
              <div className="h-2.5 w-20 rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease_infinite]" />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="press-scale w-full bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl px-3.5 py-3 shadow-md shadow-orange-500/25 text-white flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={22} />
              <div className="text-left">
                <h2 className="text-[15px] font-semibold leading-tight">
                  New Order
                </h2>
                <p className="text-orange-100 text-[11px]">Generate Bill</p>
              </div>
            </div>
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      <div className="px-3.5 space-y-1.5">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <MenuRowSkeleton key={i} />
            ))
          : menus.map((menu) => {
              const Icon = menu.icon;

              return (
                <button
                  key={menu.title}
                  type="button"
                  onClick={() => navigate(menu.path)}
                  className="press-scale w-full bg-white rounded-xl border border-gray-100 px-3 py-2.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
                      <Icon size={16} className="text-orange-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-[13.5px] text-gray-900 leading-tight">
                        {menu.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {menu.subtitle}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              );
            })}
      </div>

      {showRevenueModal && (
        <div
          className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px] flex items-end"
          onClick={() => setShowRevenueModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md mx-auto bg-white rounded-t-3xl max-h-[85dvh] overflow-hidden animate-slide-up shadow-[0_-8px_40px_rgba(0,0,0,0.15)] flex flex-col"
          >
            <div className="shrink-0 px-5 pt-3 pb-4 border-b border-gray-100 bg-gradient-to-b from-orange-50/80 to-white">
              <div className="w-11 h-1.5 bg-gray-300/90 rounded-full mx-auto mb-4" />

              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-orange-500 uppercase tracking-[0.12em]">
                    Today
                  </p>
                  <h2 className="text-xl font-bold text-gray-900 mt-0.5">
                    Today's Orders
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 font-medium">
                    {todayOrders.length}{" "}
                    {todayOrders.length === 1 ? "order" : "orders"} · ₹
                    {Number(stats.today_revenue).toLocaleString("en-IN")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRevenueModal(false)}
                  aria-label="Close"
                  className="press-scale w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-800 active:bg-gray-50 transition-colors"
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none p-3 space-y-2.5">
              {todayOrders.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart size={22} className="text-orange-400" />
                  </div>
                  <p className="font-semibold text-gray-800">No orders today</p>
                  <p className="text-sm text-gray-500 mt-1">
                    New bills will show up here
                  </p>
                </div>
              ) : (
                todayOrders.map((order) => (
                  <button
                    key={order.order_id}
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="press-scale w-full text-left bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-3.5 active:border-orange-200 active:bg-orange-50/40 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {order.customer_name?.trim() ||
                            `Order #${order.order_number}`}
                        </h3>
                        <p className="text-[13px] text-gray-500 mt-0.5 font-medium">
                          #{order.order_number}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold text-orange-500 text-[15px]">
                          ₹{Number(order.total_amount).toLocaleString("en-IN")}
                        </p>
                        <p
                          className={`mt-0.5 text-[12px] font-semibold ${
                            order.is_paid ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {order.is_paid ? "Paid" : "Unpaid"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-gray-400">
                        Tap to view details
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[12px] font-bold text-orange-500">
                        Open
                        <ChevronRight size={14} strokeWidth={2.5} />
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="shrink-0 p-3 border-t border-gray-100 bg-white">
              <button
                type="button"
                onClick={() => setShowRevenueModal(false)}
                className="press-scale w-full h-12 rounded-xl border border-gray-200 bg-gray-50 font-semibold text-gray-700 active:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <OrderDetailsModal
        open={selectedOrder !== null}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onMarkPaid={handleMarkPaid}
        onReminder={handleReminder}
        onEdit={handleEdit}
        showDelete={false}
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

export default Home;
