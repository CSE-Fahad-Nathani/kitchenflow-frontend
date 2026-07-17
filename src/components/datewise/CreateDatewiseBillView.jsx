import {
  CalendarDays,
  CalendarPlus,
  Loader2,
  Phone,
  Plus,
  Trash2,
  User,
  UserPlus,
  UtensilsCrossed,
} from "lucide-react";
import CustomerSearch from "../CustomerSearch";
import DateInput from "../DateInput";
import DatewiseItemFields from "./DatewiseItemFields";

const fieldClass =
  "w-full h-9 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-medium outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all";

const SectionLabel = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-1.5 px-0.5">
    <div className="w-5 h-5 rounded-md bg-orange-50 border border-orange-100 flex items-center justify-center">
      <Icon size={11} className="text-orange-600" strokeWidth={2.5} />
    </div>
    <h2 className="text-[12px] font-bold text-gray-700 tracking-wide">
      {children}
    </h2>
  </div>
);

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const CreateDatewiseBillView = ({
  customer,
  onCustomerChange,
  days,
  onAddDay,
  onUpdateDay,
  onRemoveDay,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  calc,
  isNewCustomerCandidate,
  saveNewCustomer,
  setSaveNewCustomer,
  addingCustomer,
  onAddCustomerNow,
  submitting,
  onPreview,
}) => {
  return (
    <div className="px-3.5 pt-3 pb-28 space-y-3">
      <section className="space-y-1.5">
        <SectionLabel icon={User}>Customer</SectionLabel>

        <div className="bg-white rounded-xl border border-gray-100 p-2.5 space-y-2">
          <CustomerSearch
            value={customer.customer_name}
            onChange={(value) =>
              onCustomerChange({
                customer_name: value,
                customer_id: null,
              })
            }
            onSelect={(selected) =>
              onCustomerChange({
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
              value={customer.customer_mobile}
              onChange={(e) =>
                onCustomerChange({ customer_mobile: e.target.value })
              }
              placeholder="Mobile (optional)"
              className={`${fieldClass} pl-9 pr-3`}
            />
          </div>

          <label className="block">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Discount (optional)
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={customer.discount}
              onChange={(e) => onCustomerChange({ discount: e.target.value })}
              placeholder="0"
              className={`${fieldClass} px-3 mt-1`}
            />
          </label>

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
                  {!customer.customer_mobile.trim() && (
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

      <section className="space-y-2">
        <SectionLabel icon={CalendarDays}>Dates ({days.length})</SectionLabel>

        {days.length === 0 ? (
          <button
            type="button"
            onClick={onAddDay}
            className="press-scale w-full rounded-2xl border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-6 text-center active:scale-[0.99]"
          >
            <div className="mx-auto mb-2 w-11 h-11 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30">
              <CalendarPlus size={20} />
            </div>
            <p className="text-[14px] font-bold text-orange-700">
              Add first date
            </p>
            <p className="text-[11.5px] text-orange-600/80 mt-0.5">
              Start a new day on this bill
            </p>
          </button>
        ) : (
          <div className="space-y-3">
            {days.map((day, dayIndex) => {
              const dayCalc = calc.daySummaries[dayIndex] || {
                itemsTotal: 0,
                dayTotal: 0,
              };

              return (
                <div
                  key={day.localId}
                  className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.03)] overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-white border-b border-orange-100/80">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">
                        {dayIndex + 1}
                      </span>
                      <p className="text-[13px] font-bold text-gray-900 truncate">
                        Date {dayIndex + 1}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveDay(dayIndex)}
                      aria-label="Delete date"
                      className="press-scale w-8 h-8 rounded-lg bg-white border border-rose-100 text-rose-500 flex items-center justify-center shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="p-2.5 space-y-2">
                    <div>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Date
                      </span>
                      <DateInput
                        value={day.bill_date}
                        onChange={(value) =>
                          onUpdateDay(dayIndex, { bill_date: value })
                        }
                        placeholder="Select date"
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Delivery (optional)
                        </span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          value={day.delivery_charge}
                          onChange={(e) =>
                            onUpdateDay(dayIndex, {
                              delivery_charge: e.target.value,
                            })
                          }
                          placeholder="0"
                          className={`${fieldClass} px-3 mt-1`}
                        />
                      </label>
                      <label className="block">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Note (optional)
                        </span>
                        <input
                          value={day.note}
                          onChange={(e) =>
                            onUpdateDay(dayIndex, { note: e.target.value })
                          }
                          placeholder="e.g. Lunch / Dinner"
                          className={`${fieldClass} px-3 mt-1`}
                        />
                      </label>
                    </div>

                    <div className="pt-1">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide px-0.5 mb-1.5">
                        Items on this date
                      </p>

                      {(day.items || []).length === 0 ? (
                        <p className="text-[12px] text-gray-400 text-center py-2">
                          No items yet
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {day.items.map((item, itemIndex) => (
                            <DatewiseItemFields
                              key={item.localId}
                              item={item}
                              onChange={(patch) =>
                                onUpdateItem(dayIndex, itemIndex, patch)
                              }
                              onRemove={() =>
                                onRemoveItem(dayIndex, itemIndex)
                              }
                            />
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => onAddItem(dayIndex)}
                        className="press-scale mt-2 w-full h-11 rounded-xl border border-dashed border-sky-300 bg-sky-50 text-sky-700 flex items-center justify-center gap-2.5 px-3 active:bg-sky-100"
                      >
                        <span className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0">
                          <UtensilsCrossed size={13} strokeWidth={2.5} />
                        </span>
                        <span className="text-left min-w-0 flex-1">
                          <span className="block text-[12.5px] font-bold leading-tight">
                            Add item to this date
                          </span>
                          <span className="block text-[10.5px] font-medium text-sky-600/85 leading-tight">
                            Same day · more dishes
                          </span>
                        </span>
                        <Plus size={16} className="shrink-0 opacity-70" />
                      </button>
                    </div>

                    <div className="flex justify-between text-[12.5px] pt-2 border-t border-dashed border-gray-200">
                      <span className="text-gray-500">
                        Items {money(dayCalc.itemsTotal)}
                        {Number(day.delivery_charge) > 0
                          ? ` + Delivery ${money(day.delivery_charge)}`
                          : ""}
                      </span>
                      <span className="font-bold text-gray-900">
                        {money(dayCalc.dayTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={onAddDay}
              className="press-scale w-full rounded-2xl border-2 border-dashed border-orange-400 bg-gradient-to-br from-orange-500 to-orange-600 text-white px-4 py-3.5 shadow-md shadow-orange-500/25 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center shrink-0">
                  <CalendarPlus size={20} />
                </span>
                <span className="text-left min-w-0 flex-1">
                  <span className="block text-[14px] font-bold leading-tight">
                    Add another date
                  </span>
                  <span className="block text-[11.5px] font-medium text-orange-100 mt-0.5 leading-tight">
                    New day on this bill · date auto-fills next day
                  </span>
                </span>
                <Plus size={18} className="shrink-0 opacity-90" />
              </div>
            </button>
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl border border-gray-100 p-3 space-y-1.5">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
          Bill Summary
        </p>
        <div className="flex justify-between text-[13px]">
          <span className="text-gray-500">Dates subtotal</span>
          <span className="font-semibold text-gray-900">
            {money(calc.daysSubtotal)}
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

export default CreateDatewiseBillView;
