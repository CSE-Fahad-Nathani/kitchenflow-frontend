import { useRef, useState } from "react";
import { Crop, ImagePlus, Trash2 } from "lucide-react";
import ImageCropModal from "./ImageCropModal";

const fieldClass =
  "w-full h-9 bg-gray-50 border border-gray-200 rounded-xl px-3 text-[13px] font-medium outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all";

const SundayDishCard = ({
  item,
  index,
  onChange,
  onDelete,
  canDelete = true,
  readOnly = false,
}) => {
  const fileRef = useRef(null);
  const [cropSrc, setCropSrc] = useState(null);

  const openPicker = () => {
    fileRef.current?.click();
  };

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const src = URL.createObjectURL(file);
    setCropSrc(src);
    e.target.value = "";
  };

  const handleCropCancel = () => {
    // Don't revoke if we're re-cropping an existing source still on the item
    if (cropSrc && cropSrc !== item.imageSource) {
      URL.revokeObjectURL(cropSrc);
    }
    setCropSrc(null);
  };

  const handleCropConfirm = (croppedUrl) => {
    if (item.imagePreview) {
      URL.revokeObjectURL(item.imagePreview);
    }
    if (item.imageSource) {
      URL.revokeObjectURL(item.imageSource);
    }

    onChange(index, {
      ...item,
      imageSource: cropSrc,
      imagePreview: croppedUrl,
    });
    setCropSrc(null);
  };

  const handleRecrop = () => {
    if (item.imageSource) {
      setCropSrc(item.imageSource);
      return;
    }
    openPicker();
  };

  const clearImage = () => {
    if (item.imagePreview) URL.revokeObjectURL(item.imagePreview);
    if (item.imageSource && item.imageSource !== item.imagePreview) {
      URL.revokeObjectURL(item.imageSource);
    }
    onChange(index, {
      ...item,
      imagePreview: null,
      imageSource: null,
    });
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md">
            Dish {index + 1}
          </span>

          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(index)}
              aria-label="Delete dish"
              className="press-scale w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 bg-rose-50 border border-rose-100"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <div className="mx-auto w-full max-w-[220px]">
          <button
            type="button"
            onClick={openPicker}
            className="relative block aspect-square w-full overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 active:bg-gray-100"
          >
            {item.imagePreview ? (
              <img
                src={item.imagePreview}
                alt={item.dish_name || `Dish ${index + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-gray-400">
                <ImagePlus size={28} />
                <span className="text-[12px] font-semibold">Add Image</span>
                <span className="text-[10px]">Crop to 300 × 300</span>
              </div>
            )}
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImagePick}
          />

          {item.imagePreview && (
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={handleRecrop}
                className="press-scale h-8 rounded-lg text-[11px] font-semibold text-orange-600 bg-orange-50 border border-orange-100 flex items-center justify-center gap-1"
              >
                <Crop size={12} />
                Re-crop
              </button>
              <button
                type="button"
                onClick={clearImage}
                className="press-scale h-8 rounded-lg text-[11px] font-semibold text-gray-500 bg-gray-50 border border-gray-200"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <input
          placeholder="Dish name"
          value={item.dish_name}
          readOnly={readOnly}
          onChange={(e) =>
            onChange(index, { ...item, dish_name: e.target.value })
          }
          className={`${fieldClass} ${readOnly ? "bg-gray-50 text-gray-700" : ""}`}
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="Quantity (e.g. 1 Kg)"
            value={item.quantity}
            readOnly={readOnly}
            onChange={(e) =>
              onChange(index, { ...item, quantity: e.target.value })
            }
            className={`${fieldClass} ${readOnly ? "bg-gray-50 text-gray-700" : ""}`}
          />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
              ₹
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              placeholder="Price"
              value={item.price}
              readOnly={readOnly}
              onChange={(e) =>
                onChange(index, { ...item, price: e.target.value })
              }
              className={`${fieldClass} pl-7 ${readOnly ? "bg-gray-50 text-gray-700" : ""}`}
            />
          </div>
        </div>

        <input
          placeholder="Note (optional)"
          value={item.note}
          readOnly={readOnly}
          onChange={(e) => onChange(index, { ...item, note: e.target.value })}
          className={`${fieldClass} ${readOnly ? "bg-gray-50 text-gray-700" : ""}`}
        />
      </div>

      <ImageCropModal
        open={!!cropSrc}
        imageSrc={cropSrc}
        onCancel={handleCropCancel}
        onConfirm={handleCropConfirm}
      />
    </>
  );
};

export default SundayDishCard;
