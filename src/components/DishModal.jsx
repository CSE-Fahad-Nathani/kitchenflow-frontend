import { useEffect, useState } from "react";

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
        dish_name: dish.dish_name,
        category: dish.category,
        variants: dish.variants.map((variant) => ({
          variant_name: variant.variant_name,
          price: variant.price,
        })),
      });
    } else {
      setForm(initialState);
    }
  }, [dish, open]);

  if (!open) return null;

  const updateVariant = (index, field, value) => {
    const variants = [...form.variants];
    variants[index][field] = value;

    setForm({
      ...form,
      variants,
    });
  };

  const addVariant = () => {
    setForm({
      ...form,
      variants: [
        ...form.variants,
        {
          variant_name: "",
          price: "",
        },
      ],
    });
  };

  const removeVariant = (index) => {
    if (form.variants.length === 1) return;

    setForm({
      ...form,
      variants: form.variants.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end">

<div className="bg-white w-full rounded-t-3xl p-5 pb-28 max-h-[90vh] overflow-y-auto">

        <h2 className="text-xl font-bold mb-4">
          {dish ? "Edit Dish" : "Add Dish"}
        </h2>

        <div className="space-y-3">

          <input
            placeholder="Dish Name"
            value={form.dish_name}
            onChange={(e) =>
              setForm({
                ...form,
                dish_name: e.target.value,
              })
            }
            className="w-full border rounded-xl p-3"
          />

          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
            className="w-full border rounded-xl p-3"
          />

          <div className="space-y-3">

            {form.variants.map((variant, index) => (
              <div
                key={index}
                className="border rounded-xl p-3 space-y-2"
              >
                <input
                  placeholder="Variant Name"
                  value={variant.variant_name}
                  onChange={(e) =>
                    updateVariant(
                      index,
                      "variant_name",
                      e.target.value
                    )
                  }
                  className="w-full border rounded-lg p-2"
                />

                <input
                  type="number"
                  placeholder="Price"
                  value={variant.price}
                  onChange={(e) =>
                    updateVariant(
                      index,
                      "price",
                      e.target.value
                    )
                  }
                  className="w-full border rounded-lg p-2"
                />

                <button
                  onClick={() => removeVariant(index)}
                  className="text-red-500 text-sm"
                >
                  Remove Variant
                </button>
              </div>
            ))}

          </div>

          <button
            onClick={addVariant}
            className="w-full border-2 border-dashed border-orange-500 rounded-xl py-3 text-orange-500"
          >
            + Add Variant
          </button>

          <div className="flex gap-3">

            <button
              onClick={onClose}
              className="flex-1 border rounded-xl py-3"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              onClick={() => onSave(form)}
              className="flex-1 bg-orange-500 text-white rounded-xl py-3"
            >
              {loading
                ? "Saving..."
                : dish
                ? "Update"
                : "Save"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default DishModal;