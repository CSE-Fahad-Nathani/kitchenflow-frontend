import { Pencil, Trash2 } from "lucide-react";

const DishCard = ({ dish, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">

      <div className="flex justify-between items-start">

        <div>

          <h2 className="font-semibold text-lg">
            {dish.dish_name}
          </h2>

          <p className="text-gray-500">
            {dish.category}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">

            {dish.variants.map((variant) => (
              <div
                key={variant.variant_id}
                className="bg-orange-100 text-orange-600 text-sm px-3 py-1 rounded-full"
              >
                {variant.variant_name} • ₹{variant.price}
              </div>
            ))}

          </div>

        </div>

        <div className="flex gap-2">

          <button
            onClick={() => onEdit(dish)}
            className="p-2 rounded-lg bg-orange-100 text-orange-500"
          >
            <Pencil size={18} />
          </button>

          <button
            onClick={() => onDelete(dish)}
            className="p-2 rounded-lg bg-red-100 text-red-500"
          >
            <Trash2 size={18} />
          </button>

        </div>

      </div>

    </div>
  );
};

export default DishCard;