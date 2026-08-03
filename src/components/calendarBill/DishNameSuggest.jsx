import { useMemo, useState } from "react";

/** Frontend-only dish name suggestions for Calendar Bill */
export const CALENDAR_DISH_SUGGESTIONS = [
  "Veg-Tiffin",
  "Mini Veg-Tiffin",
  "Non-Veg Tiffin",
  "Mini Non-Veg Tiffin",
  "Customized Tiffin",
  "Customized Veg-Tiffin",
  "Customized Non-Veg Tiffin",
  "Custom Menu",
];

const DishNameSuggest = ({
  value = "",
  onChange,
  placeholder = "e.g. Veg-Tiffin",
  className = "",
}) => {
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return CALENDAR_DISH_SUGGESTIONS;
    return CALENDAR_DISH_SUGGESTIONS.filter((name) =>
      name.toLowerCase().includes(q)
    );
  }, [value]);

  const exactMatch = CALENDAR_DISH_SUGGESTIONS.some(
    (name) => name.toLowerCase() === value.trim().toLowerCase()
  );

  const showList = open && filtered.length > 0 && !exactMatch;

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // allow click on suggestion before closing
          window.setTimeout(() => setOpen(false), 150);
        }}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
      />

      {showList ? (
        <div className="animate-dropdown absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-30 max-h-44 overflow-y-auto scrollbar-none">
          {filtered.map((name) => (
            <button
              key={name}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange?.(name);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-[12.5px] font-medium text-gray-700 active:bg-orange-50 border-b border-gray-50 last:border-0"
            >
              {name}
              {name.startsWith("Customized") || name === "Custom Menu" ? (
                <span className="ml-1.5 text-[10px] font-semibold text-amber-600">
                  custom
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {!value.trim() ? (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {CALENDAR_DISH_SUGGESTIONS.slice(0, 4).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onChange?.(name)}
              className="press-scale px-2 py-1 rounded-md text-[10.5px] font-semibold text-orange-700 bg-orange-50 border border-orange-100"
            >
              {name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default DishNameSuggest;
