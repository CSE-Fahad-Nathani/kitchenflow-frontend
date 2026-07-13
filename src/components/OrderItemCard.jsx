import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { searchDishes } from "../api/dishApi";

const inputClass =
  "w-full h-10 bg-gray-50 border border-gray-200 rounded-lg px-2.5 text-sm outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all";

const OrderItemCard = ({ item, index, onChange, onDelete }) => {
  const [suggestions, setSuggestions] = useState([]);
  const skipSearchRef = useRef(false);

  useEffect(() => {
    if (!item.dish_name.trim()) {
      setSuggestions([]);
      return;
    }

    // Skip search right after a suggestion was selected
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await searchDishes(item.dish_name);
        setSuggestions(data);
      } catch (error) {
        console.error(error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [item.dish_name]);

  const updateField = (field, value) => {
    const updated = {
      ...item,
      [field]: value,
    };

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
    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-3 space-y-2">
      {/* Item index badge + Dish + delete */}
      <div className="flex gap-1.5 items-center">
        <div className="shrink-0 w-6 h-6 rounded-md bg-orange-50 border border-orange-100 flex items-center justify-center">
          <span className="text-[11px] font-bold text-orange-500">
            {index + 1}
          </span>
        </div>

        <div className="relative flex-1 min-w-0">
          <input
            placeholder="Dish name"
            value={item.dish_name}
            onChange={(e) => updateField("dish_name", e.target.value)}
            className={`${inputClass} font-medium`}
          />

          {suggestions.length > 0 && (
            <div className="animate-dropdown absolute left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-20 max-h-40 overflow-y-auto scrollbar-none">
              {suggestions.map((dish) => (
                <button
                  key={dish.dish_id}
                  type="button"
                  onClick={() => {
                    skipSearchRef.current = true;
                    onChange(index, {
                      ...item,
                      dish_id: dish.dish_id,
                      dish_name: dish.dish_name,
                      variant_name: "",
                      variant_id: null,
                      unit_price: 0,
                      total: 0,
                      variants: dish.variants,
                    });
                    setSuggestions([]);
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 active:bg-orange-50 border-b border-gray-50 last:border-0 transition-colors"
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
          className="press-scale w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-red-500 bg-red-50/60 active:bg-red-100 border border-red-100/70 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Compact variant row: chips + editable field */}
      <div className="space-y-1.5">
        {variants.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-0.5 px-0.5">
            {variants.map((variant) => {
              const selected =
                item.variant_id === variant.variant_id ||
                item.variant_name === variant.variant_name;

              return (
                <button
                  key={variant.variant_id}
                  type="button"
                  onClick={() => selectVariant(variant)}
                  className={`press-scale shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selected
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm shadow-orange-500/30"
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

      {/* Qty · Price · Total — single compact row */}
      <div className="grid grid-cols-[auto_1fr_1fr] gap-1.5">
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg h-10">
          <button
            type="button"
            onClick={() =>
              updateField("quantity", Math.max(1, Number(item.quantity) - 1))
            }
            className="press-scale w-8 h-full flex items-center justify-center text-gray-600 active:text-orange-600"
            aria-label="Decrease quantity"
          >
            <Minus size={13} strokeWidth={2.5} />
          </button>

          <input
            type="number"
            inputMode="numeric"
            min="1"
            value={item.quantity}
            onChange={(e) =>
              updateField("quantity", Number(e.target.value) || 1)
            }
            className="w-7 text-center bg-transparent outline-none text-sm font-bold"
          />

          <button
            type="button"
            onClick={() => updateField("quantity", Number(item.quantity) + 1)}
            className="press-scale w-8 h-full flex items-center justify-center text-gray-600 active:text-orange-600"
            aria-label="Increase quantity"
          >
            <Plus size={13} strokeWidth={2.5} />
          </button>
        </div>

        <div className="relative min-w-0">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">
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
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-orange-400 text-xs font-bold">
            ₹
          </span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            placeholder="Total"
            value={item.total || ""}
            onChange={(e) => updateField("total", Number(e.target.value) || 0)}
            className="w-full h-10 bg-orange-50 border border-orange-200 rounded-lg pl-5 pr-2 text-sm font-bold text-orange-600 outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export default OrderItemCard;