import { useMemo, useRef, useState } from "react";
import {
  Plus,
  User,
  Phone,
  CalendarDays,
  Clock,
  ShoppingBag,
  Loader2,
  Sparkles,
} from "lucide-react";
import OrderItemCard from "../../components/OrderItemCard";
import CustomerSearch from "../../components/CustomerSearch";
import useOrderStore from "../../store/orderStore";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "../../store/toastStore";
import { addOrder, updateOrder } from "../../api/orderApi";
import BillPreviewModal from "../../components/BillPreviewModal";

const TIME_OPTIONS = (() => {
  const options = [];

  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      const value = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;

      const date = new Date();
      date.setHours(hour, minute, 0, 0);

      const label = date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      options.push({ value, label });
    }
  }

  return options;
})();

const SectionLabel = ({ icon: Icon, children, badge }) => (
  <div className="flex items-center justify-between px-0.5">
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-100/80 flex items-center justify-center shadow-sm">
        <Icon size={14} className="text-orange-600" strokeWidth={2.25} />
      </div>
      <h2 className="text-[13px] font-bold text-gray-800 tracking-wide">
        {children}
      </h2>
    </div>
    {badge}
  </div>
);

const Orders = () => {
  const navigate = useNavigate();
  const toast = useToastStore();

  const [showBillModal, setShowBillModal] = useState(false);
  const [billData, setBillData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef(null);

  const {
    customer,
    customer_id,
    mobile,
    deliveryDate,
    deliveryTime,
    deliveryCharge,
    discount,
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

  const canFinalize = items.length > 0 && !submitting;

  const itemsSubtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.total || 0), 0),
    [items]
  );

  const handleItemChange = (index, updatedItem) => {
    const updatedItems = [...items];
    updatedItems[index] = updatedItem;
    setItems(updatedItems);
  };

  const handleDeleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    addItem();

    setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;

      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    }, 80);
  };

  const handlePreview = async () => {
    if (!canFinalize) return;

    const incompleteItem = items.find(
      (item) => !item.dish_name.trim() || Number(item.total) <= 0
    );

    if (incompleteItem) {
      return toast.warning(
        "Incomplete Item",
        "Each item needs a dish name and amount."
      );
    }

    const payload = {
      customer_id: customer_id || null,
      customer_name: customer.trim() || null,
      customer_mobile: mobile.trim() || null,
      delivery_datetime: `${deliveryDate}T${deliveryTime}:00`,
      delivery_charge: Number(deliveryCharge),
      discount: Number(discount),
      other_charges: 0,
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

    try {
      setSubmitting(true);

      if (isEditing) {
        await updateOrder({
          order_id: editingOrderId,
          ...payload,
        });

        toast.success("Order Updated", "Order updated successfully.");
        resetOrder();
        navigate("/history");
        return;
      }

      const response = await addOrder(payload);

      setBillData(response.data);
      setShowBillModal(true);

      toast.success("Order Created", "Bill generated successfully.");
      resetOrder();
    } catch (error) {
      console.error(error);
      toast.error(
        "Failed",
        isEditing ? "Unable to update order." : "Unable to create order."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto h-[calc(100dvh-4rem)] -mb-20 overflow-hidden bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="shrink-0 z-30 relative bg-gradient-to-br from-orange-500 to-orange-600 px-5 pt-safe pb-7 rounded-b-[1.75rem] shadow-[0_8px_24px_-8px_rgba(249,115,22,0.5)] overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-6 right-8 w-16 h-16 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative flex items-center gap-1.5">
          <Sparkles size={11} className="text-orange-200" strokeWidth={2.5} />
          <p className="text-orange-100 text-[11px] font-semibold tracking-[0.12em] uppercase">
            Arefa's Kitchen
          </p>
        </div>
        <h1 className="relative text-[1.7rem] font-bold text-white leading-tight mt-1 tracking-tight">
          {isEditing ? "Edit Order" : "New Order"}
        </h1>
        <p className="relative text-orange-100/90 text-[13px] mt-1 font-medium">
          {isEditing
            ? "Update details and save changes"
            : "Add customer, items & finalize bill"}
        </p>
      </header>

      {/* Scrollable body — scrolls when items overflow the screen */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-none px-4 pt-5 pb-32 space-y-5"
      >
        {/* Customer */}
        <section className="space-y-2.5">
          <SectionLabel icon={User}>Customer</SectionLabel>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-3.5 space-y-2.5">
            <CustomerSearch
              value={customer}
              onChange={(value) => {
                setCustomer(value);
                setCustomerId(null);
              }}
              onSelect={(selected) => {
                setCustomer(selected.name);
                setCustomerId(selected.customer_id);
                setMobile(selected.mobile || "");
              }}
            />

            <div className="relative">
              <Phone
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="tel"
                inputMode="numeric"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Mobile number (optional)"
                className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 text-[15px] outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all"
              />
            </div>
          </div>
        </section>

        {/* Delivery */}
        <section className="space-y-2.5">
          <SectionLabel icon={CalendarDays}>Delivery</SectionLabel>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-3.5">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider">
                  Date
                </span>
                <div className="relative mt-1.5">
                  <CalendarDays
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-2.5 text-[13.5px] font-medium outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all appearance-none"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider">
                  Time
                </span>
                <div className="relative mt-1.5">
                  <Clock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <select
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-2.5 text-[13.5px] font-medium outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all appearance-none"
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time.value} value={time.value}>
                        {time.label}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
            </div>
          </div>
        </section>

        {/* Items */}
        <section className="space-y-2.5">
          <SectionLabel
            icon={ShoppingBag}
            badge={
              <span className="text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            }
          >
            Items
          </SectionLabel>

          {items.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 px-3.5 py-3 flex items-center gap-2.5 text-sm text-gray-500">
              <ShoppingBag size={16} className="text-orange-400 shrink-0" />
              <span className="font-medium">No items yet — tap below to add</span>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <OrderItemCard
                  key={index}
                  item={item}
                  index={index}
                  onChange={handleItemChange}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleAddItem}
            className="press-scale w-full border-2 border-dashed border-orange-300 bg-orange-50/60 rounded-2xl py-3.5 text-orange-600 font-semibold flex items-center justify-center gap-2 active:bg-orange-100/60 transition-colors"
          >
            <Plus size={18} strokeWidth={2.5} />
            Add Item
          </button>
        </section>

        {/* Charges */}
        <section className="space-y-2.5">
          <h2 className="text-[13px] font-bold text-gray-800 tracking-wide px-0.5">
            Charges
          </h2>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-3.5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider">
                  Delivery
                </span>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    placeholder="0"
                    value={deliveryCharge || ""}
                    onChange={(e) =>
                      setCharges("deliveryCharge", e.target.value)
                    }
                    className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-7 pr-3 text-[15px] font-medium outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider">
                  Discount
                </span>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    placeholder="0"
                    value={discount || ""}
                    onChange={(e) => setCharges("discount", e.target.value)}
                    className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-7 pr-3 text-[15px] font-medium outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all"
                  />
                </div>
              </label>
            </div>

            {items.length > 0 && (
              <div className="pt-3 border-t border-dashed border-gray-200 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Items</span>
                  <span>₹{itemsSubtotal.toFixed(2)}</span>
                </div>
                {Number(deliveryCharge) > 0 && (
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Delivery</span>
                    <span>+₹{Number(deliveryCharge).toFixed(2)}</span>
                  </div>
                )}
                {Number(discount) > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span>
                    <span>-₹{Number(discount).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Sticky action bar — sits above bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 z-40 pointer-events-none">
        <div className="max-w-md mx-auto px-4 pb-3 pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_-4px_28px_rgba(0,0,0,0.1)] p-3.5 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider">
                Grand Total
              </p>
              <p className="text-[1.65rem] font-extrabold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent leading-tight truncate">
                ₹{Number(grandTotal).toFixed(2)}
              </p>
            </div>

            <button
              type="button"
              onClick={handlePreview}
              disabled={!canFinalize}
              className={`press-scale shrink-0 min-w-[9.5rem] h-[3.1rem] rounded-xl px-5 font-semibold text-white flex items-center justify-center gap-2 transition-colors ${
                canFinalize
                  ? "bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving
                </>
              ) : isEditing ? (
                "Update Order"
              ) : (
                "Finalize Bill"
              )}
            </button>
          </div>
        </div>
      </div>

      <BillPreviewModal
        open={showBillModal}
        order={billData}
        onClose={() => {
          setShowBillModal(false);
          setBillData(null);
        }}
      />
    </div>
  );
};

export default Orders;