import { useEffect, useRef, useState } from "react";
import { Loader2, Minus, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { searchDishes } from "../api/dishApi";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

const inputClass =
  "w-full h-8 bg-gray-50 border border-gray-200 rounded-lg px-2 text-[12.5px] outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all";

const OrderItemCard = ({
  item,
  index,
  onChange,
  onDelete,
  onAddDishNow,
  addingDish = false,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const lastSelectedRef = useRef("");
  const requestIdRef = useRef(0);

  const debouncedDishName = useDebouncedValue(item.dish_name, 350);
  const isNewDishCandidate = Boolean(item.dish_name?.trim() && !item.dish_id);

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
        setSuggestions(data);
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

  const updateField = (field, value) => {
    if (field === "dish_name") {
      lastSelectedRef.current = "";
    }

    const updated = {
      ...item,
      [field]: value,
    };

    if (field === "dish_name") {
      updated.dish_id = null;
      updated.variant_id = null;
      updated.variants = [];
      updated.saveNewDish = true;
    }

    if (field === "quantity" || field === "unit_price") {
      updated.total = Number(updated.quantity) * Number(updated.unit_price);
    }

    if (field === "total") {
      updated.unit_price = Number(value) / Number(updated.quantity || 1);
    }

    onChange(index, updated);
  };

  const selectVariant = (variant) => {
    onChange(index, {
      ...item,
      variant_id: variant.variant_id,
      variant_name: variant.variant_name,
      unit_price: Number(variant.price),
      total: Number(variant.price) * Number(item.quantity),
      variants: item.variants,
    });
  };

  const variants = item.variants || [];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-2 space-y-1.5">
      <div className="flex gap-1.5 items-center">
        <div className="shrink-0 w-5 h-5 rounded-md bg-orange-50 border border-orange-100 flex items-center justify-center">
          <span className="text-[10px] font-bold text-orange-500">
            {index + 1}
          </span>
        </div>

        <div className="relative flex-1 min-w-0">
          <input
            placeholder="Dish name"
            value={item.dish_name}
            onChange={(e) => updateField("dish_name", e.target.value)}
            className={`${inputClass} font-medium ${searching ? "pr-7" : ""}`}
          />

          {searching && (
            <Loader2
              size={12}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-400 animate-spin"
            />
          )}

          {suggestions.length > 0 && !searching && (
            <div className="animate-dropdown absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-20 max-h-36 overflow-y-auto scrollbar-none">
              {suggestions.map((dish) => (
                <button
                  key={dish.dish_id}
                  type="button"
                  onClick={() => {
                    lastSelectedRef.current = dish.dish_name;
                    onChange(index, {
                      ...item,
                      dish_id: dish.dish_id,
                      dish_name: dish.dish_name,
                      variant_name: "",
                      variant_id: null,
                      unit_price: 0,
                      total: 0,
                      variants: dish.variants,
                      saveNewDish: false,
                    });
                    setSuggestions([]);
                  }}
                  className="w-full text-left px-2.5 py-2 text-[12.5px] font-medium text-gray-700 active:bg-orange-50 border-b border-gray-50 last:border-0"
                >
                  {dish.dish_name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDelete(index)}
          aria-label="Delete item"
          className="press-scale w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-red-500 bg-red-50/60 active:bg-red-100 border border-red-100/70"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="space-y-1.5">
        {variants.length > 0 && (
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {variants.map((variant) => {
              const selected =
                item.variant_id === variant.variant_id ||
                item.variant_name === variant.variant_name;

              return (
                <button
                  key={variant.variant_id}
                  type="button"
                  onClick={() => selectVariant(variant)}
                  className={`press-scale shrink-0 px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    selected
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {variant.variant_name}
                  <span className={selected ? "text-orange-100" : "text-gray-400"}>
                    {" "}
                    ₹{variant.price}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <input
          list={`variants-${index}`}
          placeholder="Variant"
          value={item.variant_name}
          onChange={(e) => {
            const value = e.target.value;
            const matched = variants.find((v) => v.variant_name === value);

            if (matched) {
              selectVariant(matched);
              return;
            }

            onChange(index, {
              ...item,
              variant_id: null,
              variant_name: value,
            });
          }}
          className={inputClass}
        />

        <datalist id={`variants-${index}`}>
          {variants.map((variant) => (
            <option key={variant.variant_id} value={variant.variant_name} />
          ))}
        </datalist>
      </div>

      <div className="grid grid-cols-[auto_1fr_1fr] gap-1.5">
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg h-8">
          <button
            type="button"
            onClick={() =>
              updateField("quantity", Math.max(1, Number(item.quantity) - 1))
            }
            className="press-scale w-7 h-full flex items-center justify-center text-gray-600"
            aria-label="Decrease quantity"
          >
            <Minus size={12} strokeWidth={2.5} />
          </button>

          <input
            type="number"
            inputMode="numeric"
            min="1"
            value={item.quantity}
            onChange={(e) =>
              updateField("quantity", Number(e.target.value) || 1)
            }
            className="w-6 text-center bg-transparent outline-none text-[12.5px] font-bold"
          />

          <button
            type="button"
            onClick={() => updateField("quantity", Number(item.quantity) + 1)}
            className="press-scale w-7 h-full flex items-center justify-center text-gray-600"
            aria-label="Increase quantity"
          >
            <Plus size={12} strokeWidth={2.5} />
          </button>
        </div>

        <div className="relative min-w-0">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]">
            ₹
          </span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            placeholder="Price"
            value={item.unit_price || ""}
            onChange={(e) =>
              updateField("unit_price", Number(e.target.value) || 0)
            }
            className={`${inputClass} pl-5`}
          />
        </div>

        <div className="relative min-w-0">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-orange-400 text-[11px] font-bold">
            ₹
          </span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            placeholder="Total"
            value={item.total || ""}
            onChange={(e) => updateField("total", Number(e.target.value) || 0)}
            className="w-full h-8 bg-orange-50 border border-orange-200 rounded-lg pl-5 pr-2 text-[12.5px] font-bold text-orange-600 outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>
      </div>

      {isNewDishCandidate && (
        <div className="rounded-lg border border-orange-100 bg-orange-50/70 p-2 space-y-1.5">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={item.saveNewDish !== false}
              onChange={(e) =>
                onChange(index, {
                  ...item,
                  saveNewDish: e.target.checked,
                })
              }
              className="mt-0.5 accent-orange-500"
            />
            <span className="text-[11.5px] font-medium text-gray-700 leading-snug">
              Save as new dish when creating bill
              <span className="block text-[10.5px] font-normal text-gray-500">
                Needs variant + price
              </span>
            </span>
          </label>

          <button
            type="button"
            disabled={addingDish}
            onClick={() => onAddDishNow?.(index)}
            className="press-scale w-full h-8 rounded-lg text-[11.5px] font-semibold text-orange-700 bg-white border border-orange-200 flex items-center justify-center gap-1 active:bg-orange-50 disabled:opacity-60"
          >
            {addingDish ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <UtensilsCrossed size={13} />
                Add dish now
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderItemCard;
