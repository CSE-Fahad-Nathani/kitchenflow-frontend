import { Pencil, Trash2 } from "lucide-react";

const DishCard = ({ dish, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-3 py-2.5 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold text-gray-900 truncate">
          {dish.dish_name}
        </p>
        <p className="text-[12px] text-gray-500 mt-0.5 truncate">
          {dish.category || "Uncategorized"}
        </p>

        {dish.variants?.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {dish.variants.map((variant) => (
              <span
                key={variant.variant_id}
                className="text-[10.5px] font-semibold text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded-md"
              >
                {variant.variant_name} · ₹{variant.price}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onEdit(dish)}
          aria-label="Edit dish"
          className="press-scale w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 text-orange-500 flex items-center justify-center active:bg-orange-100"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(dish)}
          aria-label="Delete dish"
          className="press-scale w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center active:bg-rose-100"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default DishCard;
