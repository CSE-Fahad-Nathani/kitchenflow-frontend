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
import {
  markOrderPaid,
  increaseReminder,
} from "../../api/orderApi";

import useOrderStore from "../../store/orderStore";





  
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

    const [stats, setStats] = useState({
      today_orders: 0,
      today_revenue: 0,
      pending_orders: 0,
      pending_amount: 0,
    });
    const [showRevenueModal, setShowRevenueModal] =
      useState(false);

    const [todayOrders, setTodayOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);


    useEffect(() => {
      const loadHome = async () => {
        try {
          const [dashboard, orders] = await Promise.all([
            fetchDashboardStatistics(),
            fetchTodaysOrders(),
          ]);
    
          setStats(dashboard);
          setTodayOrders(orders);
        } catch (error) {
          console.error(error);
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
            order.order_id === order_id
              ? { ...order, is_paid: true }
              : order
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
                  reminder_count:
                    response.data.reminder_count,
                }
              : order
          )
        );
    
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                reminder_count:
                  response.data.reminder_count,
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
        <div className="bg-orange-500 rounded-b-3xl px-5 py-6 shadow">
          <h1 className="text-2xl font-bold text-white">
            KitchenFlow
          </h1>
  
          <p className="text-orange-100 mt-1">
            Arefa's Kitchen
          </p>
        </div>

        <div className="px-4 pt-5">
          <div className="grid grid-cols-2 gap-3">

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500">Today's Orders</p>
              <h2 className="text-2xl font-bold mt-1">
                {stats.today_orders}
              </h2>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">

              <div className="flex justify-between items-start">

                <div>
                  <p className="text-xs text-gray-500">
                    Today's Revenue
                  </p>

                  <h2 className="text-2xl font-bold mt-1 text-green-600">
                    ₹{Number(stats.today_revenue).toFixed(0)}
                  </h2>
                </div>

                <button
                  onClick={handleRevenueClick}
                  className="text-xs text-orange-500 font-medium"
                >
                  View
                </button>

              </div>

              </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500">Pending Orders</p>
              <h2 className="text-2xl font-bold mt-1">
                {stats.pending_orders}
              </h2>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500">Pending Amount</p>
              <h2 className="text-2xl font-bold mt-1 text-orange-500">
                ₹{Number(stats.pending_amount).toFixed(0)}
              </h2>
            </div>

          </div>
        </div>
  
        <div className="p-4">
          <button
            onClick={() => navigate("/orders")}
            className="w-full bg-orange-500 rounded-2xl p-5 shadow text-white flex items-center justify-between active:scale-95 transition"
          >
            <div className="flex items-center gap-4">
              <ShoppingCart size={34} />
  
              <div className="text-left">
                <h2 className="text-lg font-semibold">
                  New Order
                </h2>
  
                <p className="text-orange-100 text-sm">
                  Generate Bill
                </p>
              </div>
            </div>
  
            <ChevronRight />
          </button>
        </div>
  
        <div className="px-4 space-y-3">
          {menus.map((menu) => {
            const Icon = menu.icon;
  
            return (
              <button
                key={menu.title}
                onClick={() => navigate(menu.path)}
                className="w-full bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between active:scale-95 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Icon size={22} className="text-orange-500" />
                  </div>
  
                  <div className="text-left">
                    <h3 className="font-semibold">
                      {menu.title}
                    </h3>
  
                    <p className="text-sm text-gray-500">
                      {menu.subtitle}
                    </p>
                  </div>
                </div>
  
                <ChevronRight
                  size={18}
                  className="text-gray-400"
                />
              </button>
            );
          })}
        </div>


{/* Today's Orders Modal */}
        {showRevenueModal && (
          <div
            className="fixed inset-0 z-[9999] bg-black/40 flex items-end"
            onClick={() => setShowRevenueModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md mx-auto bg-white rounded-t-3xl max-h-[75vh] overflow-hidden animate-slide-up"
            >
              <div className="p-4 border-b">

                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">
                      Today's Orders
                    </h2>

                    <p className="text-sm text-gray-500">
                      {todayOrders.length} Orders • ₹
                      {Number(stats.today_revenue).toFixed(0)}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowRevenueModal(false)}
                    className="text-gray-500 text-xl"
                  >
                    ×
                  </button>
                </div>

              </div>

              <div className="overflow-y-auto max-h-[60vh]">

                {todayOrders.map((order) => (

                  <div
                  key={order.order_id}
                  onClick={() => setSelectedOrder(order)}
                  className="p-4 border-b cursor-pointer active:bg-gray-50 transition"
                  >
                    <div className="flex justify-between">

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
                          className={`text-xs ${
                            order.is_paid
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {order.is_paid ? "Paid" : "Unpaid"}
                        </span>

                      </div>

                    </div>

                  </div>

                ))}

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