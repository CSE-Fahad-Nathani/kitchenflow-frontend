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
import DateMultiSelectCalendar from "./DateMultiSelectCalendar";
import DishNameSuggest from "./DishNameSuggest";
import { groupDatesByMonth } from "../../utils/calendarBillCalc";

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

const QtyStepper = ({ value, onChange }) => (
  <div className="flex items-center gap-1.5">
    <button
      type="button"
      onClick={() => onChange(Math.max(1, (Number(value) || 1) - 1))}
      className="press-scale w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 flex items-center justify-center"
      aria-label="Decrease quantity"
    >
      <Minus size={14} />
    </button>
    <input
      type="number"
      inputMode="decimal"
      min="1"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-12 h-8 text-center bg-gray-50 border border-gray-200 rounded-lg text-[13px] font-semibold outline-none focus:border-orange-400"
    />
    <button
      type="button"
      onClick={() => onChange((Number(value) || 1) + 1)}
      className="press-scale w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 flex items-center justify-center"
      aria-label="Increase quantity"
    >
      <Plus size={14} />
    </button>
  </div>
);

const CreateCalendarBillView = ({
  customer,
  onCustomerChange,
  dishes,
  onAddDish,
  onUpdateDish,
  onRemoveDish,
  calc,
  showDates,
  onShowDatesChange,
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
                  {!(customer.customer_mobile || "").trim() && (
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
        <SectionLabel icon={UtensilsCrossed}>
          Dishes ({dishes.length})
        </SectionLabel>

        {dishes.length === 0 ? (
          <button
            type="button"
            onClick={onAddDish}
            className="press-scale w-full rounded-2xl border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-6 text-center"
          >
            <p className="text-[14px] font-bold text-orange-700">Add first dish</p>
            <p className="text-[11.5px] text-orange-600/80 mt-0.5">
              Then pick its dates on the calendar
            </p>
          </button>
        ) : (
          <div className="space-y-3">
            {dishes.map((dish, dishIndex) => {
              const summary = calc.dishSummaries[dishIndex] || {
                dayCount: 0,
                dayAmount: 0,
                dishTotal: 0,
                dates: [],
              };

              return (
                <div
                  key={dish.localId}
                  className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.03)] overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-white border-b border-orange-100/80">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">
                        {dishIndex + 1}
                      </span>
                      <p className="text-[13px] font-bold text-gray-900 truncate">
                        {dish.dish_name?.trim() || `Dish ${dishIndex + 1}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveDish(dishIndex)}
                      aria-label="Remove dish"
                      className="press-scale w-8 h-8 rounded-lg bg-white border border-rose-100 text-rose-500 flex items-center justify-center shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="p-2.5 space-y-2.5">
                    <label className="block">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Dish name
                      </span>
                      <div className="mt-1">
                        <DishNameSuggest
                          value={dish.dish_name}
                          onChange={(dish_name) =>
                            onUpdateDish(dishIndex, { dish_name })
                          }
                          className={`${fieldClass} px-3`}
                        />
                      </div>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Price / day
                        </span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          value={dish.rate_per_day}
                          onChange={(e) =>
                            onUpdateDish(dishIndex, {
                              rate_per_day: e.target.value,
                            })
                          }
                          placeholder="0"
                          className={`${fieldClass} px-3 mt-1`}
                        />
                      </label>

                      <label className="block">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Delivery / day
                        </span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          value={dish.delivery_charge_per_day}
                          onChange={(e) =>
                            onUpdateDish(dishIndex, {
                              delivery_charge_per_day: e.target.value,
                            })
                          }
                          placeholder="0"
                          className={`${fieldClass} px-3 mt-1`}
                        />
                      </label>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Quantity / day
                      </span>
                      <QtyStepper
                        value={dish.quantity}
                        onChange={(quantity) =>
                          onUpdateDish(dishIndex, { quantity })
                        }
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
                        <CalendarDays size={12} className="text-orange-500" />
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Select dates
                        </span>
                      </div>
                      <DateMultiSelectCalendar
                        selectedDates={dish.dates}
                        overlapDates={calc.overlappingDates}
                        onChange={(dates) =>
                          onUpdateDish(dishIndex, { dates })
                        }
                      />
                    </div>

                    {summary.dates.length > 0 ? (
                      <div className="space-y-1.5">
                        {groupDatesByMonth(summary.dates).map((group) => (
                          <div key={group.key}>
                            <p className="text-[10px] font-bold text-orange-700 px-0.5 mb-1">
                              {group.label}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {group.days.map((day) => {
                                const ymd = `${group.key}-${String(day).padStart(2, "0")}`;
                                const overlap = calc.overlappingDates.has(ymd);
                                return (
                                  <span
                                    key={ymd}
                                    className={`min-w-[1.5rem] text-center text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
                                      overlap
                                        ? "bg-amber-50 text-amber-800 border-amber-200"
                                        : "bg-orange-50 text-orange-700 border-orange-100"
                                    }`}
                                  >
                                    {day}
                                    {overlap ? " ★" : ""}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <div className="rounded-xl bg-gray-50 border border-gray-100 px-2.5 py-2 space-y-1 text-[12px]">
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Per day</span>
                        <span className="font-semibold text-gray-800">
                          {money(summary.dayAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Days</span>
                        <span className="font-semibold text-gray-800">
                          {summary.dayCount}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2 pt-1 border-t border-dashed border-gray-200">
                        <span className="font-bold text-gray-900">Dish total</span>
                        <span className="font-bold text-orange-500">
                          {money(summary.dishTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {dishes.length > 0 ? (
          <button
            type="button"
            onClick={onAddDish}
            className="press-scale w-full h-10 rounded-xl border border-dashed border-orange-300 text-[13px] font-semibold text-orange-600 bg-orange-50/50 flex items-center justify-center gap-1.5"
          >
            <Plus size={15} />
            Add another dish
          </button>
        ) : null}
      </section>

      {dishes.length > 0 ? (
        <section className="space-y-2">
          <SectionLabel icon={CalendarDays}>Bill Summary</SectionLabel>

          <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500">Dishes</span>
              <span className="font-semibold text-gray-800">{calc.dishCount}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500">Total dish-days</span>
              <span className="font-semibold text-gray-800">{calc.totalDays}</span>
            </div>
            {calc.overlappingDates.size > 0 ? (
              <p className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                {calc.overlappingDates.size} date
                {calc.overlappingDates.size === 1 ? "" : "s"} overlap across
                dishes (highlighted amber)
              </p>
            ) : null}

            <label className="flex items-center justify-between gap-3 rounded-xl border border-orange-100 bg-orange-50/60 px-3 py-2.5 cursor-pointer">
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-gray-800">
                  Show dates on bill
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Default on — turn off to hide selected dates
                </p>
              </div>
              <input
                type="checkbox"
                checked={showDates}
                onChange={(e) => onShowDatesChange(e.target.checked)}
                className="accent-orange-500 w-4 h-4 shrink-0"
              />
            </label>

            <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-gray-200">
              <span className="text-[15px] font-bold text-gray-900">
                Grand Total
              </span>
              <span className="text-[18px] font-bold text-orange-500">
                {money(calc.grandTotal)}
              </span>
            </div>
          </div>
        </section>
      ) : null}

      <div className="fixed bottom-16 left-0 right-0 z-40 px-3.5 pb-3 pt-2 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            disabled={submitting || dishes.length === 0}
            onClick={onPreview}
            className="press-scale w-full h-12 rounded-xl text-[14px] font-bold text-white bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/25 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving…
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

export default CreateCalendarBillView;
