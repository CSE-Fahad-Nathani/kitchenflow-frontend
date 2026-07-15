import { Pencil, Trash2 } from "lucide-react";

const DishCard = ({ dish, onEdit, onDelete }) => {
  const variantText =
    dish.variants?.length > 0
      ? dish.variants
          .map((v) => `${v.variant_name} ₹${v.price}`)
          .join(" · ")
      : "No variants";

  return (
    <div className="bg-white rounded-xl border border-gray-100 px-3 py-2 flex items-center gap-2.5">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5 min-w-0">
          <h2 className="font-semibold text-[13.5px] text-gray-900 truncate leading-tight">
            {dish.dish_name}
          </h2>
          {dish.category && (
            <span className="text-[11px] text-gray-400 shrink-0">
              {dish.category}
            </span>
          )}
        </div>
        <p className="text-[11.5px] text-gray-500 mt-0.5 truncate">
          {variantText}
        </p>
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
