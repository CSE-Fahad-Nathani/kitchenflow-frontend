import { CalendarDays } from "lucide-react";
import { formatDisplayDate } from "../utils/formatDate";

/**
 * Native date input that displays "15th July 2026".
 * value / onChange use YYYY-MM-DD.
 */
const DateInput = ({
  value = "",
  onChange,
  className = "",
  placeholder = "Select date",
  icon = true,
  min,
  max,
}) => {
  const label = value ? formatDisplayDate(value) : placeholder;

  return (
    <div className={`relative ${className}`}>
      {icon && (
        <CalendarDays
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-20"
        />
      )}

      {/* Custom visible text */}
      <div
        className={`absolute inset-0 z-10 flex items-center pointer-events-none text-[13px] font-medium ${
          icon ? "pl-9 pr-3" : "px-3"
        } ${value ? "text-gray-900" : "text-gray-400"}`}
      >
        <span className="truncate">{label}</span>
      </div>

      {/* Real date input — whole field is clickable via calendar indicator stretch */}
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange?.(e.target.value)}
        aria-label={placeholder}
        className={`relative w-full h-9 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer text-transparent caret-transparent [color-scheme:light] ${
          icon ? "pl-9 pr-3" : "px-3"
        } [&::-webkit-datetime-edit]:text-transparent [&::-webkit-datetime-edit]:p-0 [&::-webkit-datetime-edit-fields-wrapper]:p-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
      />
    </div>
  );
};

export default DateInput;
