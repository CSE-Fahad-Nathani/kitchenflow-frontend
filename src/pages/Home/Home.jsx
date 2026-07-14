import {
  ShoppingCart,
  Users,
  UtensilsCrossed,
  History,
  Star,
  Settings,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  fetchDashboardStatistics,
  fetchTodaysOrders,
} from "../../api/dashboardApi";
import OrderDetailsModal from "../../components/OrderDetailsModal";
import {
  markOrderPaid,
  increaseReminder,
} from "../../api/orderApi";
import useOrderStore from "../../store/orderStore";
import {
  MenuRowSkeleton,
  StatCardSkeleton,
} from "../../components/Skeleton";

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

      setTodayOrders((prev) =>
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
        prev
          ? {
              ...prev,
              reminder_count: response.data.reminder_count,
            }
          : null
      );
    } catch (error) {
      console.error(error);
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
      <header className="relative bg-gradient-to-br from-orange-500 to-orange-600 px-5 pt-safe pb-7 rounded-b-[1.75rem] shadow-[0_8px_24px_-8px_rgba(249,115,22,0.5)] overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-6 right-8 w-16 h-16 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative flex items-center gap-1.5">
          <Sparkles size={11} className="text-orange-200" strokeWidth={2.5} />
          <p className="text-orange-100 text-[11px] font-semibold tracking-[0.12em] uppercase">
            Arefa's Kitchen
          </p>
        </div>
        <h1 className="relative text-[1.7rem] font-bold text-white leading-tight mt-1 tracking-tight">
          KitchenFlow
        </h1>
        <p className="relative text-orange-100/90 text-[13px] mt-1 font-medium">
          Dashboard overview
        </p>
      </header>

      <div className="px-4 pt-5">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Today's Orders
              </p>
              <h2 className="text-2xl font-bold mt-1.5 text-gray-900">
                {stats.today_orders}
              </h2>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-4">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Today's Revenue
                  </p>
                  <h2 className="text-2xl font-bold mt-1.5 text-green-600">
                    ₹{Number(stats.today_revenue).toFixed(0)}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleRevenueClick}
                  className="text-[11px] font-bold text-orange-500 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full shrink-0"
                >
                  View
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Pending Orders
              </p>
              <h2 className="text-2xl font-bold mt-1.5 text-gray-900">
                {stats.pending_orders}
              </h2>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Pending Amount
              </p>
              <h2 className="text-2xl font-bold mt-1.5 text-orange-500">
                ₹{Number(stats.pending_amount).toFixed(0)}
              </h2>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-4">
              <div className="w-[34px] h-[34px] rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease_infinite]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease_infinite]" />
                <div className="h-3 w-24 rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease_infinite]" />
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="press-scale w-full bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 shadow-lg shadow-orange-500/25 text-white flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <ShoppingCart size={34} />
              <div className="text-left">
                <h2 className="text-lg font-semibold">New Order</h2>
                <p className="text-orange-100 text-sm">Generate Bill</p>
              </div>
            </div>
            <ChevronRight />
          </button>
        )}
      </div>

      <div className="px-4 space-y-3">
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
                  className="press-scale w-full bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-100/80 flex items-center justify-center">
                      <Icon size={22} className="text-orange-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">
                        {menu.title}
                      </h3>
                      <p className="text-sm text-gray-500">{menu.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
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
                        <span
                          className={`inline-block mt-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            order.is_paid
                              ? "text-green-700 bg-green-50 border border-green-100"
                              : "text-red-600 bg-red-50 border border-red-100"
                          }`}
                        >
                          {order.is_paid ? "Paid" : "Unpaid"}
                        </span>
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
    </div>
  );
};

export default Home;
