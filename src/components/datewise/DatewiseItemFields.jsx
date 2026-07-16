import { useEffect, useRef, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { searchDishes } from "../../api/dishApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

const itemFieldClass =
  "w-full h-8 bg-gray-50 border border-gray-200 rounded-lg px-2 text-[12.5px] outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/**
 * Date-wise item fields with dish search suggestions.
 * Selecting a dish fills variants + price (editable). No save-to-DB.
 */
const DatewiseItemFields = ({ item, onChange, onRemove }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const lastSelectedRef = useRef("");
  const requestIdRef = useRef(0);

  const debouncedDishName = useDebouncedValue(item.dish_name || "", 350);
  const variants = item.variants || [];

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

    onChange({
      dish_name: dish.dish_name,
      variants: dish.variants || [],
      variant_name: first?.variant_name || "",
      price: first ? String(Number(first.price) || "") : item.price,
    });
    setSuggestions([]);
  };

  const selectVariant = (variant) => {
    onChange({
      variant_name: variant.variant_name || "",
      price: String(Number(variant.price) || ""),
    });
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-2 space-y-1.5">
      <div className="flex gap-1.5">
        <div className="relative flex-1 min-w-0">
          <input
            value={item.dish_name}
            onChange={(e) => {
              lastSelectedRef.current = "";
              onChange({
                dish_name: e.target.value,
                variants: [],
                variant_name: item.variant_name,
              });
            }}
            placeholder="Dish name"
            autoComplete="off"
            className={`${itemFieldClass} font-medium ${
              searching ? "pr-7" : ""
            }`}
          />

          {searching && (
            <Loader2
              size={12}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-400 animate-spin"
            />
          )}

          {suggestions.length > 0 && !searching && (
            <div className="animate-dropdown absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-30 max-h-36 overflow-y-auto scrollbar-none">
              {suggestions.map((dish) => (
                <button
                  key={dish.dish_id}
                  type="button"
                  onClick={() => selectDish(dish)}
                  className="w-full text-left px-2.5 py-2 text-[12.5px] font-medium text-gray-700 active:bg-orange-50 border-b border-gray-50 last:border-0"
                >
                  {dish.dish_name}
                  {dish.variants?.length > 0 && (
                    <span className="block text-[10.5px] font-normal text-gray-400 mt-0.5">
                      {dish.variants.length} variant
                      {dish.variants.length === 1 ? "" : "s"}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          aria-label="Delete item"
          className="press-scale w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center shrink-0"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {variants.length > 0 && (
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {variants.map((variant) => {
            const selected =
              item.variant_name === variant.variant_name;

            return (
              <button
                key={variant.variant_id || variant.variant_name}
                type="button"
                onClick={() => selectVariant(variant)}
                className={`press-scale shrink-0 px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  selected
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-700 border border-gray-200"
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

      <div className="grid grid-cols-[1fr_72px_88px] gap-1.5">
        <input
          value={item.variant_name}
          onChange={(e) => {
            const value = e.target.value;
            const matched = variants.find((v) => v.variant_name === value);
            if (matched) {
              selectVariant(matched);
              return;
            }
            onChange({ variant_name: value });
          }}
          placeholder="Variant (opt.)"
          className={itemFieldClass}
        />
        <input
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          value={item.quantity}
          onChange={(e) => onChange({ quantity: e.target.value })}
          placeholder="Qty"
          className={itemFieldClass}
        />
        <input
          type="number"
          inputMode="decimal"
          min="0"
          value={item.price}
          onChange={(e) => onChange({ price: e.target.value })}
          placeholder="Rate"
          className={itemFieldClass}
        />
      </div>

      {(Number(item.quantity) > 0 || Number(item.price) > 0) && (
        <p className="text-[11px] text-gray-500 text-right">
          {Number(item.quantity) || 0} × {money(item.price)} ={" "}
          <span className="font-semibold text-gray-800">
            {money(
              (Number(item.quantity) || 0) * (Number(item.price) || 0)
            )}
          </span>
        </p>
      )}

      <input
        value={item.note}
        onChange={(e) => onChange({ note: e.target.value })}
        placeholder="Item note (optional)"
        className={itemFieldClass}
      />
    </div>
  );
};

export default DatewiseItemFields;
