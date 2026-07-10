import { useEffect, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { searchDishes } from "../api/dishApi";

const OrderItemCard = ({ item, index, onChange, onDelete }) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!item.dish_name.trim()) {
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
      updated.total =
        Number(updated.quantity) * Number(updated.unit_price);
    }
  
    if (field === "total") {
      updated.unit_price =
        Number(value) / Number(updated.quantity || 1);
    }
  
    onChange(index, updated);
  };

  return (
    <div className="bg-white rounded-xl border p-4 space-y-3">

      <div className="relative">

        <input
          placeholder="Dish Name"
          value={item.dish_name}
          onChange={(e) =>
            updateField("dish_name", e.target.value)
          }
          className="w-full border rounded-lg p-3"
        />

        {suggestions.length > 0 && (
          <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-56 overflow-y-auto">

            {suggestions.map((dish) => (
              <button
                key={dish.dish_id}
                type="button"
                onClick={() => {
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
                className="w-full text-left p-3 hover:bg-orange-50"
              >
                {dish.dish_name}
              </button>
            ))}

          </div>
        )}

      </div>

      <input
        list={`variants-${index}`}
        placeholder="Variant"
        value={item.variant_name}
        onChange={(e) => {
          const variant = (item.variants || []).find(
            (v) => v.variant_name === e.target.value
          );

          if (variant) {
            onChange(index, {
              ...item,
              variant_id: variant.variant_id,
              variant_name: variant.variant_name,
              unit_price: Number(variant.price),
              total:
                Number(variant.price) * Number(item.quantity),
              variants: item.variants,
            });
          } else {
            updateField("variant_name", e.target.value);
          }
        }}
        className="w-full border rounded-lg p-3"
      />

      <datalist id={`variants-${index}`}>
        {(item.variants || []).map((variant) => (
          <option
            key={variant.variant_id}
            value={variant.variant_name}
          />
        ))}
      </datalist>

      <div className="grid grid-cols-3 gap-3">

        <div>

          <label className="text-xs">Qty</label>

          <div className="flex items-center border rounded-lg">

            <button
              onClick={() =>
                updateField(
                  "quantity",
                  Math.max(1, Number(item.quantity) - 1)
                )
              }
              className="p-2"
            >
              <Minus size={16} />
            </button>

            <input
              value={item.quantity}
              onChange={(e) =>
                updateField(
                  "quantity",
                  Number(e.target.value)
                )
              }
              className="w-full text-center outline-none"
            />

            <button
              onClick={() =>
                updateField(
                  "quantity",
                  Number(item.quantity) + 1
                )
              }
              className="p-2"
            >
              <Plus size={16} />
            </button>

          </div>

        </div>

        <div>

          <label className="text-xs">Price</label>

          <input
            value={item.unit_price}
            onChange={(e) =>
              updateField(
                "unit_price",
                Number(e.target.value)
              )
            }
            className="w-full border rounded-lg p-2"
          />

        </div>

        <div>

          <label className="text-xs">Total</label>

          <input
            value={item.total}
            onChange={(e) =>
                updateField("total", Number(e.target.value))
            }
            className="w-full border rounded-lg p-2"
            />

        </div>

      </div>

      <button
        onClick={() => onDelete(index)}
        className="flex items-center gap-2 text-red-500"
      >
        <Trash2 size={16} />
        Delete Item
      </button>

    </div>
  );
}
export default OrderItemCard;