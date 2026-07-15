import { Plus, Loader2 } from "lucide-react";
import SundayDishCard from "./SundayDishCard";
import DateInput from "../DateInput";

const fieldClass =
  "w-full h-9 bg-white border border-gray-200 rounded-xl px-3 text-[13px] font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all";

const CreateSundaySpecialView = ({
  specialDate,
  title,
  items,
  submitting,
  onDateChange,
  onTitleChange,
  onItemChange,
  onAddItem,
  onDeleteItem,
  onPreview,
}) => {
  return (
    <div className="px-3.5 py-3 space-y-2.5 pb-28">
      <div className="bg-white rounded-xl border border-gray-100 p-2.5 space-y-2">
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">
            Special Date
          </label>
          <DateInput
            value={specialDate}
            onChange={onDateChange}
            placeholder="Select special date"
            className="[&_input]:bg-white"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">
            Title <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Sunday Special"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <SundayDishCard
            key={item.localId}
            item={item}
            index={index}
            onChange={onItemChange}
            onDelete={onDeleteItem}
            canDelete={items.length > 1}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddItem}
        className="press-scale w-full border border-dashed border-orange-300 bg-orange-50/60 rounded-xl py-2.5 text-[13px] text-orange-600 font-semibold flex items-center justify-center gap-1.5 active:bg-orange-100/60 transition-colors"
      >
        <Plus size={15} strokeWidth={2.5} />
        Add Dish
      </button>

      <div className="fixed bottom-16 left-0 right-0 z-40 px-3.5 pb-3 pt-2 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            disabled={submitting}
            onClick={onPreview}
            className="press-scale w-full h-11 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/25 disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating…
              </>
            ) : (
              "Preview Poster"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSundaySpecialView;
