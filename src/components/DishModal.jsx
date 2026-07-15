import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";

const initialState = {
  dish_name: "",
  category: "",
  variants: [
    {
      variant_name: "",
      price: "",
    },
  ],
};

const fieldClass =
  "w-full h-9 bg-gray-50 border border-gray-200 rounded-xl px-3 text-[13px] font-medium outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all";

const DishModal = ({
  open,
  onClose,
  onSave,
  loading = false,
  dish = null,
}) => {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (dish) {
      setForm({
        dish_name: dish.dish_name || "",
        category: dish.category || "",
        variants:
          dish.variants?.length > 0
            ? dish.variants.map((variant) => ({
                variant_name: variant.variant_name || "",
                price: variant.price ?? "",
              }))
            : [{ variant_name: "", price: "" }],
      });
    } else {
      setForm(initialState);
    }
  }, [dish, open]);

  if (!open) return null;

  const updateVariant = (index, field, value) => {
    setForm((prev) => {
      const variants = [...prev.variants];
      variants[index] = {
        ...variants[index],
        [field]: value,
      };
      return { ...prev, variants };
    });
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { variant_name: "", price: "" }],
    }));
  };

  const removeVariant = (index) => {
    setForm((prev) => {
      if (prev.variants.length === 1) return prev;
      return {
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index),
      };
    });
  };

  const canSave =
    form.dish_name.trim() &&
    form.variants.every(
      (v) => v.variant_name.trim() && String(v.price).trim() !== ""
    );

  const handleSubmit = () => {
    if (!canSave || loading) return;
    onSave(form);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px] flex items-end"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md mx-auto bg-white rounded-t-3xl max-h-[85dvh] overflow-hidden animate-slide-up shadow-[0_-8px_40px_rgba(0,0,0,0.15)] flex flex-col"
      >
        <div className="shrink-0 px-4 pt-2.5 pb-3 border-b border-gray-100">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />

          <div className="flex justify-between items-center gap-3">
            <div>
              <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-[0.12em]">
                Dishes
              </p>
              <h2 className="text-[15px] font-bold text-gray-900 mt-0.5">
                {dish ? "Edit Dish" : "Add Dish"}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="press-scale w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 active:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-3.5 py-3 space-y-2.5">
          <label className="block">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Dish name
            </span>
            <input
              placeholder="Dish name"
              value={form.dish_name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, dish_name: e.target.value }))
              }
              className={`${fieldClass} mt-1`}
              autoFocus
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Category{" "}
              <span className="normal-case tracking-normal font-medium">
                (optional)
              </span>
            </span>
            <input
              placeholder="Category"
              value={form.category}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, category: e.target.value }))
              }
              className={`${fieldClass} mt-1`}
            />
          </label>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Variants
              </span>
              <span className="text-[10px] font-semibold text-orange-500">
                {form.variants.length}
              </span>
            </div>

            <div className="space-y-1.5">
              {form.variants.map((variant, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5"
                >
                  <input
                    placeholder="Variant"
                    value={variant.variant_name}
                    onChange={(e) =>
                      updateVariant(index, "variant_name", e.target.value)
                    }
                    className={`${fieldClass} flex-1 min-w-0`}
                  />
                  <div className="relative w-[5.5rem] shrink-0">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      placeholder="0"
                      value={variant.price}
                      onChange={(e) =>
                        updateVariant(index, "price", e.target.value)
                      }
                      className={`${fieldClass} pl-6`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    disabled={form.variants.length === 1}
                    aria-label="Remove variant"
                    className="press-scale w-9 h-9 shrink-0 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addVariant}
              className="press-scale mt-1.5 w-full h-9 border border-dashed border-orange-300 bg-orange-50/60 rounded-xl text-[12.5px] text-orange-600 font-semibold flex items-center justify-center gap-1 active:bg-orange-100/60"
            >
              <Plus size={14} strokeWidth={2.5} />
              Add Variant
            </button>
          </div>
        </div>

        <div className="shrink-0 border-t border-gray-100 bg-white p-2.5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="press-scale flex-1 h-10 rounded-xl border border-gray-200 bg-gray-50 text-[13px] font-semibold text-gray-700 active:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading || !canSave}
            onClick={handleSubmit}
            className="press-scale flex-1 h-10 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/25 disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving
              </>
            ) : dish ? (
              "Update"
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishModal;
