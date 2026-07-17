import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Loader2,
  Minus,
  Phone,
  Plus,
  Trash2,
  User,
  UserPlus,
  UtensilsCrossed,
} from "lucide-react";
import CustomerSearch from "../CustomerSearch";
import DateInput from "../DateInput";
import { searchDishes } from "../../api/dishApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

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

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const CreateMonthlyTiffinView = ({
  form,
  onFormChange,
  excludedDates,
  onAddExcluded,
  onUpdateExcluded,
  onRemoveExcluded,
  calc,
  isNewCustomerCandidate,
  saveNewCustomer,
  setSaveNewCustomer,
  addingCustomer,
  onAddCustomerNow,
  submitting,
  onPreview,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const lastSelectedRef = useRef("");
  const requestIdRef = useRef(0);

  const debouncedDishName = useDebouncedValue(form.dish_name || "", 350);
  const variants = form.variants || [];

  useEffect(() => {
    if (!debouncedDishName.trim()) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    if (debouncedDishName === lastSelectedRef.current) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setSearching(true);

    const fetchData = async () => {
      try {
        const data = await searchDishes(debouncedDishName);
        if (requestId !== requestIdRef.current) return;
        setSuggestions(data || []);
      } catch (error) {
        console.error(error);
        if (requestId !== requestIdRef.current) return;
        setSuggestions([]);
      } finally {
        if (requestId === requestIdRef.current) {
          setSearching(false);
        }
      }
    };

    fetchData();
  }, [debouncedDishName]);

  const selectDish = (dish) => {
    lastSelectedRef.current = dish.dish_name;
    const first = dish.variants?.[0];

    onFormChange({
      dish_name: dish.dish_name,
      variants: dish.variants || [],
      variant_name: first?.variant_name || "",
      rate_per_day: first
        ? String(Number(first.price) || "")
        : form.rate_per_day,
    });
    setSuggestions([]);
  };

  const selectVariant = (variant) => {
    onFormChange({
      variant_name: variant.variant_name || "",
      rate_per_day: String(Number(variant.price) || ""),
    });
  };

  const updateQuantity = (next) => {
    const n = Math.max(1, Number(next) || 1);
    onFormChange({ quantity: String(n) });
  };

  return (
    <div className="px-3.5 pt-3 pb-28 space-y-3">
      <section className="space-y-1.5">
        <SectionLabel icon={User}>Customer</SectionLabel>

        <div className="bg-white rounded-xl border border-gray-100 p-2.5 space-y-2">
          <CustomerSearch
            value={form.customer_name}
            onChange={(value) =>
              onFormChange({
                customer_name: value,
                customer_id: null,
              })
            }
            onSelect={(selected) =>
              onFormChange({
                customer_name: selected.name,
                customer_id: selected.customer_id,
                customer_mobile: selected.mobile || "",
              })
            }
          />

          <div className="relative">
            <Phone
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="tel"
              inputMode="numeric"
              value={form.customer_mobile}
              onChange={(e) =>
                onFormChange({ customer_mobile: e.target.value })
              }
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
                  {!form.customer_mobile.trim() && (
                    <span className="block text-[11px] font-normal text-gray-500">
                      Name only — add mobile above to save it too
                    </span>
                  )}
                </span>
              </label>

              <button
                type="button"
                disabled={addingCustomer}
                onClick={onAddCustomerNow}
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

      <section className="space-y-1.5">
        <SectionLabel icon={CalendarDays}>Date Range</SectionLabel>

        <div className="bg-white rounded-xl border border-gray-100 p-2.5 space-y-2">
          <label className="block">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              From Date
            </span>
            <DateInput
              value={form.from_date}
              onChange={(value) => onFormChange({ from_date: value })}
              placeholder="Select from date"
              className="mt-1"
              max={form.to_date || undefined}
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              To Date
            </span>
            <DateInput
              value={form.to_date}
              onChange={(value) => onFormChange({ to_date: value })}
              placeholder="Select to date"
              className="mt-1"
              min={form.from_date || undefined}
            />
          </label>
        </div>
      </section>

      <section className="space-y-1.5">
        <SectionLabel icon={UtensilsCrossed}>Dish</SectionLabel>

        <div className="bg-white rounded-xl border border-gray-100 p-2.5 space-y-2">
          <div className="relative">
            <input
              value={form.dish_name}
              onChange={(e) => {
                lastSelectedRef.current = "";
                onFormChange({
                  dish_name: e.target.value,
                  variants: [],
                });
              }}
              placeholder="Dish name"
              autoComplete="off"
              className={`${fieldClass} px-3 ${searching ? "pr-9" : ""}`}
            />

            {searching && (
              <Loader2
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 animate-spin"
              />
            )}

            {suggestions.length > 0 && !searching && (
              <div className="animate-dropdown absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-30 max-h-44 overflow-y-auto scrollbar-none">
                {suggestions.map((dish) => (
                  <button
                    key={dish.dish_id}
                    type="button"
                    onClick={() => selectDish(dish)}
                    className="w-full text-left px-3 py-2.5 text-[13px] font-medium text-gray-700 active:bg-orange-50 border-b border-gray-50 last:border-0"
                  >
                    {dish.dish_name}
                    {dish.variants?.length > 0 && (
                      <span className="block text-[11px] font-normal text-gray-400 mt-0.5">
                        {dish.variants.length} variant
                        {dish.variants.length === 1 ? "" : "s"}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {variants.length > 0 && (
            <div className="flex gap-1 overflow-x-auto scrollbar-none">
              {variants.map((variant) => {
                const selected = form.variant_name === variant.variant_name;

                return (
                  <button
                    key={variant.variant_id || variant.variant_name}
                    type="button"
                    onClick={() => selectVariant(variant)}
                    className={`press-scale shrink-0 px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold whitespace-nowrap transition-colors ${
                      selected
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {variant.variant_name}
                    <span
                      className={selected ? "text-orange-100" : "text-gray-400"}
                    >
                      {" "}
                      ₹{variant.price}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <input
            value={form.variant_name}
            onChange={(e) => {
              const value = e.target.value;
              const matched = variants.find((v) => v.variant_name === value);
              if (matched) {
                selectVariant(matched);
                return;
              }
              onFormChange({ variant_name: value });
            }}
            placeholder="Variant (optional)"
            className={`${fieldClass} px-3`}
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Quantity / Day
              </span>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl h-9 mt-1 focus-within:border-orange-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                <button
                  type="button"
                  onClick={() => updateQuantity(Number(form.quantity) - 1)}
                  className="press-scale w-9 h-full flex items-center justify-center text-gray-600"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} strokeWidth={2.5} />
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={form.quantity}
                  onChange={(e) => updateQuantity(e.target.value)}
                  className="w-10 text-center bg-transparent outline-none text-[13px] font-bold"
                  aria-label="Quantity per day"
                />
                <button
                  type="button"
                  onClick={() => updateQuantity(Number(form.quantity) + 1)}
                  className="press-scale w-9 h-full flex items-center justify-center text-gray-600"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </div>
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Rate / Day
              </span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={form.rate_per_day}
                onChange={(e) =>
                  onFormChange({ rate_per_day: e.target.value })
                }
                placeholder="130"
                className={`${fieldClass} px-3 mt-1`}
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Delivery / Day
              </span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={form.delivery_charge}
                onChange={(e) =>
                  onFormChange({ delivery_charge: e.target.value })
                }
                placeholder="0"
                className={`${fieldClass} px-3 mt-1`}
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Discount
              </span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={form.discount}
                onChange={(e) => onFormChange({ discount: e.target.value })}
                placeholder="0"
                className={`${fieldClass} px-3 mt-1`}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-1.5">
        <SectionLabel
          icon={CalendarDays}
          badge={
            <button
              type="button"
              onClick={onAddExcluded}
              className="press-scale h-7 px-2.5 rounded-lg text-[11px] font-semibold text-orange-700 bg-orange-50 border border-orange-100 flex items-center gap-1"
            >
              <Plus size={12} />
              Add Date
            </button>
          }
        >
          Excluded Dates
        </SectionLabel>

        <div className="bg-white rounded-xl border border-gray-100 p-2.5 space-y-2">
          {excludedDates.length === 0 ? (
            <p className="text-[12px] text-gray-400 text-center py-3">
              No excluded dates — add Sundays, holidays, or days off
            </p>
          ) : (
            excludedDates.map((row, index) => (
              <div
                key={row.localId}
                className="rounded-xl border border-gray-100 bg-gray-50/80 p-2 space-y-2"
              >
                <div className="flex items-start gap-2">
                  <DateInput
                    value={row.excluded_date}
                    onChange={(value) =>
                      onUpdateExcluded(index, { excluded_date: value })
                    }
                    placeholder="Select date"
                    className="flex-1"
                    min={form.from_date || undefined}
                    max={form.to_date || undefined}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveExcluded(index)}
                    aria-label="Remove date"
                    className="press-scale w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  value={row.reason}
                  onChange={(e) =>
                    onUpdateExcluded(index, { reason: e.target.value })
                  }
                  placeholder="Reason (optional)"
                  className={`${fieldClass} px-3`}
                />
              </div>
            ))
          )}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-100 p-3 space-y-1.5">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
          Bill Summary
        </p>
        <div className="flex justify-between text-[13px]">
          <span className="text-gray-500">Total Days</span>
          <span className="font-semibold text-gray-900">{calc.totalDays}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-gray-500">Excluded Days</span>
          <span className="font-semibold text-gray-900">{calc.excludedDays}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-gray-500">Billable Days</span>
          <span className="font-semibold text-gray-900">{calc.billableDays}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-gray-500">Qty × Rate</span>
          <span className="font-semibold text-gray-900">
            {calc.quantity} × {money(form.rate_per_day)}
          </span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-semibold text-gray-900">
            {money(calc.subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-gray-500">Delivery</span>
          <span className="font-semibold text-gray-900">
            {calc.billableDays} × {money(calc.deliveryPerDay)} ={" "}
            {money(calc.deliveryCharge)}
          </span>
        </div>
        {calc.discount > 0 && (
          <div className="flex justify-between text-[13px]">
            <span className="text-gray-500">Discount</span>
            <span className="font-semibold text-gray-900">
              -{money(calc.discount)}
            </span>
          </div>
        )}
        <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-gray-200">
          <span className="text-[15px] font-bold text-gray-900">Grand Total</span>
          <span className="text-[18px] font-bold text-orange-500">
            {money(calc.grandTotal)}
          </span>
        </div>
      </section>

      <div className="fixed bottom-16 left-0 right-0 z-40 px-3.5 pb-3 pt-2 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            disabled={submitting}
            onClick={onPreview}
            className="press-scale w-full h-11 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating…
              </>
            ) : (
              "Preview Bill"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateMonthlyTiffinView;
