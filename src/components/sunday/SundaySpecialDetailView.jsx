import { Loader2, Image as ImageIcon } from "lucide-react";
import SundayDishCard from "./SundayDishCard";

const formatDetailDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const SundaySpecialDetailView = ({
  loading,
  special,
  items,
  onItemChange,
  onPreview,
  onDelete,
  deleting,
}) => {
  if (loading) {
    return (
      <div className="px-3.5 py-16 flex justify-center text-gray-400">
        <Loader2 size={28} className="animate-spin" />
      </div>
    );
  }

  if (!special) {
    return (
      <div className="px-3.5 py-8 text-center text-[13px] text-gray-500">
        Special not found
      </div>
    );
  }

  return (
    <div className="px-3.5 py-3 space-y-2.5 pb-28">
      <div className="bg-white rounded-xl border border-gray-100 p-3">
        <p className="text-[11px] font-semibold text-orange-600 uppercase tracking-wide">
          {special.title || "Sunday Special"}
        </p>
        <p className="text-[15px] font-bold text-gray-900 mt-0.5">
          {formatDetailDate(special.special_date)}
        </p>
        <p className="text-[12px] text-gray-500 mt-1.5 flex items-center gap-1.5">
          <ImageIcon size={13} />
          Add images below to generate a poster (frontend only)
        </p>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <SundayDishCard
            key={item.localId || item.item_id}
            item={item}
            index={index}
            onChange={onItemChange}
            onDelete={() => {}}
            canDelete={false}
            readOnly
          />
        ))}
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-40 px-3.5 pb-3 pt-2 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent">
        <div className="max-w-md mx-auto flex gap-2">
          <button
            type="button"
            disabled={deleting}
            onClick={onDelete}
            className="press-scale flex-1 h-11 rounded-xl text-[13px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 active:bg-rose-100 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
          <button
            type="button"
            onClick={onPreview}
            className="press-scale flex-[1.4] h-11 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/25"
          >
            Preview Poster
          </button>
        </div>
      </div>
    </div>
  );
};

export default SundaySpecialDetailView;
