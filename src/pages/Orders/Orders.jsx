import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Plus,
  User,
  Phone,
  CalendarDays,
  Clock,
  ShoppingBag,
  Loader2,
  UserPlus,
} from "lucide-react";
import OrderItemCard from "../../components/OrderItemCard";
import CustomerSearch from "../../components/CustomerSearch";
import useOrderStore from "../../store/orderStore";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "../../store/toastStore";
import { addOrder, updateOrder } from "../../api/orderApi";
import { addCustomer } from "../../api/customerApi";
import { addDish } from "../../api/dishApi";
import BillPreviewModal from "../../components/BillPreviewModal";
import DateInput from "../../components/DateInput";

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

const fieldClass =
  "w-full h-9 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-medium outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all";

const SectionLabel = ({ icon: Icon, children, badge }) => (
  <div className="flex items-center justify-between px-0.5">
    <div className="flex items-center gap-1.5">
      <div className="w-5 h-5 rounded-md bg-orange-50 border border-orange-100 flex items-center justify-center">
        <Icon size={11} className="text-orange-600" strokeWidth={2.5} />
      </div>
      <h2 className="text-[12px] font-bold text-gray-700 tracking-wide">
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
  const [returnToHistory, setReturnToHistory] = useState(false);
  const [saveNewCustomer, setSaveNewCustomer] = useState(true);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [addingDishIndex, setAddingDishIndex] = useState(null);
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
  const isNewCustomerCandidate = Boolean(
    (customer || "").trim() && !customer_id
  );

  const itemsSubtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.total || 0), 0),
    [items]
  );

  const createCustomerFromForm = async () => {
    const response = await addCustomer({
      name: (customer || "").trim(),
      mobile: (mobile || "").trim() || "",
      address: "",
      notes: "",
    });

    return response.data;
  };

  const buildDishPayloadFromItem = (item) => {
    const dishName = item.dish_name?.trim();
    const variantName = item.variant_name?.trim() || "Regular";
    const price = Number(item.unit_price) || Number(item.total) || 0;

    if (!dishName) {
      throw new Error("Dish name is required");
    }

    if (price <= 0) {
      throw new Error("Add a price before saving this dish");
    }

    return {
      dish_name: dishName,
      category: "",
      variants: [
        {
          variant_name: variantName,
          price,
        },
      ],
    };
  };

  const applyCreatedDishToItem = (item, created) => {
    const matchedVariant =
      created.variants?.find(
        (v) =>
          v.variant_name?.toLowerCase() ===
          (item.variant_name?.trim() || "Regular").toLowerCase()
      ) || created.variants?.[0];

    return {
      ...item,
      dish_id: created.dish_id,
      dish_name: created.dish_name || item.dish_name,
      variant_id: matchedVariant?.variant_id || null,
      variant_name: matchedVariant?.variant_name || item.variant_name || "Regular",
      unit_price: Number(matchedVariant?.price ?? item.unit_price),
      total:
        Number(matchedVariant?.price ?? item.unit_price) *
        Number(item.quantity || 1),
      variants: created.variants || [],
      saveNewDish: false,
    };
  };

  const createDishFromItem = async (item) => {
    const response = await addDish(buildDishPayloadFromItem(item));
    return response.data;
  };

  const handleAddCustomerNow = async () => {
    if (!(customer || "").trim() || addingCustomer) return;

    try {
      setAddingCustomer(true);
      const created = await createCustomerFromForm();
      setCustomerId(created.customer_id);
      setSaveNewCustomer(false);
      toast.success(
        "Customer added",
        (mobile || "").trim()
          ? "Name and mobile saved."
          : "Customer saved with name only."
      );
    } catch (error) {
      console.error(error);
      toast.error(
        "Failed",
        error?.response?.data?.message || "Unable to add customer."
      );
    } finally {
      setAddingCustomer(false);
    }
  };

  const handleAddDishNow = async (index) => {
    const item = items[index];
    if (!item || addingDishIndex !== null) return;

    try {
      setAddingDishIndex(index);
      const created = await createDishFromItem(item);
      const nextItems = [...items];
      nextItems[index] = applyCreatedDishToItem(item, created);
      setItems(nextItems);
      toast.success("Dish added", "Dish and variant saved.");
    } catch (error) {
      console.error(error);
      toast.error(
        "Failed",
        error?.message ||
          error?.response?.data?.message ||
          "Unable to add dish."
      );
    } finally {
      setAddingDishIndex(null);
    }
  };

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

    try {
      setSubmitting(true);

      let resolvedCustomerId = customer_id || null;
      let resolvedItems = items.map((item) => ({ ...item }));
      let dishesCreated = false;

      if (
        saveNewCustomer &&
        (customer || "").trim() &&
        !resolvedCustomerId
      ) {
        try {
          const created = await createCustomerFromForm();
          resolvedCustomerId = created.customer_id;
          setCustomerId(created.customer_id);
        } catch (error) {
          console.error(error);
          toast.error(
            "Customer not saved",
            error?.response?.data?.message ||
              "Could not add customer. Order was not created."
          );
          return;
        }
      }

      for (let i = 0; i < resolvedItems.length; i++) {
        const item = resolvedItems[i];
        if (item.dish_id || item.saveNewDish === false) continue;
        if (!item.dish_name?.trim()) continue;

        try {
          const created = await createDishFromItem(item);
          resolvedItems[i] = applyCreatedDishToItem(item, created);
          dishesCreated = true;
        } catch (error) {
          console.error(error);
          toast.error(
            "Dish not saved",
            error?.message ||
              error?.response?.data?.message ||
              `Could not add dish "${item.dish_name}". Order was not created.`
          );
          return;
        }
      }

      if (dishesCreated) {
        setItems(resolvedItems);
      }

      const payload = {
        customer_id: resolvedCustomerId,
        customer_name: (customer || "").trim() || null,
        customer_mobile: (mobile || "").trim() || null,
        delivery_datetime: `${deliveryDate}T${deliveryTime}:00`,
        delivery_charge: Number(deliveryCharge),
        discount: Number(discount),
        other_charges: 0,
        total_amount: Number(grandTotal),
        bill_notes: "",
        items: resolvedItems.map((item) => ({
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
        const response = await updateOrder({
          order_id: editingOrderId,
          ...payload,
        });

        setBillData(response.data);
        setShowBillModal(true);
        setReturnToHistory(true);

        toast.success("Order Updated", "Updated bill is ready.");
        resetOrder();
        setSaveNewCustomer(true);
        return;
      }

      const response = await addOrder(payload);

      setBillData(response.data);
      setShowBillModal(true);

      toast.success("Order Created", "Bill generated successfully.");
      resetOrder();
      setSaveNewCustomer(true);
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

  const handleBack = () => {
    if (isEditing) {
      resetOrder();
      navigate("/history");
      return;
    }
    navigate("/orders");
  };

  return (
    <div className="max-w-md mx-auto h-[calc(100dvh-4rem)] -mb-20 overflow-hidden bg-gray-50 flex flex-col">
      <header className="shrink-0 relative bg-gradient-to-br from-orange-500 to-orange-600 px-4 pt-safe pb-5 rounded-b-[1.5rem] shadow-[0_8px_24px_-8px_rgba(249,115,22,0.5)] overflow-hidden">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-start gap-2.5">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back"
            className="press-scale mt-1 w-9 h-9 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center text-white"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="min-w-0">
            <p className="text-orange-100 text-[10px] font-semibold tracking-[0.12em] uppercase">
              Arefa's Kitchen
            </p>
            <h1 className="text-[1.35rem] font-bold text-white leading-tight mt-0.5 tracking-tight">
              {isEditing ? "Edit Order" : "New Order"}
            </h1>
            <p className="text-orange-100/90 text-[12px] mt-0.5 truncate">
              {isEditing ? "Update delivery & items" : "Standard order billing"}
            </p>
          </div>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-none px-3.5 pt-3 pb-28 space-y-3"
      >
        {/* Customer */}
        <section className="space-y-1.5">
          <SectionLabel icon={User}>Customer</SectionLabel>

          <div className="bg-white rounded-xl border border-gray-100 p-2.5 space-y-2">
            <CustomerSearch
              value={customer}
              onChange={(value) => {
                setCustomer(value);
                setCustomerId(null);
                setSaveNewCustomer(true);
              }}
              onSelect={(selected) => {
                setCustomer(selected.name);
                setCustomerId(selected.customer_id);
                setMobile(selected.mobile || "");
                setSaveNewCustomer(false);
              }}
            />

            <div className="relative">
              <Phone
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="tel"
                inputMode="numeric"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Mobile (optional)"
                className={`${fieldClass} pl-9 pr-3`}
              />
            </div>

            {isNewCustomerCandidate && (
              <div className="rounded-xl border border-orange-100 bg-orange-50/70 p-2 space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveNewCustomer}
                    onChange={(e) => setSaveNewCustomer(e.target.checked)}
                    className="mt-0.5 accent-orange-500"
                  />
                  <span className="text-[12px] font-medium text-gray-700 leading-snug">
                    Save as new customer when creating bill
                    {!(mobile || "").trim() && (
                      <span className="block text-[11px] font-normal text-gray-500">
                        Name only — add mobile above to save it too
                      </span>
                    )}
                  </span>
                </label>

                <button
                  type="button"
                  disabled={addingCustomer}
                  onClick={handleAddCustomerNow}
                  className="press-scale w-full h-9 rounded-xl text-[12.5px] font-semibold text-orange-700 bg-white border border-orange-200 flex items-center justify-center gap-1.5 active:bg-orange-50 disabled:opacity-60"
                >
                  {addingCustomer ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Adding…
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      Add new customer now
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Delivery */}
        <section className="space-y-1.5">
          <SectionLabel icon={CalendarDays}>Delivery</SectionLabel>

          <div className="bg-white rounded-xl border border-gray-100 p-2.5 space-y-2">
            <label className="block">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Date
              </span>
              <DateInput
                value={deliveryDate}
                onChange={setDeliveryDate}
                placeholder="Select delivery date"
                className="mt-1"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Time
              </span>
              <div className="relative mt-1">
                <Clock
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <select
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className={`${fieldClass} pl-8 pr-2 appearance-none`}
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
        </section>

        {/* Items */}
        <section className="space-y-1.5">
          <SectionLabel
            icon={ShoppingBag}
            badge={
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            }
          >
            Items
          </SectionLabel>

          {items.length === 0 ? (
            <button
              type="button"
              onClick={handleAddItem}
              className="press-scale w-full border border-dashed border-orange-300 bg-orange-50/70 rounded-xl py-4 text-orange-600 flex flex-col items-center justify-center gap-1.5 active:bg-orange-100/70 transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center">
                <Plus size={16} strokeWidth={2.5} />
              </span>
              <span className="text-[13px] font-semibold">Add first item</span>
              <span className="text-[11px] font-medium text-orange-500/80">
                Tap to start this order
              </span>
            </button>
          ) : (
            <>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <OrderItemCard
                    key={index}
                    item={item}
                    index={index}
                    onChange={handleItemChange}
                    onDelete={handleDeleteItem}
                    onAddDishNow={handleAddDishNow}
                    addingDish={addingDishIndex === index}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="press-scale w-full border border-dashed border-orange-300 bg-orange-50/60 rounded-xl py-2.5 text-[13px] text-orange-600 font-semibold flex items-center justify-center gap-1.5 active:bg-orange-100/60 transition-colors"
              >
                <Plus size={15} strokeWidth={2.5} />
                Add Item
              </button>
            </>
          )}
        </section>

        {/* Charges */}
        <section className="space-y-1.5">
          <h2 className="text-[12px] font-bold text-gray-700 tracking-wide px-0.5">
            Charges
          </h2>

          <div className="bg-white rounded-xl border border-gray-100 p-2.5 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Delivery
                </span>
                <div className="relative mt-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">
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
                    className={`${fieldClass} pl-6 pr-2`}
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Discount
                </span>
                <div className="relative mt-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    placeholder="0"
                    value={discount || ""}
                    onChange={(e) => setCharges("discount", e.target.value)}
                    className={`${fieldClass} pl-6 pr-2`}
                  />
                </div>
              </label>
            </div>

            {items.length > 0 && (
              <div className="pt-2 border-t border-dashed border-gray-200 space-y-1 text-[12px]">
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

      {/* Sticky action bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 pointer-events-none">
        <div className="max-w-md mx-auto px-3.5 pb-2 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-3 py-2.5 flex items-center gap-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Grand Total
              </p>
              <p className="text-[1.25rem] font-extrabold text-orange-500 leading-tight truncate">
                ₹{Number(grandTotal).toFixed(2)}
              </p>
            </div>

            <button
              type="button"
              onClick={handlePreview}
              disabled={!canFinalize}
              className={`press-scale shrink-0 min-w-[8.2rem] h-10 rounded-xl px-4 text-[13px] font-semibold text-white flex items-center justify-center gap-1.5 transition-colors ${
                canFinalize
                  ? "bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/25"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving
                </>
              ) : isEditing ? (
                "Update"
              ) : (
                "Finalize"
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

          if (returnToHistory) {
            setReturnToHistory(false);
            navigate("/history");
          }
        }}
      />
    </div>
  );
};

export default Orders;
